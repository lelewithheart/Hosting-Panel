import Docker from 'dockerode';
import tar from 'tar-fs';
import path from 'path';

const docker = new Docker();

export const start = async (name) => {
  const container = docker.getContainer(name);
  await container.start();
};

export const stop = async (name, timeoutSec = null) => {
  const container = docker.getContainer(name);
  await container.stop({ t: timeoutSec });
};

export const kill = async (name) => {
  const container = docker.getContainer(name);
  await container.kill();
};

export const remove = async (name) => {
  const container = docker.getContainer(name);
  await container.remove({ force: true });
};

export const logs = async (name) => {
  const container = docker.getContainer(name);
  const logStream = await container.logs({
    stdout: true,
    stderr: true,
    tail: 200,
    follow: false
  });
  return logStream.toString();
};

export const status = async (name) => {
  try {
    const container = docker.getContainer(name);
    const info = await container.inspect();
    return info.State.Status;
  } catch {
    return 'not_created';
  }
};

export const build = async (name, folder) => {
  // Pack the build context into a tar stream to avoid dockerode util errors
  const pack = tar.pack(folder, {
    ignore: (p) => {
      const rel = p.startsWith(folder) ? p.slice(folder.length) : p;
      // Exclude node_modules and uploaded archives
      if (rel.includes(`${path.sep}node_modules${path.sep}`) || rel.endsWith(`${path.sep}node_modules`)) return true;
      if (rel.endsWith(`${path.sep}bot.zip`) || rel.endsWith('.zip')) return true;
      return false;
    }
  });
  const stream = await docker.buildImage(pack, { t: name, dockerfile: 'Dockerfile' });
  await new Promise((resolve, reject) => {
    docker.modem.followProgress(stream, (err, res) => err ? reject(err) : resolve(res));
  });
};

export const runWithLimits = async (name, image, cpu, ram) => {
  // Deprecated in favor of runGuaranteed/runShared; keep for compatibility.
  const toBytes = (val) => {
    if (typeof val === 'number') return val;
    const m = String(val).toLowerCase().match(/^(\d+(?:\.\d+)?)([kmgt]?)(b)?$/);
    if (!m) return 256 * 1024 * 1024; // default 256m
    const num = parseFloat(m[1]);
    const unit = m[2];
    const pow = unit === 'k' ? 1 : unit === 'm' ? 2 : unit === 'g' ? 3 : unit === 't' ? 4 : 0;
    return Math.round(num * Math.pow(1024, pow));
  };
  const nanoCpus = Math.round((cpu || 0.1) * 1e9);
  const memBytes = toBytes(ram || '256m');
  const container = await docker.createContainer({
    Image: image,
    name,
    HostConfig: {
      NanoCpus: nanoCpus,
      Memory: memBytes,
      MemorySwap: memBytes,
    },
  });
  await container.start();
};

export const runGuaranteed = async (name, image, cpu, ram, cmd = null, entrypoint = null) => {
  const toBytes = (val) => {
    if (typeof val === 'number') return val;
    const m = String(val).toLowerCase().match(/^(\d+(?:\.\d+)?)([kmgt]?)(b)?$/);
    if (!m) return 256 * 1024 * 1024;
    const num = parseFloat(m[1]);
    const unit = m[2];
    const pow = unit === 'k' ? 1 : unit === 'm' ? 2 : unit === 'g' ? 3 : unit === 't' ? 4 : 0;
    return Math.round(num * Math.pow(1024, pow));
  };
  const nanoCpus = Math.round((cpu || 0.1) * 1e9);
  const memBytes = toBytes(ram || '256m');
  const container = await docker.createContainer({
    Image: image,
    name,
    Cmd: Array.isArray(cmd) ? cmd : undefined,
    Entrypoint: Array.isArray(entrypoint) ? entrypoint : undefined,
    HostConfig: {
      NanoCpus: nanoCpus,
      Memory: memBytes,
      MemorySwap: memBytes, // hard limit
    },
  });
  await container.start();
};

export const runShared = async (name, image, cpu, ram, cmd = null, entrypoint = null) => {
  const toBytes = (val) => {
    if (typeof val === 'number') return val;
    const m = String(val).toLowerCase().match(/^(\d+(?:\.\d+)?)([kmgt]?)(b)?$/);
    if (!m) return 256 * 1024 * 1024;
    const num = parseFloat(m[1]);
    const unit = m[2];
    const pow = unit === 'k' ? 1 : unit === 'm' ? 2 : unit === 'g' ? 3 : unit === 't' ? 4 : 0;
    return Math.round(num * Math.pow(1024, pow));
  };
  const nanoCpus = Math.round((cpu || 0.1) * 1e9);
  const memBytes = toBytes(ram || '256m');
  const swapBytes = 2 * 1024 * 1024 * 1024; // 2g
  const container = await docker.createContainer({
    Image: image,
    name,
    Cmd: Array.isArray(cmd) ? cmd : undefined,
    Entrypoint: Array.isArray(entrypoint) ? entrypoint : undefined,
    HostConfig: {
      NanoCpus: nanoCpus,
      Memory: memBytes,
      MemorySwap: swapBytes, // soft limit with swap allowance
    },
  });
  await container.start();
};
