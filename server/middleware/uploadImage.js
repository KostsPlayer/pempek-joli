const path = require("path");
const multer = require("multer");

// Filter untuk tipe file gambar yang diterima (opsional)
const imageFilter = function (req, file, cb) {
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
    return cb(new Error("Only image files are allowed!"), false);
  }
  cb(null, true);
};

// Konfigurasi penyimpanan untuk Multer
const storage = multer.memoryStorage(); // Simpan di memory saja, karena akan diunggah ke Supabase

// Inisialisasi middleware Multer
const upload = multer({ storage: storage, fileFilter: imageFilter });

<<<<<<< HEAD
module.exports = { storage, imageFilter, upload };
=======
module.exports = { storage, imageFilter, upload };
>>>>>>> 0c44fbdb1dff562c883b76efa54fc2dc491daaf8
