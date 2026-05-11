const express = require('express');
const router = express.Router();

const chatController = require('../controllers/chat.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.use(authMiddleware);
router.get('/my-chats', chatController.getUserChats);
router.post('/create', chatController.createNewChat);
router.get('/:id/messages', chatController.getChatMessages);
router.put('/:id/messages/read', chatController.markMessagesAsRead);
router.delete('/:id/clear', chatController.clearChatMessages);

module.exports = router;