const express = require('express');
const router = express.Router();
const { createAlamatPengiriman, getAllAlamatPengiriman, deleteAlamatPengiriman, getKabByProv, getProvinces } = require('../controllers/alamatController.js');
const verifyToken = require('../middleware/auth.js');


router.post('/', verifyToken, createAlamatPengiriman);
router.get('/alamat', verifyToken, getAllAlamatPengiriman);
router.delete('/:_id', verifyToken, deleteAlamatPengiriman);
router.get('/Kab/:selectedProvinceId', getKabByProv);
router.get('/provinces', getProvinces);

module.exports = router;