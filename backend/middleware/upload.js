import multer from "multer";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "/tmp"); // temporary upload location
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + ".zip");
  }
});

export default multer({ storage });
