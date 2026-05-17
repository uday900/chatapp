const chatService = require("../services/chat.service");
const { createChatSchema, markMessagesAsReadSchema, updateGroupInfo, addGroupMembersSchema } = require("../validators/chat.validator");
const { invalidRequest } = require("../utils/errorFactory");
const { successResponse } = require("../utils/response");
const { SOCKET_EVENTS, SOCKET_ROOMS } = require("../constants/endpoints");

exports.getUserChats = async (req, res, next) => {
    try {
        const result = await chatService.getUserChats(req.user.id);
        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {getUserContacts
        next(error);
    }
};

exports.createNewChat = async (req, res, next) => {
    try {
        const { error } = createChatSchema.validate(req.body);
        if (error) {
            throw invalidRequest(error.details[0].message);
        }
        req.body.userId = req?.user?.id;
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
        
        console.log("params:", req.params);
        console.log("query:", req.query);
        console.log("body:", req.body);
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

        // Send socket event to notify other user(s) in the chat about the read status update
        const io = req.app.get("io");
        io.to(SOCKET_ROOMS.CHAT_PREFIX + chatId).emit(SOCKET_EVENTS.MESSAGES_READ, {
            chatId,
            userId: req?.user.id,
            lastReadMessageId: req.query.lastReadMessageId
        });
        successResponse(
            res,
            null,
            "Messages marked as read successfully"
        );
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

exports.getGroupChatDetails = async (req, res, next) => {
    try {
        const chatId = req.params.id;
        const result = await chatService.getGroupChatDetails(chatId, req.user.id);
        successResponse(
            res,
            result,
            "Group chat details fetched successfully"
        );
    } catch (error) {
        next(error);
    }   
};

exports.addMemberToGroup = async (req, res, next) => {
    try {
        const chatId = req.params.id;
        const payload = {
            targetUserIds: req.body.targetUserIds ?? req.body.targetUserId
        };
        const { error } = addGroupMembersSchema.validate(payload);
        if (error) {
            throw invalidRequest(error.details[0].message);
        }

        const rawTargetUserIds = payload.targetUserIds;
        const targetUserIds = Array.isArray(rawTargetUserIds)
            ? rawTargetUserIds
            : [rawTargetUserIds];
        const currentUserId = req.user.id;

        const result = await chatService.addMemberToGroup(
            chatId,
            targetUserIds,
            currentUserId
        );

        if (result.ignored?.length) {
            console.warn(
                `Ignored already-present group member(s) for chat ${chatId}: ${result.ignored.join(", ")}`
            );
        }

        successResponse(
            res,
            result,
            result.message || "Member(s) added successfully"
        );
    } catch (error) {
        next(error);
    }
};


exports.removeMemberFromGroup = async (req, res, next) => {
    try {
        const chatId = req.params.id;
        const targetUserId = req.params.userId;
        const currentUserId = req.user.id;

        const result = await chatService.removeMemberFromGroup(
            chatId,
            targetUserId,
            currentUserId
        );

        successResponse(
            res,
            result,
            "Member removed successfully"
        );
    } catch (error) {
        next(error);
    }
};

exports.leaveGroupChat = async (req, res, next) => {
    try {
        const chatId = req.params.id;
        const currentUserId = req.user.id;
        await chatService.leaveGroupChat(
            chatId,
            currentUserId
        );
        successResponse(
            res,
            null,
            "Left group chat successfully"
        );
    } catch (error) {
        next(error);
    }
};

exports.updateGroupInfo = async (req, res, next) => {
    try {
        const { error } = updateGroupInfo.validate(req.body);
        if (error) {
            throw invalidRequest(error.details[0].message);
        }
        req.body.userId = req?.user?.id;

        await chatService.updateGroupInfo(req.body);
        successResponse(
            res,
            null,
            "Group info updated successfully"
        );
    } catch (error) {
        next(error);
    }
};

exports.getAvailableMembers = async (req, res, next) => {
    try {
        const groupId = req.params.groupId;
        const currentUserId = req.user.id;

        const availableMembers = await chatService.getAvailableMembers(
            groupId,
            currentUserId
        );

        successResponse(
            res,
            availableMembers,
            "Available members fetched successfully"
        );
    } catch (error) {
        next(error);
    }
};
