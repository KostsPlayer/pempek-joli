const express = require('express');
const router = express.Router();
const { createAlamatPengiriman, getAllAlamatPengiriman, deleteAlamatPengiriman } = require('../controllers/alamatController.js');
const verifyToken = require('../middleware/auth.js');


router.post('/', verifyToken, createAlamatPengiriman);
router.get('/alamat', verifyToken, getAllAlamatPengiriman);
router.delete('/:_id', verifyToken, deleteAlamatPengiriman);

module.exports = router;