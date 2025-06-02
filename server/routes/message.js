const express = require('express');
const router = express.Router();
const { getConversations, createConversation } = require('../controllers/messageController');
const auth = require('../utils/auth');

router.get('/conversations', auth, getConversations);
router.post('/conversation', auth, createConversation);

module.exports = router;