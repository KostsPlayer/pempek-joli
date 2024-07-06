const express = require('express');
const router = express.Router();
const { updateBuktiPembayaran, getPaymentsById, getAllPayments } = require('../controllers/pembayaranController.js');
const { upload } = require('../middleware/uploadImage.js');
const verifyToken = require('../middleware/auth.js');


router.put('/upload/payments/:_id', upload.single('bukti_pembayaran'), verifyToken, updateBuktiPembayaran);
router.get('/payments/:_id', verifyToken, getPaymentsById);
router.get('/all', verifyToken, getAllPayments);


module.exports = router;