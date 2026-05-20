const express = require('express');
const router = express.Router();

const chatController = require('../controllers/chat.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.use(authMiddleware);

/**
 * @swagger
 * /chats/my-chats:
 *   get:
 *     summary: Get all chats of current user
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Chats fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   chatId:
 *                     type: integer
 *                   lastMessage:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       message:
 *                         type: string
 *                       sender_id:
 *                         type: integer
 *                       sender_name:
 *                         type: string
 *                       sender_profile_picture:
 *                         type: string
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                       updated_at:
 *                         type: string
 *                         format: date-time
 *                       is_deleted:
 *                         type: boolean
 *                       deleted_by:
 *                         type: integer
 *                       deleted_at:
 *                         type: string
 *                         format: date-time
 *                   name:
 *                     type: string
 *                   profile_picture:
 *                     type: string
 *                   type:
 *                     type: string
 *                   created_at:
 *                     type: string
 *                     format: date-time
 */
router.get("/my-chats", chatController.getUserChats);

/**
 * @swagger
 * /chats/create:
 *   post:
 *     summary: Create new chat
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Chat created successfully
 */
router.post("/create", chatController.createNewChat);

/**
 * @swagger
 * /chats/{id}/messages:
 *   get:
 *     summary: Get chat messages
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Messages fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 chat:
 *                   type: object
 *                   properties:
 *                     chatId:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     type:
 *                       type: string
 *                 messages:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       message:
 *                         type: string
 *                       sender_id:
 *                         type: integer
 *                       sender_name:
 *                         type: string
 *                       sender_profile_picture:
 *                         type: string
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                       updated_at:
 *                         type: string
 *                         format: date-time
 *                       is_deleted:
 *                         type: boolean
 *                       deleted_by:
 *                         type: integer
 *                       deleted_at:
 *                         type: string
 *                         format: date-time
 */
router.get("/:id/messages", chatController.getChatMessages);

/**
 * @swagger
 * /chats/{id}/messages/read:
 *   put:
 *     summary: Mark messages as read
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Messages marked as read
 */
router.put("/:id/messages/read", chatController.markMessagesAsRead);

/**
 * @swagger
 * /chats/{id}/clear:
 *   delete:
 *     summary: Clear chat messages
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Chat cleared successfully
 */
router.delete("/:id/clear", chatController.clearChatMessages);

/**
 * @swagger
 * /chats/{id}/group-details:
 *   get:
 *     summary: Get group chat details
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Group details fetched successfully
 */
router.get("/:id/group-details", chatController.getGroupChatDetails);

/**
 * @swagger
 * /chats/{id}/members:
 *   post:
 *     summary: Add member to group
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Member added successfully
 */
router.post("/:id/members", chatController.addMemberToGroup);

/**
 * @swagger
 * /chats/{id}/members/{userId}:
 *   delete:
 *     summary: Remove member from group
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Member removed successfully
 */
router.delete("/:id/members/:userId", chatController.removeMemberFromGroup);

/**
 * @swagger
 * /chats/{id}/leave:
 *   delete:
 *     summary: Leave group chat
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Left group chat successfully
 */
router.delete("/:id/leave", chatController.leaveGroupChat);

/**
 * @swagger
 * /chats/update-group-info:
 *   put:
 *     summary: Update group chat info
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Group chat info updated successfully
 */
router.put("/update-group-info", chatController.updateGroupInfo);

/**
 * @swagger
 * /chats/{groupId}/available-members:
 *   get:
 *     summary: Get available members for group chat
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Available members fetched successfully
 */
router.get("/:groupId/available-members", chatController.getAvailableMembers);

module.exports = router;