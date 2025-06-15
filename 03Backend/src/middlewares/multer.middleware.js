import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp");
  },
  filename: function (req, file, cb) {
    // const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    // const ext = path.extname(file.originalname);
    // const base = path.basename(file.originalname, ext);
    // cb(null, base + '-' + uniqueSuffix + ext);

    cb(null, file.originalname)
  }
});

export const upload = multer({
  storage
});