const express = require('express');
const router = express.Router();

const userRoutes = require('./user.routes');
const authRoutes = require('./auth.routes');
const chatRoutes = require('./chat.route');
const { METHOD_NOT_ALLOWED } = require('../constants/errorCodes');
const AppError = require('../utils/AppError');
const { USERS, AUTH, CHATS } = require('../constants/endpoints');

router.use(USERS, userRoutes);
router.use(AUTH, authRoutes);
router.use(CHATS, chatRoutes);

module.exports = router;