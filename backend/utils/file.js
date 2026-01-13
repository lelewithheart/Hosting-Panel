import fs from "fs";
import { exec } from "child_process";

export default {
  ensureDir: (path) => fs.mkdirSync(path, { recursive: true }),

  unzip: (zipPath, dest) =>
    new Promise((resolve, reject) => {
      const cmd = `unzip -o "${zipPath}" -d "${dest}"`;
      exec(cmd, (err) => {
        if (err) reject(err.message || "Unzip failed");
        else resolve();
      });
    }),

  exists: (path) => fs.existsSync(path),
};
