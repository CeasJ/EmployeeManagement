const express = require('express');
const router = express.Router();
const { getUserProfile } = require('../controllers/userController');
const auth = require('../utils/auth');

router.get('/profile', auth , getUserProfile);

module.exports = router;