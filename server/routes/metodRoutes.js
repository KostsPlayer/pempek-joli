const express = require('express');
const router = express.Router();
const { createMetodePembayaran, getAllMetodePembayaran, getMethodById } = require('../controllers/metodepembayaranController.js');
const verifyToken = require('../middleware/auth.js');


router.post('/',verifyToken, createMetodePembayaran);
router.get('/', verifyToken, getAllMetodePembayaran);
router.get('/find/:_id', verifyToken, getMethodById);



module.exports = router;