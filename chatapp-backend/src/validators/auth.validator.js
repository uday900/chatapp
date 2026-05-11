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