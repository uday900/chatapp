const { mapUserResponse } = require("../dto/user.dto");
const userService = require("../services/user.service");
const { createUserSchema } = require("../validators/auth.validator");
const AppError = require("../utils/AppError");
const { recordNotFound } = require("../utils/errorFactory");


exports.getAllUsers = async (req, res, next) => {
  try {
    console.log("Fetching all users...v1");
    const users = await userService.getAllUsers();

    res.status(200).json({
      success: true,
      data: users.map(mapUserResponse)
    });

  } catch (error) {
    next(error);
  }};

exports.getUserById = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.params.id);

    if (!user) {
      throw recordNotFound("User not found with the given ID");
    }

    res.status(200).json({
      success: true,
      data: mapUserResponse(user)
    });

  } catch (error) {
    next(error);
  }
};