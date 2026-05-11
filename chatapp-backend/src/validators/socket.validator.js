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
        }),

    user: Joi.object({
        id: Joi.number()
            .integer()
            .positive()
            .required()
    }).required()
});