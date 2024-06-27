const express = require('express');
const router = express.Router();
const { updateBuktiPembayaran, getPaymentsById } = require('../controllers/pembayaranController.js');
const { upload } = require('../middleware/image.js');
const verifyToken = require('../middleware/auth.js');


router.put('/upload/payments/:_id', upload.single('bukti_pembayaran'), verifyToken, updateBuktiPembayaran);
router.get('/payments/:_id', verifyToken, getPaymentsById);

module.exports = router;