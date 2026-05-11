const express = require("express");
const router = express.Router();

const userController = require("../controllers/user.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const { URL_SEPARATOR, BY_ID } = require("../constants/endpoints");

router.use(authMiddleware);
router.get(URL_SEPARATOR, userController.getAllUsers);

router.get(BY_ID, userController.getUserById);

module.exports = router;