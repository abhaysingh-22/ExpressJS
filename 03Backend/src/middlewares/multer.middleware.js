import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {       //request to user ki hoti h and file multer k pass hoti h and cb callback hota h jo multer ko batata h ki file kahan save karni h
    cb(null, "./public/temp")
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.originalname) // file.originalname is the name of the file uploaded by the user
  }
})

export const upload = multer({
    storage: storage
});