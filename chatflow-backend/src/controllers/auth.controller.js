
const authService = require("../services/auth.service");
const { invalidRequest } = require("../utils/errorFactory");
const { mapUserResponse } = require("../dto/user.dto");
const {
  loginSchema,
  createUserSchema,
  forgotPasswordSchema,
  verifyForgotOtpSchema,
  resetPasswordSchema
} = require("../validators/auth.validator");

exports.register = async (req, res, next) => {
  try {
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

exports.forgotPassword = async (req, res, next) => {
  try {
    const { error } = forgotPasswordSchema.validate(req.body);
    if (error) {
      throw invalidRequest(error.details[0].message);
    }

    await authService.sendForgotPasswordOtp(req.body.email);

    res.status(200).json({
      success: true,
      message: "If account exists, OTP sent successfully"
    });
  } catch (error) {
    next(error);
  }
};

exports.verifyForgotOtp = async (req, res, next) => {
  try {
    const { error } = verifyForgotOtpSchema.validate(req.body);
    if (error) {
      throw invalidRequest(error.details[0].message);
    }

    const resetToken = await authService.verifyForgotPasswordOtp(req.body.email, req.body.otp);

    res.status(200).json({
      success: true,
      resetToken
    });
  } catch (error) {
    next(error);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { error } = resetPasswordSchema.validate(req.body);
    if (error) {
      throw invalidRequest(error.details[0].message);
    }

    await authService.resetPassword(req.body.resetToken, req.body.newPassword);

    res.status(200).json({
      success: true,
      message: "Password reset successful"
    });
  } catch (error) {
    next(error);
  }
};