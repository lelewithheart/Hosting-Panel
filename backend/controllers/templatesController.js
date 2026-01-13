import path from "path";
import AdmZip from "adm-zip";
import fs from "fs";

function templateDir(lang) {
  const base = "/srv/panel/backend/templates";
  if (lang === "python") return path.join(base, "python");
  return path.join(base, "node");
}

export const downloadZip = async (req, res) => {
  try {
    const { lang } = req.params;
    const dir = templateDir(lang);
    if (!fs.existsSync(dir)) return res.status(404).json({ error: "Not found" });
    const zip = new AdmZip();
    const entries = await fs.promises.readdir(dir);
    for (const name of entries) {
      const full = path.join(dir, name);
      const st = await fs.promises.stat(full);
      if (st.isDirectory()) {
        zip.addLocalFolder(full, name);
      } else {
        zip.addLocalFile(full);
      }
    }
    const buf = zip.toBuffer();
    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", `attachment; filename=${lang}-template.zip`);
    res.end(buf);
  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
};
