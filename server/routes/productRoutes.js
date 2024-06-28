const express = require('express');
const router = express.Router();
const { createProduct, getAllProduct, getProductByKategori, getProductById, editProduct, deleteProduct } = require('../controllers/productController.js');
const { upload } = require('../middleware/uploadImage.js');


router.post('/', upload.single('img_menu'), createProduct);
router.get('/', getAllProduct);
router.get('/:jenis_menu', getProductByKategori);
router.get('/cari/:_id', getProductById);
router.put('/update/:_id', upload.single('img_menu'), editProduct);
router.delete('/:_id', deleteProduct)

module.exports = router;