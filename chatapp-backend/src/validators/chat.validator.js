const joi = require("joi");

exports.createChatSchema = joi.object({
    type: joi.string()
        .valid("ONE_TO_ONE", "GROUP")
        .required()
        .messages({
            "any.only": "Chat type must be either ONE_TO_ONE or GROUP",
            "any.required": "Chat type is required"
        }),
    name: joi.string()
        .max(100)
        .when("type", {
            is: "GROUP",
            then: joi.required()
        }),
    memberIds: joi.array()
        .items(joi.number().integer().positive())
        .min(1)
        .required()
        .messages({
            "array.min": "At least 1 member is required for a chat",
            "array.items": "All member IDs must be positive integers"
        })
});

exports.chatSendMessageSchema = joi.object({
    chatId: joi.number().integer().positive().required(),
    message: joi.string().max(1000).required(),
    replyToMessageId: joi.number().integer().positive().optional()
});

exports.markMessagesAsReadSchema = joi.object({
    chatId: joi.number().integer().positive().required(),
    lastReadMessageId: joi.number().integer().positive().required()
});

exports.updateGroupInfo = joi.object({
    name: joi.string().max(100).required(),
    profilePictureUrl: joi.string().uri().required()
})