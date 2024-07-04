const express = require('express');
const router = express.Router();
const { createOrder, getOrdersByUserId, GetCountOrderByIdPengguna, updateOrderStatus, deleteOrder, getAllOrder, updateRutes } = require('../controllers/orderController.js');
const verifyToken = require('../middleware/auth.js');


router.post('/', verifyToken, createOrder);
router.get('/', verifyToken, getOrdersByUserId);
router.get('/count/:id_pengguna', verifyToken, GetCountOrderByIdPengguna);
router.put('/status/:_id', verifyToken, updateOrderStatus);
router.delete('/delete/:_id', verifyToken, deleteOrder);
router.get('/all', verifyToken, getAllOrder);
router.put('/rutes/:_id', verifyToken, updateRutes);



module.exports = router;
