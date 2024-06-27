const express = require('express');
const router = express.Router();
const { createProduct, getAllProduct, getProductByKategori, getProductById } = require('../controllers/productController.js');
const { storage, imageFilter, upload } = require('../middleware/image.js');


router.post('/', createProduct);
router.get('/', getAllProduct);
router.get('/:jenis_menu', getProductByKategori);
router.get('/cari/:_id', getProductById);

module.exports = router;