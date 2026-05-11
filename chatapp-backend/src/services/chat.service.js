const sequelize = require("../config/db");
const { mapToChatSummary, mapChatMessagesResponse } = require("../dto/chat.dto");
const Chat = require("../models/Chat");
const ChatMember = require("../models/ChatMember");
const ChatMessage = require("../models/ChatMessage");
const User = require("../models/User");
const { invalidRequest } = require("../utils/errorFactory");


exports.getUserChats = async (userId) => {
    const chats = await Chat.findAll({
        include: [
            {
                model: ChatMember,
                as: "members",
                where: {
                    user_id: userId
                },
                attributes: [],
                required: true
            },
            {
                model: ChatMember,
                as: "allMembers",
                include: [
                    {
                        model: User,
                        as: "user",
                        attributes: [
                            "id",
                            "full_name",
                            "profile_picture"
                        ]
                    }
                ]
            },
            {
                model: ChatMessage,
                as: "ChatMessages",
                separate: true,
                limit: 1,
                order: [["createdAt", "DESC"]]
            }
        ]
    });

    const mappedChats = await Promise.all(
    chats.map(async (chat) => {

        const currentUserMember =
            chat.allMembers.find(
                m => m.user_id === userId
            );

        const messageStartDate =
            currentUserMember?.chat_cleared_at ||
            chat.createdAt;

        /*
          Latest message after clear date
        */
        const latestMessage =
            await ChatMessage.findOne({
                where: {
                    chat_id: chat.id,
                    createdAt: {
                        [Op.gt]:
                            messageStartDate
                    }
                },
                order: [
                    ["createdAt", "DESC"]
                ]
            });

        /*
          Unread count after clear date
        */
        const [result] =
            await sequelize.query(`
                SELECT COUNT(*) AS unread_count
                FROM chat_messages
                WHERE chat_id = :chatId
                  AND sender_id != :currentUserId
                  AND created_at > :messageStartDate
                  AND id > COALESCE((
                      SELECT last_read_message_id
                      FROM chat_members
                      WHERE chat_id = :chatId
                        AND user_id = :currentUserId
                  ), 0)
            `, {
                replacements: {
                    chatId: chat.id,
                    currentUserId: userId,
                    messageStartDate
                }
            });

        const unreadCount =
            parseInt(
                result[0].unread_count
            );

        /*
          override latest message manually
        */
        chat.ChatMessages =
            latestMessage
                ? [latestMessage]
                : [];

        return mapToChatSummary(
            chat,
            userId,
            unreadCount
        );
    })
);

    return mappedChats;
};

exports.createNewChat = async (data) => {
    const { type, name, memberIds, userId } = data;

    if (type === "ONE_TO_ONE" && memberIds.length !== 1) {
        throw invalidRequest("ONE_TO_ONE chat must have exactly 2 members");
    } else if (type === "GROUP" && memberIds.length < 2) {
        throw invalidRequest("GROUP chat must have at least 2 members");
    }

    const chat = await Chat.create({
        type: type,
        name: type === "GROUP" ? name : null
    });

    await ChatMember.create({
        chat_id: chat.id,
        user_id: userId,
        role: "ADMIN"
    });

    const memberEntries = memberIds.map(id => ({
        chat_id: chat.id,
        user_id: id,
        role: "MEMBER"
    }));
    await ChatMember.bulkCreate(memberEntries);

    return chat.id;
}

exports.getChatMessages = async (chatId, userId) => {
    /*
      First fetch chat + member details
    */
    const chat = await Chat.findOne({
        where: { id: chatId },
        include: [
            {
                model: ChatMember,
                as: "members",
                where: {
                    user_id: userId
                },
                required: true
            },
            {
                model: ChatMember,
                as: "allMembers",
                include: [
                    {
                        model: User,
                        as: "user",
                        attributes: [
                            "id",
                            "full_name",
                            "profile_picture"
                        ]
                    }
                ]
            }
        ]
    });

    if (!chat) {
        throw invalidRequest(
            `Chat [${chatId}] not found or user [${userId}] is not a member`
        );
    }

    /*
      Current user's membership
    */
    const currentMember =
        chat.members.find(
            m => m.user_id === userId
        );

    /*
      If cleared_at exists use that,
      else use chat createdAt
    */
    const messageStartDate =
        currentMember?.chat_cleared_at ||
        chat.createdAt;

    /*
      Fetch messages after clear date
    */
    const messages =
        await ChatMessage.findAll({
            where: {
                chat_id: chatId,
                createdAt: {
                    [require("sequelize").Op.gt]:
                        messageStartDate
                }
            },
            include: [
                {
                    model: User,
                    as: "sender"
                }
            ],
            order: [
                ["createdAt", "ASC"]
            ]
        });

    /*
      Attach messages manually
    */
    chat.ChatMessages = messages;

    return mapChatMessagesResponse(
        chat,
        userId
    );
};

exports.markMessagesAsRead = async (
    chatId,
    userId,
    lastReadMessageId
) => {

    /*
      Validate membership
    */
    const chatMember =
        await ChatMember.findOne({
            where: {
                chat_id: chatId,
                user_id: userId
            },
            include: [
                {
                    model: Chat,
                    as: "chat"
                }
            ]
        });

    if (!chatMember) {
        throw invalidRequest(
            `User [${userId}]
             is not a member of
             chat [${chatId}]`
        );
    }

    /*
      Validate message exists
      and belongs to this chat
    */
    const message =
        await ChatMessage.findOne({
            where: {
                id: lastReadMessageId,
                chat_id: chatId
            }
        });

    if (!message) {
        throw invalidRequest(
            `Message [${lastReadMessageId}]
             does not belong to
             chat [${chatId}]`
        );
    }

    /*
      Respect clear chat boundary
    */
    const validFromDate =
        chatMember.chat_cleared_at ||
        chatMember.chat.createdAt;

    if (
        new Date(message.createdAt) <
        new Date(validFromDate)
    ) {
        throw invalidRequest(
            `Message [${lastReadMessageId}]
             is older than
             cleared chat boundary`
        );
    }

    /*
      Prevent backward update
    */
    if (
        chatMember.last_read_message_id &&
        lastReadMessageId <
        chatMember.last_read_message_id
    ) {
        return;
    }

    /*
      Update read state
    */
    await chatMember.update({
        last_read_message_id:
            lastReadMessageId
    });

    console.log(
        `Updated last_read_message_id
         for user [${userId}]
         in chat [${chatId}]
         to ${lastReadMessageId}`
    );
};

exports.clearChatMessages = async (chatId, userId) => {
    const chatMember = await ChatMember.findOne({
        where: {
            chat_id: chatId,
            user_id: userId
        }
    });
    if (!chatMember) {
        throw invalidRequest(`User [${userId}] is not a member of chat [${chatId}]`);
    }

    await chatMember.update({
        chat_cleared_at: new Date()
    });
    console.log(
        `Cleared messages for user [${userId}] in chat [${chatId}]`
    );
};
