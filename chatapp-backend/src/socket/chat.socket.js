const ChatMember = require("../models/ChatMember");
const ChatMessage = require("../models/ChatMessage");
const { chatSendMessageSchema } = require("../validators/chat.validator");
const { chatJoinSchema, chatMessageDeleteSchema } = require("../validators/socket.validator");
const presenceService = require("../services/presence.service");
const { SOCKET_EVENTS, SOCKET_ROOMS } = require("../constants/endpoints");

module.exports = (io, socket) => {

    socket.on(SOCKET_EVENTS.CHAT_JOIN, async (data) => {
        try {
            const { error } = chatJoinSchema.validate(data);
            if (error) {
                console.error("Validation error for chat:join:", error.details[0].message);
                return socket.emit(SOCKET_EVENTS.CHAT_ERROR, { message: error.details[0].message });
            }

            const isRoomMember = await ChatMember.findOne({
                where: {
                    chat_id: data.chatId,
                    user_id: socket.user.id
                }
            });

            if (!isRoomMember) {
                socket.emit(SOCKET_EVENTS.CHAT_ERROR, { message: "You are not a member of this chat" });
                return;
            }

            socket.join(SOCKET_ROOMS.CHAT_PREFIX + data.chatId);
            console.log(`User ${socket.id} joined chat ${data.chatId}`);
        } catch (error) {
            console.error(error);
            socket.emit(SOCKET_EVENTS.CHAT_ERROR, { message: "Something went wrong" });
        }
    });

    socket.on(SOCKET_EVENTS.MESSAGE_SEND, async (data) => {
        try {
            console.log("Received message:", data);
            const { error } = chatSendMessageSchema.validate(data);
            if (error) {
                console.error("Validation error for message:send:", error.details[0].message);
                return socket.emit(SOCKET_EVENTS.CHAT_ERROR, { message: error.details[0].message });
            }

            if (data.replyToMessageId) {
                const originalMessage = await ChatMessage.findOne({
                    where: {
                        id: data.replyToMessageId,
                        chat_id: data.chatId
                    }
                });

                if (!originalMessage) {
                    return socket.emit(SOCKET_EVENTS.CHAT_ERROR, { message: "The message you are replying to does not exist in this chat" });
                }
            }

            const savedMessage = await ChatMessage.create({
                chat_id: data.chatId,
                message: data.message,
                reply_to_message_id: data.replyToMessageId || null,
                sender_id: socket.user.id
            });

            console.log("Sending message to room:", SOCKET_ROOMS.CHAT_PREFIX + data.chatId, savedMessage.toJSON());
            io.to(SOCKET_ROOMS.CHAT_PREFIX + data.chatId).emit(SOCKET_EVENTS.MESSAGE_NEW, {
                chatId: savedMessage.chat_id,
                id: savedMessage.id,
                message: savedMessage.message,
                sender_id: savedMessage.sender_id,
                sender_name: socket.user.full_name,
                sender_profile_picture: socket.user.profile_picture,
                created_at: savedMessage.createdAt,
                reply_to_message_id: savedMessage.reply_to_message_id
            });
        } catch (error) {
            console.error("Error saving message:", error);
            socket.emit(SOCKET_EVENTS.CHAT_ERROR, { message: "Failed to send message" });
        }
    });

    socket.on(SOCKET_EVENTS.MESSAGE_DELETE, async (data) => {
        try {
            const { error } = chatMessageDeleteSchema.validate(data);
            if (error) {
                console.error("Validation error for message:delete:", error.details[0].message);
                return socket.emit(SOCKET_EVENTS.CHAT_ERROR, { message: error.details[0].message });
            }

            const message = await ChatMessage.findOne({
                where: {
                    id: data.messageId,
                    chat_id: data.chatId
                }
            });

            if (!message) {
                return socket.emit(SOCKET_EVENTS.CHAT_ERROR, { message: "Message not found" });
            }

            await message.destroy();
            io.to(SOCKET_ROOMS.CHAT_PREFIX + data.chatId).emit(SOCKET_EVENTS.MESSAGE_DELETED, { id: data.messageId });
        } catch (error) {
            console.error("Error deleting message:", error);
            socket.emit(SOCKET_EVENTS.CHAT_ERROR, { message: "Failed to delete message" });
        }
    });

    socket.on(SOCKET_EVENTS.TYPING_START, (data) => {
        try {
            const { error } = chatJoinSchema.validate(data);
            if (error) {
                console.error("Validation error for typing:start:", error.details[0].message);
                return socket.emit(SOCKET_EVENTS.CHAT_ERROR, { message: error.details[0].message });
            }

            console.log("Recieved: typing:start for", data);
            socket.to(SOCKET_ROOMS.CHAT_PREFIX + data.chatId).emit(SOCKET_EVENTS.TYPING_STARTED, {
                chatId: data.chatId,
                userId: socket.user.id,
                username: socket.user.full_name
            });
        } catch (error) {
            console.error("Error handling typing:start:", error);
            socket.emit(SOCKET_EVENTS.CHAT_ERROR, { message: "Failed to handle typing indicator" });
        }
    });

    socket.on(SOCKET_EVENTS.TYPING_STOP, async (data) => {
        try {
            const { error } = chatJoinSchema.validate(data);
            if (error) {
                console.error("Validation error for typing:stop:", error.details[0].message);
                return socket.emit(SOCKET_EVENTS.CHAT_ERROR, { message: error.details[0].message });
            }

            socket.to(SOCKET_ROOMS.CHAT_PREFIX + data.chatId).emit(SOCKET_EVENTS.TYPING_STOPPED, {
                chatId: data.chatId,
                userId: socket.user.id
            });
        } catch (error) {
            console.error("Error handling typing:stop:", error);
            socket.emit(SOCKET_EVENTS.CHAT_ERROR, { message: "Failed to handle typing indicator" });
        }
    });

    socket.on(SOCKET_EVENTS.PRESENCE_HEARTBEAT, async () => {
        await presenceService.setUserOnline(socket.user.id);
    });

    socket.on(SOCKET_EVENTS.MESSAGE_UPDATE, async (data) => {
        try {
            const { chatId, messageId, message } = data;

            if (!chatId || !messageId || !message?.trim()) {
                return socket.emit(SOCKET_EVENTS.CHAT_ERROR, { message: "chatId, messageId and updated message are required" });
            }

            const existingMessage = await ChatMessage.findOne({
                where: {
                    id: messageId,
                    chat_id: chatId
                }
            });

            if (!existingMessage) {
                return socket.emit(SOCKET_EVENTS.CHAT_ERROR, { message: "Message not found" });
            }

            if (existingMessage.sender_id !== socket.user.id) {
                return socket.emit(SOCKET_EVENTS.CHAT_ERROR, { message: "You can only edit your own message" });
            }

            existingMessage.message = message;
            await existingMessage.save();

            io.to(SOCKET_ROOMS.CHAT_PREFIX + chatId).emit(SOCKET_EVENTS.MESSAGE_UPDATED, {
                chatId,
                id: existingMessage.id,
                message: existingMessage.message,
                updated_at: existingMessage.updatedAt
            });
        } catch (error) {
            console.error("Error updating message:", error);
            socket.emit(SOCKET_EVENTS.CHAT_ERROR, { message: "Failed to update message" });
        }
    });

    socket.on(SOCKET_EVENTS.MESSAGE_DELETE, async (data) => {
        try {
            const { chatId, messageId } = data;

            if (!chatId || !messageId) {
                return socket.emit(SOCKET_EVENTS.CHAT_ERROR, { message: "chatId and messageId are required" });
            }

            const message = await ChatMessage.findOne({
                where: {
                    id: messageId,
                    chat_id: chatId
                }
            });

            if (!message) {
                return socket.emit(SOCKET_EVENTS.CHAT_ERROR, { message: "Message not found" });
            }

            if (message.sender_id !== socket.user.id) {
                return socket.emit(SOCKET_EVENTS.CHAT_ERROR, { message: "You can only delete your own message" });
            }

            await message.destroy();
            io.to(SOCKET_ROOMS.CHAT_PREFIX + chatId).emit(SOCKET_EVENTS.MESSAGE_DELETED, {
                chatId,
                id: messageId
            });
        } catch (error) {
            console.error("Error deleting message:", error);
            socket.emit(SOCKET_EVENTS.CHAT_ERROR, { message: "Failed to delete message" });
        }
    });
};
