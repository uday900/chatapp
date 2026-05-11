const chatService = require("../services/chat.service");
const {createChatSchema, markMessagesAsReadSchema} = require("../validators/chat.validator");
const { invalidRequest } = require("../utils/errorFactory");

exports.getUserChats = async (req, res, next) => {
    try {
        const result = await chatService.getUserChats(req.user.id);
        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
};

exports.createNewChat = async (req, res, next) => {
    try {
        const { error } = createChatSchema.validate(req.body);
        if (error) {
            throw invalidRequest(error.details[0].message);
        }
        req.body.userId = req.user.id;
        const result = await chatService.createNewChat(req.body);
        res.status(201).json({
            success: true,
            data: { chatId: result }
        });

    } catch (error) {
        next(error);
    }
};

exports.getChatMessages = async (req, res, next) => {
    try {
        const chatId = req.params.id;
        const result = await chatService.getChatMessages(chatId, req.user.id);
        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
};

exports.markMessagesAsRead = async (req, res, next) => {
    try {
        const { error } = markMessagesAsReadSchema.validate({
            chatId: req.params.id,
            lastReadMessageId: req.query.lastReadMessageId
        });
        if (error) {
            throw invalidRequest(error.details[0].message);
        }
        const chatId = req.params.id;
        console.log("Marking messages as read for chatId:", chatId, "userId:", req?.user.id, "lastReadMessageId:", req.query.lastReadMessageId);
        await chatService.markMessagesAsRead(chatId, req?.user.id, req.query.lastReadMessageId);
        res.status(200).json({
            success: true,
            data: null
        });
    } catch (error) {
        next(error);
    }
};

exports.clearChatMessages = async (req, res, next) => {
    try {
        const chatId = req?.params.id;
        if (!chatId) {
            throw invalidRequest("Chat ID is required");
        }
        await chatService.clearChatMessages(chatId, req?.user.id);
        res.status(200).json({
            success: true,
            data: null
        });
    } catch (error) {
        next(error);
    }
};