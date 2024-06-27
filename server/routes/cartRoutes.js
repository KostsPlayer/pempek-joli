const express = require('express');
const router = express.Router();
const { createCart, getAllCart, updateCart, deleteCart, deleteProductFromCart, updateStatusCart } = require('../controllers/cartController.js');
const verifyToken = require('../middleware/auth.js');


router.post('/',verifyToken, createCart);
router.get('/',verifyToken, getAllCart);
router.put('/update/:_id',verifyToken, updateCart);
router.delete('/',verifyToken, deleteCart);
router.delete('/:_id/product', verifyToken, deleteProductFromCart);
router.put('/:_id/product/status', verifyToken, updateStatusCart);


module.exports = router;