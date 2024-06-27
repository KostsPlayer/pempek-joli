const express = require('express');
const router = express.Router();
const imagesController = require('../controllers/imageController.js');

// Route untuk mendapatkan daftar semua gambar
router.get('/img', imagesController.getImages);

module.exports = router;