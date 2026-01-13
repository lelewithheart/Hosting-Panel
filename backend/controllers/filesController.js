import fs from "fs";
import path from "path";

function basePath(userid, botid) {
  return `/srv/panel/bots/${userid}/${botid}`;
}

function resolveBotPath(userid, botid, targetPath = "") {
  const base = basePath(userid, botid);
  const full = path.normalize(path.join(base, targetPath || "."));
  if (!full.startsWith(base)) throw new Error("Invalid path");
  return full;
}

export const list = async (req, res) => {
  try {
    const userid = req.user?.id;
    const { botid } = req.query;
    const dir = req.query.path || ".";
    const abs = resolveBotPath(userid, botid, dir);
    const entries = await fs.promises.readdir(abs, { withFileTypes: true });
    const items = await Promise.all(
      entries.map(async (ent) => {
        const p = path.join(abs, ent.name);
        const st = await fs.promises.stat(p);
        return {
          name: ent.name,
          isDir: ent.isDirectory(),
          size: st.size,
          mtime: st.mtimeMs,
        };
      })
    );
    res.json({ path: dir, items });
  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
};

export const get = async (req, res) => {
  try {
    const userid = req.user?.id;
    const { botid, path: rel } = req.query;
    const abs = resolveBotPath(userid, botid, rel);
    const st = await fs.promises.stat(abs);
    if (st.isDirectory()) return res.status(400).json({ error: "Path is a directory" });
    const content = await fs.promises.readFile(abs, "utf8");
    res.json({ path: rel, content });
  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
};

export const save = async (req, res) => {
  try {
    const userid = req.user?.id;
    const { botid, path: rel, content } = req.body;
    const abs = resolveBotPath(userid, botid, rel);
    await fs.promises.mkdir(path.dirname(abs), { recursive: true });
    await fs.promises.writeFile(abs, content ?? "", "utf8");
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
};

export const del = async (req, res) => {
  try {
    const userid = req.user?.id;
    const { botid, path: rel } = req.body;
    const abs = resolveBotPath(userid, botid, rel);
    await fs.promises.rm(abs, { force: true, recursive: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
};

export const download = async (req, res) => {
  try {
    const userid = req.user?.id;
    const { botid, path: rel } = req.query;
    const abs = resolveBotPath(userid, botid, rel);
    res.download(abs, path.basename(abs));
  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
};

export const upload = async (req, res) => {
  try {
    const userid = req.user?.id;
    const { botid } = req.body;
    const relDir = req.body.path || ".";
    if (!req.file) return res.status(400).json({ error: "No file" });
    const destDir = resolveBotPath(userid, botid, relDir);
    await fs.promises.mkdir(destDir, { recursive: true });
    const destPath = path.join(destDir, req.file.originalname);
    await fs.promises.rename(req.file.path, destPath);
    res.json({ success: true, name: req.file.originalname });
  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
};

export const mkdir = async (req, res) => {
  try {
    const userid = req.user?.id;
    const { botid, path: rel } = req.body;
    const abs = resolveBotPath(userid, botid, rel);
    await fs.promises.mkdir(abs, { recursive: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
};

export const create = async (req, res) => {
  try {
    const userid = req.user?.id;
    const { botid, path: rel, content } = req.body;
    const abs = resolveBotPath(userid, botid, rel);
    await fs.promises.mkdir(path.dirname(abs), { recursive: true });
    await fs.promises.writeFile(abs, content ?? "", "utf8");
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
};

export const rename = async (req, res) => {
  try {
    const userid = req.user?.id;
    const { botid, from, to } = req.body;
    const absFrom = resolveBotPath(userid, botid, from);
    const absTo = resolveBotPath(userid, botid, to);
    await fs.promises.mkdir(path.dirname(absTo), { recursive: true });
    await fs.promises.rename(absFrom, absTo);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
};
