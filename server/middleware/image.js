// const fs = require('fs');
const path = require("path");
const multer = require("multer");

// Konfigurasi penyimpanan untuk Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./img/"); // Tentukan folder tujuan untuk menyimpan gambar
  },
  filename: function (req, file, cb) {
    // Tentukan nama file yang disimpan dengan menambahkan timestamp ke nama asli file
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

// Filter untuk tipe file gambar yang diterima (opsional)
const imageFilter = function (req, file, cb) {
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
    return cb(new Error("Only image files are allowed!"), false);
  }
  cb(null, true);
};

// Inisialisasi middleware Multer
const upload = multer({ storage: storage, fileFilter: imageFilter });

module.exports = { storage, imageFilter, upload };
