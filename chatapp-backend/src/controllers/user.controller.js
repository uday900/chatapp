const { mapUserResponse } = require("../dto/user.dto");
const userService = require("../services/user.service");
const { createUserSchema } = require("../validators/auth.validator");
const AppError = require("../utils/AppError");
const { recordNotFound } = require("../utils/errorFactory");
const { successResponse } = require("../utils/response");


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

exports.getUserContacts = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const searchQuery = req.query.search || null;
    const newChat = String(req.query.newChat).toLowerCase() === "true";

    if (newChat) {
      if (!searchQuery || !searchQuery.trim()) {
        return res.status(200).json({
          success: true,
          data: []
        });
      }

      const user = await userService.findUserByMobileNumber(searchQuery.trim());
      if (!user) {
        return res.status(200).json({
          success: true,
          data: []
        });
      }

      const isInYourContact = await userService.isUserContact(userId, user.id);
      const response = mapUserResponse(user);
      response.isInYourContact = isInYourContact;

      return res.status(200).json({
        success: true,
        data: [response]
      });
    }

    const contacts = await userService.getUserContacts(userId, searchQuery);
    const data = contacts.map((contact) => {
      const response = mapUserResponse(contact);
      response.isInYourContact = true;
      return response;
    });

    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};

exports.getUserByMobileNumber = async (req, res, next) => {
  try {
    const { mobileNumber } = req.params;
    const user = await userService.getUserByMobileNumber(mobileNumber);
    successResponse(
      res,
      user,
      "User fetched successfully"
    );
  } catch (error) {
    next(error);
  }
};