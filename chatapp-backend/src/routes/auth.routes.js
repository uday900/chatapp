const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth.controller");

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               full_name:
 *                 type: string
 *                 example: Darla Udaya Kiran
 *               mobile_number:
 *                 type: string
 *                 example: 9876543210
 *               password:
 *                 type: string
 *                 example: Password@123
 *     responses:
 *       200:
 *         description: User registered successfully
 */
router.post("/register", authController.register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Login successful
 */
router.post("/login", authController.login);

module.exports = router;