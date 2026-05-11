
const AppError = require("../utils/AppError");
const { loginSchema, createUserSchema } = require("../validators/auth.validator");
const authService = require("../services/auth.service");
const { invalidRequest } = require("../utils/errorFactory");
const { mapUserResponse } = require("../dto/user.dto");

exports.register = async (req, res, next) => {
  try {

    // Validate request body
    const { error } = createUserSchema.validate(req.body);
    if (error) {
      throw invalidRequest(error.details[0].message);
    }

    const user = await authService.register(req.body);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: mapUserResponse(user)
    });

  } catch (error) {
    next(error);
  }
};


exports.login = async (req, res, next) => {
    try {
        const { error } = loginSchema.validate(req.body);
        if (error) {
            throw invalidRequest(error.details[0].message);
        }
        
        const result = await authService.login(req.body);
        res.status(200).json({
            success: true,
            data: result
        });
    } catch (err) {
        next(err);
    }
};