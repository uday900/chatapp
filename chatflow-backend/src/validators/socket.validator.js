const Joi = require("joi");

exports.chatJoinSchema = Joi.object({
    chatId: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            "any.required":
                "chatId is required",
            "number.base":
                "chatId must be a number"
        })
});

exports.chatMessageDeleteSchema = Joi.object({
    messageId: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            "any.required":
                "messageId is required",
            "number.base":
                "messageId must be a number"
        }),
    chatId: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            "any.required":                "chatId is required",
            "number.base":                "chatId must be a number"
        })
});
