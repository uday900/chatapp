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

exports.addGroupMembersSchema = joi.object({
    targetUserIds: joi.alternatives().try(
        joi.number().integer().positive(),
        joi.array().items(joi.number().integer().positive()).min(1)
    ).required()
        .messages({
            "any.required": "targetUserIds is required",
            "alternatives.types": "targetUserIds must be a positive integer or an array of positive integers",
            "array.min": "targetUserIds must contain at least 1 user id",
            "array.items": "targetUserIds must contain positive integers only"
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
    chatId: joi.number().integer().positive().required(),
    chatName: joi.string().max(100).required(),
    profilePictureUrl: joi.string().uri().optional()
})