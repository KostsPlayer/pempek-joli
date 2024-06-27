const express = require('express');
const router = express.Router();
const { getMe, updateProfile } = require('../controllers/profileController.js');
const verifyToken = require('../middleware/auth.js');

router.get('/me', verifyToken, getMe);
router.put('/edit', verifyToken, updateProfile);




module.exports = router;