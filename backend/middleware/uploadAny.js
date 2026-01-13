import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "/tmp");
  },
  filename: (req, file, cb) => {
    // preserve original filename
    cb(null, Date.now() + "_" + file.originalname.replace(/[^A-Za-z0-9._-]/g, "_"));
  }
});

export default multer({ storage });
