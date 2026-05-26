const joi = require("joi");

exports.createUserSchema = joi.object({
    full_name: joi.string()
        .min(3)
        .max(50)
        .required(),
    mobile_number: joi.string()
        .min(10)
        .max(15)
        .required(),
    email: joi.string()
        .email()
        .required(),
    password: joi.string()
        .min(6)
        .max(100)
        .required()
        .messages({
            "string.min": "Password must be at least 6 characters long",
            "string.max": "Password cannot exceed 100 characters",
            "any.required": "Password is required"
        })
})

exports.loginSchema = joi.object({
  email: joi.string().email().required(),
  password: joi.string().required()
});

exports.forgotPasswordSchema = joi.object({
  email: joi.string().email().required()
});

exports.verifyForgotOtpSchema = joi.object({
  email: joi.string().email().required(),
  otp: joi.string().length(6).pattern(/^[0-9]{6}$/).required()
});

exports.resetPasswordSchema = joi.object({
  resetToken: joi.string().required(),
  newPassword: joi.string()
    .min(8)
    .max(100)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).+$/)
    .required()
    .messages({
      "string.min": "Password must be at least 8 characters long",
      "string.pattern.base": "Password must include uppercase, lowercase, number, and special character",
      "any.required": "New password is required"
    })
});