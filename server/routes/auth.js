const express = require('express');
const router = express.Router();
const { createAccessCode, validateAccessCode, loginEmail, verifyAccount } = require('../controllers/authController');

router.post('/createAccessCode', createAccessCode);
router.post('/validateAccessCode', validateAccessCode);
router.post('/loginEmail', loginEmail);
router.get('/verify/:token', verifyAccount);

module.exports = router;