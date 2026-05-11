const ChatMember = require("../models/ChatMember");
const ChatMessage = require("../models/ChatMessage");
const { chatSendMessageSchema } = require("../validators/chat.validator");
const { chatJoinSchema } = require("../validators/socket.validator");


module.exports = (io, socket) => {

    socket.on("chat:join", async (data) => {

        try {
            const { error } = chatJoinSchema.validate(data);
            if (error) {
                console.error("Validation error for chat:join:", error.details[0].message);
                return socket.emit(
                    "chat:error",
                    {
                        message: error.details[0].message
                    }
                )
            }
            const isRoomMember = await ChatMember.findOne({
                where: {
                    chat_id: data.chatId,
                    user_id: data.user.id
                }
            });
            if (!isRoomMember) {
                socket.emit("chat:error", { message: "You are not a member of this chat" });
                return;
            }
            socket.join(`chat_${data.chatId}`);
            console.log(`User ${socket.id} joined chat ${data.chatId}`);
        } catch (error) {
            console.error(error);

            socket.emit(
                "chat:error",
                {
                    message:
                        "Something went wrong"
                }
            );
        }
    });

    socket.on("message:send", async (data) => {
        try {
            console.log("Received message:", data);
            const { error } = chatSendMessageSchema.validate(data);
            if (error) {
                console.error("Validation error for message:send:", error.details[0].message);
                return socket.emit(
                    "chat:error",
                    {
                        message: error.details[0].message
                    }
                )
            }
            const savedMessage = await ChatMessage.create({
                chat_id: data.chatId,
                message: data.message,
                sender_id: data?.user?.id
            });
            console.log("Sending message to room:", `chat_${data.chatId}`, savedMessage.toJSON());
            io.to(`chat_${data.chatId}`).emit("message:new", savedMessage);
            /*
         Broadcast directly to chat event
       */
            // io.emit(
            //     `chat_${data.chatId}`,
            //     savedMessage.toJSON()
            // );

        } catch (error) {
            console.error("Error saving message:", error);
            socket.emit("chat:error", { message: "Failed to send message" });
        }
    });
};
