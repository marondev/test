require("hazardous");

const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

const uploadDir = path.join(__dirname, "..", "data", "uploads/");

const uploadFilter = function (req, file, cb) {
  // accept image only
  if (!file.originalname.toLowerCase().match(/\.(jpg|jpeg|png|gif|pdf)$/)) {
    return cb(new Error("Only image files and PDF are allowed!"), false);
  }
  cb(null, true);
};

// const storage = multer.memoryStorage();
const upload = multer({ dest: uploadDir, fileFilter: uploadFilter });

router.use(function init(req, res, next) {
  params = require("../constants/params").get();
  params.token = req.token;
  next();
});

// Upload
router.post("/", upload.single("file"), function (req, res) {
  params.file = req.file;
  params.results = req.body;
  res.status(200).json(params);
});

module.exports = router;
