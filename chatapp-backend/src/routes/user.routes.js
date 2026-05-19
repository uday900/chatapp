const express = require("express");
const router = express.Router();

const userController = require("../controllers/user.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const { URL_SEPARATOR, BY_ID, USER_CONTACT, SEARCH_BY_MOBILE } = require("../constants/endpoints");

router.use(authMiddleware);

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Success
 */
router.get(URL_SEPARATOR, userController.getAllUsers);

/**
 * @swagger
 * /users/contacts:
 *   get:
 *     summary: Get current user contacts
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         required: false
 *         schema:
 *           type: string
 *         description: Search contacts by name or mobile number
 *       - in: query
 *         name: newChat
 *         required: false
 *         schema:
 *           type: boolean
 *         description: If true, perform a mobile lookup only and return the matched user if found
 *     responses:
 *       200:
 *         description: Contacts fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       full_name:
 *                         type: string
 *                       email:
 *                         type: string
 *                       mobile:
 *                         type: string
 *                       profile_picture:
 *                         type: string
 *                       last_seen:
 *                         type: string
 *                         format: date-time
 *                       isInYourContact:
 *                         type: boolean
 */
router.get(USER_CONTACT, userController.getUserContacts);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
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
 *         description: User fetched successfully
 */
router.get(BY_ID, userController.getUserById);

/**
 * @swagger
 * /users/search/{mobileNumber}:
 *   get:
 *     summary: Search user by mobile number
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: mobileNumber
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User fetched successfully
 */
router.get(SEARCH_BY_MOBILE, userController.getUserByMobileNumber);


module.exports = router;