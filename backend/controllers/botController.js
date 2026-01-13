import * as docker from "../utils/docker.js";
import fs from "fs";
import path from "path";
import fileUtil from "../utils/file.js";
import Joi from "joi";
import { prisma } from "../utils/prisma.js";

function detectLanguage(folder) {
  if (fs.existsSync(path.join(folder, "package.json"))) return "node";
  if (fs.existsSync(path.join(folder, "requirements.txt"))) return "python";
  try {
    const entries = fs.readdirSync(folder);
    if (entries.some((n) => n.endsWith(".py"))) return "python";
  } catch {}
  return "node";
}

function dockerfileFor(lang) {
  if (lang === "python") {
    return (
      `FROM python:3.11-slim\n\nWORKDIR /app\n\n# Copy project files\nCOPY . .\n\n# Install deps only if requirements.txt exists\nRUN if [ -f requirements.txt ]; then pip install --no-cache-dir -r requirements.txt; fi\n\n# Prefer main.py or app.py; else create a fallback main.py\nCMD ["sh", "-c", "if [ -f main.py ]; then python main.py; elif [ -f app.py ]; then python app.py; else printf \"print('Bot running')\\nimport time\\ntime.sleep(10**9)\\n\" > main.py; python main.py; fi"]\n`
    );
  }
  // default node
  return (
    `FROM node:18-alpine\n\nWORKDIR /app\n\n# Copy project files\nCOPY . .\n\n# Install deps only if package.json exists\nRUN if [ -f package.json ]; then npm ci --omit=dev || npm install --only=prod; fi\n\n# Try building TypeScript if present (non-fatal)\nRUN if [ -f tsconfig.json ]; then npm run build || true; fi\n\n# Simple, reliable entrypoint for Node bots\nCMD ["node", "index.js"]\n`
  );
}

const plans = {
  nano: {
    standard: { cpu: 0.1, ram: "128m", reserved: false },
    premium: { cpu: 0.1, ram: "128m", reserved: true },
  },
  basic: {
    standard: { cpu: 0.25, ram: "256m", reserved: false },
    premium: { cpu: 0.25, ram: "256m", reserved: true },
  },
  pro: {
    standard: { cpu: 0.5, ram: "512m", reserved: false },
    premium: { cpu: 0.5, ram: "512m", reserved: true },
  },
};

const ramUpgradeMapMb = {
  "128": 128,
  "256": 256,
  "512": 512,
  "1024": 1024,
};

function ramToMb(ramStr) {
  const m = String(ramStr || "").toLowerCase().match(/^(\d+(?:\.\d+)?)([kmgt]?)/);
  if (!m) return 0;
  const num = parseFloat(m[1]);
  const unit = m[2];
  const factor = unit === "k" ? 1 / 1024 : unit === "m" ? 1 : unit === "g" ? 1024 : unit === "t" ? 1024 * 1024 : 1;
  return num * factor;
}

function mbToRamString(mb) {
  return `${Math.max(16, Math.round(mb))}m`;
}

const PREMIUM_POOL = {
  ramBytes: 6 * 1024 * 1024 * 1024, // 6 GB
  cpuCores: 4, // 50% of 8 vCPU
};

function sumPremiumUsage(userFolder) {
  let ram = 0;
  let cpu = 0;
  if (!fs.existsSync(userFolder)) return { ram, cpu };
  for (const bid of fs.readdirSync(userFolder)) {
    try {
      const meta = JSON.parse(fs.readFileSync(`${userFolder}/${bid}/meta.json`, 'utf8'));
      const type = (meta.planType || 'nano');
      const tier = (meta.tier || 'standard');
      if (tier === 'premium' && plans[type]) {
        const p = plans[type].premium;
        const toBytes = (val) => {
          const m = String(val).toLowerCase().match(/^(\d+(?:\.\d+)?)([kmgt]?)(b)?$/);
          if (!m) return 0;
          const num = parseFloat(m[1]);
          const unit = m[2];
          const pow = unit === 'k' ? 1 : unit === 'm' ? 2 : unit === 'g' ? 3 : unit === 't' ? 4 : 0;
          return Math.round(num * Math.pow(1024, pow));
        };
        ram += toBytes(p.ram);
        cpu += p.cpu;
      }
    } catch {}
  }
  return { ram, cpu };
}

export const startBot = async (req, res) => {
  try {
    const schema = Joi.object({ botid: Joi.string().required() });
    const { error, value } = schema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { botid } = value;
    const userid = req.user.id;
    const name = `bot_${userid}_${botid}`;
    const image = name;

    const metaPath = `/srv/panel/bots/${userid}/${botid}/meta.json`;
    let planType = 'nano';
    let tier = 'standard';
    try {
      const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
      planType = meta.planType || meta.plan || 'nano';
      tier = meta.tier || 'standard';
    } catch {}
    const spec = (plans[planType] || plans.nano)[tier] || plans.nano.standard;

    // Apply assigned RAM upgrades for this bot
    try {
      const assignments = await prisma.botUpgradeAssignment.findMany({
        where: { userId: userid, botId: Number(botid), kind: "ram", active: true }
      });
      const extraMb = assignments.reduce((sum, a) => {
        const mb = ramUpgradeMapMb[String(a.sku)] || 0;
        return sum + mb * (a.quantity || 1);
      }, 0);
      if (extraMb > 0) {
        const baseMb = ramToMb(spec.ram || "128m");
        spec.ram = mbToRamString(baseMb + extraMb);
      }
    } catch {}

    // If already running, return
    const status = await docker.status(name);
    if (status === 'running') return res.json({ success: true, status });

    // Ensure a clean slate for the new run
    if (status !== 'not_created') { try { await docker.remove(name); } catch {} }

    const userFolder = `/srv/panel/bots/${userid}/${botid}`;
    await fs.promises.mkdir(userFolder, { recursive: true });

    // Decide a safe command to run to avoid shell parsing issues
    const detectedLang = detectLanguage(userFolder);
    const safeCmd = detectedLang === 'python' ? ['python','main.py'] : ['node','index.js'];
    const overrideEntrypoint = [];

    // First attempt: run with current image
    try {
      if (spec.reserved) await docker.runGuaranteed(name, image, spec.cpu, spec.ram, safeCmd, overrideEntrypoint);
      else await docker.runShared(name, image, spec.cpu, spec.ram, safeCmd, overrideEntrypoint);
    } catch {
      // Build image then retry
      const lang = detectLanguage(userFolder);
      await fs.promises.writeFile(path.join(userFolder, 'Dockerfile'), dockerfileFor(lang));
      if (lang === 'node' && !fs.existsSync(path.join(userFolder, 'index.js'))) {
        await fs.promises.writeFile(path.join(userFolder, 'index.js'), "console.log('Bot running'); setInterval(function(){}, 1000000000);\n");
      }
      await docker.build(image, userFolder);
      if (spec.reserved) await docker.runGuaranteed(name, image, spec.cpu, spec.ram, safeCmd, overrideEntrypoint);
      else await docker.runShared(name, image, spec.cpu, spec.ram, safeCmd, overrideEntrypoint);
    }

    // Verify after a short delay to avoid flapping states
    await new Promise((r) => setTimeout(r, 500));
    let finalStatus = await docker.status(name);
    if (finalStatus === 'running') return res.json({ success: true, status: 'running' });
    try { await docker.remove(name); } catch {}
    const lang2 = detectLanguage(userFolder);
    await fs.promises.writeFile(path.join(userFolder, 'Dockerfile'), dockerfileFor(lang2));
    if (lang2 === 'node' && !fs.existsSync(path.join(userFolder, 'index.js'))) {
      await fs.promises.writeFile(path.join(userFolder, 'index.js'), "console.log('Bot running'); setInterval(function(){}, 1000000000);\n");
    }
    await docker.build(image, userFolder);
    if (spec.reserved) await docker.runGuaranteed(name, image, spec.cpu, spec.ram, safeCmd, overrideEntrypoint);
    else await docker.runShared(name, image, spec.cpu, spec.ram, safeCmd, overrideEntrypoint);
    await new Promise((r) => setTimeout(r, 500));
    finalStatus = await docker.status(name);
    if (finalStatus === 'running') return res.json({ success: true, status: 'running' });

    let logs = '';
    try { logs = await docker.logs(name); } catch {}
    return res.status(500).json({ success: false, status: finalStatus, error: 'Container exited', logs });
  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
};

export const stopBot = async (req, res) => {
  const { botid, force, timeout, remove } = req.body;
  const userid = req.user.id;
  const containerName = `bot_${userid}_${botid}`;
  try {
    if (force) {
      await docker.kill(containerName);
    } else {
      const t = Number.isFinite(Number(timeout)) ? Number(timeout) : undefined;
      await docker.stop(containerName, t);
    }
    if (remove) {
      try { await docker.remove(containerName); } catch {}
    }
    res.json({ success: true });
  } catch (err) {
    res.json({ success: false, error: err.toString() });
  }
};

export const getLogs = async (req, res) => {
  const { botid } = req.body;
  const userid = req.user.id;
  const containerName = `bot_${userid}_${botid}`;
  try {
    const logs = await docker.logs(containerName);
    res.json({ success: true, logs });
  } catch (err) {
    res.json({ success: false, error: err.toString() });
  }
};

export const deployBot = async (req, res) => {
  try {
    const { userid, botid } = req.body;

    const userFolder = `/srv/panel/bots/${userid}/${botid}`;
    const imageName = `bot_${userid}_${botid}`;
    const containerName = imageName;

    await fs.promises.mkdir(userFolder, { recursive: true });

    if (!fs.existsSync(path.join(userFolder, "Dockerfile"))) {
      const lang = detectLanguage(userFolder);
      await fs.promises.writeFile(
        path.join(userFolder, "Dockerfile"),
        dockerfileFor(lang)
      );
      if (lang === "node" && !fs.existsSync(path.join(userFolder, "index.js"))) {
        await fs.promises.writeFile(
          path.join(userFolder, "index.js"),
          'console.log("Bot running"); setInterval(()=>{},1000)'
        );
      }
    }

    await docker.build(imageName, userFolder);

    try {
      await docker.remove(containerName);
    } catch {}

    let planType = 'nano';
    let tier = 'standard';
    try {
      const meta = JSON.parse(fs.readFileSync(path.join(userFolder, 'meta.json'), 'utf8'));
      planType = meta.planType || meta.plan || 'nano';
      tier = meta.tier || 'standard';
    } catch {}
    const spec = (plans[planType] || plans.nano)[tier] || plans.nano.standard;
    if (spec.reserved) {
      await docker.runGuaranteed(containerName, imageName, spec.cpu, spec.ram);
    } else {
      await docker.runShared(containerName, imageName, spec.cpu, spec.ram);
    }
    res.json({ success: true });
  } catch (err) {
    res.json({ success: false, error: err.toString() });
  }
};

export const uploadBot = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: "Keine Datei erhalten" });
    }

    const userid = req.user?.id;
    const { botid } = req.body;
    if (!userid || !botid) {
      return res.status(400).json({ success: false, error: "botid fehlt oder Benutzer nicht authentifiziert" });
    }

    const botFolder = `/srv/panel/bots/${userid}/${botid}`;
    fileUtil.ensureDir(botFolder);

    const zipPath = req.file.path;
    const zipDest = `${botFolder}/bot.zip`;
    fs.renameSync(zipPath, zipDest);

    await fileUtil.unzip(zipDest, botFolder);

    // If ZIP extracted to a single meaningful subfolder, flatten it into botFolder
    let buildContext = botFolder;
    const isMeta = (name) => name === "bot.zip" || name === "__MACOSX" || name === ".DS_Store" || name === "Thumbs.db" || name === "desktop.ini";
    const rootEntries = fs.readdirSync(botFolder);
    const visible = rootEntries.filter((n) => !isMeta(n) && !n.startsWith("."));
    const dirCandidates = visible.filter((n) => {
      try { return fs.statSync(path.join(botFolder, n)).isDirectory(); } catch { return false; }
    });
    const fileCandidates = visible.filter((n) => {
      try { return fs.statSync(path.join(botFolder, n)).isFile(); } catch { return false; }
    });

    if (dirCandidates.length === 1 && fileCandidates.length === 0) {
      const srcDir = path.join(botFolder, dirCandidates[0]);
      const inner = fs.readdirSync(srcDir);
      for (const entry of inner) {
        const from = path.join(srcDir, entry);
        const to = path.join(botFolder, entry);
        await fs.promises.cp(from, to, { recursive: true, force: true });
      }
      await fs.promises.rm(srcDir, { recursive: true, force: true });
    }

    // Clean up common metadata dirs/files that may have been extracted
    for (const meta of ["__MACOSX", ".DS_Store", "Thumbs.db", "desktop.ini"]) {
      const p = path.join(botFolder, meta);
      if (fs.existsSync(p)) {
        try { await fs.promises.rm(p, { recursive: true, force: true }); } catch {}
      }
    }

    // Ensure Dockerfile exists at root
    if (!fs.existsSync(path.join(botFolder, "Dockerfile"))) {
      const langUp = detectLanguage(botFolder);
      await fs.promises.writeFile(
        path.join(botFolder, "Dockerfile"),
        dockerfileFor(langUp)
      );
      if (langUp === "node" && !fs.existsSync(path.join(botFolder, "index.js"))) {
        await fs.promises.writeFile(path.join(botFolder, "index.js"), 'console.log("Bot running"); setInterval(()=>{},1000)');
      }
    }
    buildContext = botFolder;

    // Ensure robust Dockerfile based on detected language
    const langCtx = detectLanguage(buildContext);
    await fs.promises.writeFile(
      path.join(buildContext, "Dockerfile"),
      dockerfileFor(langCtx)
    );

    // Add a .dockerignore to skip the uploaded zip
    try {
      await fs.promises.writeFile(path.join(buildContext, ".dockerignore"), "bot.zip\nnode_modules\n");
    } catch {}

    const imageName = `bot_${userid}_${botid}`;
    try {
      // Add a .dockerignore to skip the uploaded zip and node_modules
      try {
        await fs.promises.writeFile(path.join(buildContext, ".dockerignore"), "bot.zip\nnode_modules\n");
      } catch {}
      await docker.build(imageName, buildContext);
    } catch (err) {
      console.error("Docker build failed:", err);
      throw err;
    }

    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.toString() });
  }
};

export const getStatus = async (req, res) => {
  const { userid, botid } = req.body;
  const name = `bot_${userid}_${botid}`;
  try {
    const status = await docker.status(name);
    res.json({ status });
  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
};

export const restartBot = async (req, res) => {
  try {
    const { botid } = req.body;
    const userid = req.user.id;
    const name = `bot_${userid}_${botid}`;
    try { await docker.stop(name, 2); } catch {}
    try { await docker.remove(name); } catch {}
    const metaPath = `/srv/panel/bots/${userid}/${botid}/meta.json`;
    let planType = 'nano';
    let tier = 'standard';
    try { const m = JSON.parse(fs.readFileSync(metaPath, 'utf8')); planType = m.planType || m.plan || 'nano'; tier = m.tier || 'standard'; } catch {}
    const spec = (plans[planType] || plans.nano)[tier] || plans.nano.standard;
    // Detect language and use safe command override to avoid broken image CMD
    const botFolder = `/srv/panel/bots/${userid}/${botid}`;
    const lang = detectLanguage(botFolder);
    const safeCmd = lang === 'python' ? ['python','main.py'] : ['node','index.js'];
    const overrideEntrypoint = [];
    if (spec.reserved) {
      await docker.runGuaranteed(name, name, spec.cpu, spec.ram, safeCmd, overrideEntrypoint);
    } else {
      await docker.runShared(name, name, spec.cpu, spec.ram, safeCmd, overrideEntrypoint);
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
};

export const upgradeBot = async (req, res) => {
  try {
    const { botid, newPlanType, newTier } = req.body;
    const userid = req.user.id;
    const type = newPlanType || 'nano';
    const tier = newTier || 'standard';
    if (!['nano','basic','pro'].includes(type) || !['standard','premium'].includes(tier)) {
      return res.status(400).json({ error: "Invalid plan/tier" });
    }

    // Enforce quota: admins bypass, others must have available entitlement for newPlan
    const userFolder = `/srv/panel/bots/${userid}`;
    if (!req.user?.isAdmin) {
      const subs = await prisma.subscription.findMany({ where: { userId: userid, active: true, plan: type } });
      const entitlement = subs.reduce((sum, s) => sum + (s.quantity || 1), 0);
      let used = 0;
      if (fs.existsSync(userFolder)) {
        for (const bid of fs.readdirSync(userFolder)) {
          try {
            const meta = JSON.parse(fs.readFileSync(`${userFolder}/${bid}/meta.json`, 'utf8'));
            if ((meta.planType || meta.plan || 'nano') === type) used++;
          } catch {}
        }
      }
      // Include this bot only if already on newPlan? We count used excluding this bot if currently same plan
      try {
        const currentMeta = JSON.parse(fs.readFileSync(`${userFolder}/${botid}/meta.json`, 'utf8'));
        if ((currentMeta.planType || currentMeta.plan || 'nano') === type) {
          // No change in usage; allow
        } else if (used >= entitlement) {
          return res.status(403).json({ error: `Quota exceeded for plan ${type}` });
        }
      } catch {
        if (used >= entitlement) {
          return res.status(403).json({ error: `Quota exceeded for plan ${type}` });
        }
      }
    }

    const name = `bot_${userid}_${botid}`;
    try { await docker.stop(name, 2); } catch {}
    try { await docker.remove(name); } catch {}
    const spec = (plans[type] || plans.nano)[tier] || plans.nano.standard;
    if (tier === 'premium') {
      // Check premium pool capacity
      const { ram, cpu } = sumPremiumUsage(userFolder);
      const toBytes = (val) => { const m = String(val).toLowerCase().match(/^(\d+(?:\.\d+)?)([kmgt]?)(b)?$/); if (!m) return 0; const num = parseFloat(m[1]); const unit = m[2]; const pow = unit === 'k' ? 1 : unit === 'm' ? 2 : unit === 'g' ? 3 : unit === 't' ? 4 : 0; return Math.round(num * Math.pow(1024, pow)); };
      const nextRam = ram + toBytes(spec.ram);
      const nextCpu = cpu + spec.cpu;
      if (nextRam > PREMIUM_POOL.ramBytes || nextCpu > PREMIUM_POOL.cpuCores) {
        return res.status(403).json({ error: "Premium pool capacity exceeded" });
      }
    }
    if (spec.reserved) {
      await docker.runGuaranteed(name, name, spec.cpu, spec.ram);
    } else {
      await docker.runShared(name, name, spec.cpu, spec.ram);
    }
    // Persist plan in meta
    const metaPath = `/srv/panel/bots/${userid}/${botid}/meta.json`;
    try {
      const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
      meta.planType = type;
      meta.tier = tier;
      fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2));
    } catch {}
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
};

export const renameBot = async (req, res) => {
  try {
    const { botid, newName } = req.body;
    const userid = req.user.id;
    const botFolder = `/srv/panel/bots/${userid}/${botid}`;
    const metaPath = `${botFolder}/meta.json`;
    if (fs.existsSync(metaPath)) {
      const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
      meta.name = newName;
      fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2));
      res.json({ success: true });
    } else {
      res.status(404).json({ error: "Bot not found" });
    }
  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
};

export const deleteBot = async (req, res) => {
  try {
    const { botid } = req.body;
    const userid = req.user.id;
    const name = `bot_${userid}_${botid}`;
    const botFolder = `/srv/panel/bots/${userid}/${botid}`;
    try { await docker.stop(name, 2); } catch {}
    try { await docker.remove(name); } catch {}
    if (fs.existsSync(botFolder)) {
      fs.rmSync(botFolder, { recursive: true, force: true });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
};

export const listBots = async (req, res) => {
  try {
    const userid = req.user.id;

    const userFolder = `/srv/panel/bots/${userid}`;
    if (!fs.existsSync(userFolder)) {
      return res.json({ bots: [] });
    }

    const botIds = fs.readdirSync(userFolder);

    const bots = [];
    for (const botid of botIds) {
      const name = `bot_${userid}_${botid}`;
      const status = await docker.status(name);

      let plan = 'nano';
      let tier = 'standard';
      const metaPath = `${userFolder}/${botid}/meta.json`;
      try { const m = JSON.parse(fs.readFileSync(metaPath, 'utf8')); plan = m.planType || m.plan || 'nano'; tier = m.tier || 'standard'; } catch {}
      bots.push({ botid, status, name, plan, tier });
    }

    res.json({ bots });
  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
};

export const createBot = async (req, res) => {
  try {
    const schema = Joi.object({
      name: Joi.string().allow('').optional(),
      planType: Joi.string().valid('nano', 'basic', 'pro').default('nano'),
      tier: Joi.string().valid('standard', 'premium').default('standard'),
    });
    const { error, value } = schema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });
    const { name, planType, tier } = value;
    const userid = req.user.id;

    const userFolder = `/srv/panel/bots/${userid}`;
    if (!fs.existsSync(userFolder)) {
      fs.mkdirSync(userFolder, { recursive: true });
    }

    // Quota enforcement: admins bypass, others must have entitlements
    if (!req.user?.isAdmin) {
      const subs = await prisma.subscription.findMany({ where: { userId: userid, active: true, plan: planType } });
      const entitlement = subs.reduce((sum, s) => sum + (s.quantity || 1), 0);
      let used = 0;
      const existingDirs = fs.readdirSync(userFolder);
      for (const dir of existingDirs) {
        try {
          const meta = JSON.parse(fs.readFileSync(`${userFolder}/${dir}/meta.json`, 'utf8'));
          if ((meta.planType || meta.plan || 'nano') === planType) used++;
        } catch {}
      }
      if (used >= entitlement) {
        return res.status(403).json({ error: `Quota exceeded for plan ${planType}` });
      }
    }

    // Check premium pool capacity if requested
    if (tier === 'premium') {
      const { ram, cpu } = sumPremiumUsage(userFolder);
      const spec = (plans[planType] || plans.nano).premium;
      const toBytes = (val) => { const m = String(val).toLowerCase().match(/^(\d+(?:\.\d+)?)([kmgt]?)(b)?$/); if (!m) return 0; const num = parseFloat(m[1]); const unit = m[2]; const pow = unit === 'k' ? 1 : unit === 'm' ? 2 : unit === 'g' ? 3 : unit === 't' ? 4 : 0; return Math.round(num * Math.pow(1024, pow)); };
      const nextRam = ram + toBytes(spec.ram);
      const nextCpu = cpu + spec.cpu;
      if (nextRam > PREMIUM_POOL.ramBytes || nextCpu > PREMIUM_POOL.cpuCores) {
        return res.status(403).json({ error: "Premium pool capacity exceeded" });
      }
    }

    // Neue Bot-ID generieren
    const existing = fs.readdirSync(userFolder);
    const newId = existing.length === 0
      ? 1
      : Math.max(...existing.map(Number)) + 1;

    const botFolder = `${userFolder}/${newId}`;
    fs.mkdirSync(botFolder);

    // Optional: metadata speichern
    const meta = {
      name: name || `Bot ${newId}`,
      planType,
      tier,
      created: Date.now(),
    };

    fs.writeFileSync(`${botFolder}/meta.json`, JSON.stringify(meta, null, 2));

    res.json({ success: true, botid: newId, meta });
  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
};
