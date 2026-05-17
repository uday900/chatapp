const { Op } = require("sequelize");
const sequelize = require("../config/db");
const { mapToChatSummary, mapChatMessagesResponse } = require("../dto/chat.dto");
const Chat = require("../models/Chat");
const ChatMember = require("../models/ChatMember");
const ChatMessage = require("../models/ChatMessage");
const User = require("../models/User");
const { invalidRequest, recordNotFound } = require("../utils/errorFactory");


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
                    ],
                    include: [
                        {
                            model: User,
                            as: "sender",
                            attributes: [
                                "id",
                                "full_name",
                                "profile_picture"
                            ]
                        }
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
                  AND "createdAt" > :messageStartDate
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

    // Sort chats by last message created_at (most recent first), then by chat created_at
    mappedChats.sort((a, b) => {
        const aTime = a.lastMessage ? new Date(a.lastMessage.created_at) : new Date(a.created_at);
        const bTime = b.lastMessage ? new Date(b.lastMessage.created_at) : new Date(b.created_at);
        return bTime - aTime; // Descending order
    });

    return mappedChats;
};

exports.createNewChat = async (data) => {
    const { type, name, memberIds, userId } = data;

    /*
      Validation
    */
    if (type === "ONE_TO_ONE" && memberIds.length !== 1) {
        throw invalidRequest(
            "ONE_TO_ONE chat must have exactly 1 other member"
        );
    }

    if (type === "GROUP" && memberIds.length < 1) {
        throw invalidRequest(
            "GROUP chat must have at least 2 other members"
        );
    }

    /*
      ONE_TO_ONE:
      check existing direct chat first
    */
    if (type === "ONE_TO_ONE") {
        const otherUserId = memberIds[0];

        const [existingChats] = await sequelize.query(`
        SELECT c.id
        FROM chats c
        JOIN chat_members cm1
            ON c.id = cm1.chat_id
        JOIN chat_members cm2
            ON c.id = cm2.chat_id
        WHERE c.type = 'ONE_TO_ONE'
          AND cm1.user_id = :userId
          AND cm2.user_id = :otherUserId
        LIMIT 1
    `, {
            replacements: {
                userId,
                otherUserId
            }
        });

        if (existingChats.length > 0) {
            return {
                chatId: existingChats[0].id,
                created: false
            };
        }
    }

    /*
      Create new chat
    */
    const chat = await Chat.create({
        type,
        name: type === "GROUP" ? name : null
    });

    /*
      Creator role:
      GROUP      -> ADMIN
      ONE_TO_ONE -> MEMBER
    */
    await ChatMember.create({
        chat_id: chat.id,
        user_id: userId,
        role: type === "GROUP" ? "ADMIN" : "MEMBER"
    });

    /*
      Add selected members
    */
    const memberEntries = memberIds.map(id => ({
        chat_id: chat.id,
        user_id: id,
        role: "MEMBER"
    }));

    await ChatMember.bulkCreate(memberEntries);

    return {
        chatId: chat.id,
        created: true
    };
};

exports.addMemberToGroup = async (chatId, targetUserIds, currentUserId) => {
    const rawTargetIds = Array.isArray(targetUserIds)
        ? targetUserIds
        : [targetUserIds];
    const uniqueTargetIds = [...new Set(rawTargetIds.filter(id => Number.isInteger(id) && id > 0))];

    if (!uniqueTargetIds.length) {
        throw invalidRequest("At least one valid target user ID is required");
    }

    /*
      Validate chat exists
    */
    const chat = await Chat.findByPk(chatId);

    if (!chat) {
        throw recordNotFound("Chat not found");
    }

    /*
      Only GROUP supports add member
    */
    if (chat.type !== "GROUP") {
        throw invalidRequest(
            "Members can only be added to group chats"
        );
    }

    /*
      Current user must be ADMIN
    */
    const currentUserMember = await ChatMember.findOne({
        where: {
            chat_id: chatId,
            user_id: currentUserId
        }
    });

    if (!currentUserMember) {
        throw invalidRequest(
            "You are not a member of this group"
        );
    }

    if (currentUserMember.role !== "ADMIN") {
        throw invalidRequest(
            "Only admins can add members"
        );
    }

    /*
      Determine which users are already in the group
    */
    const existingMembers = await ChatMember.findAll({
        where: {
            chat_id: chatId,
            user_id: uniqueTargetIds
        }
    });

    const existingUserIds = existingMembers.map(member => member.user_id);
    const usersToAdd = uniqueTargetIds.filter(
        id => !existingUserIds.includes(id)
    );

    if (existingUserIds.length) {
        console.warn(
            `Ignored already-present group member(s) for chat ${chatId}: ${existingUserIds.join(", ")}`
        );
    }

    if (usersToAdd.length) {
        const memberEntries = usersToAdd.map(id => ({
            chat_id: chatId,
            user_id: id,
            role: "MEMBER"
        }));
        await ChatMember.bulkCreate(memberEntries);
    }

    return {
        success: true,
        message: usersToAdd.length
            ? "Member(s) added successfully"
            : "No new members were added",
        added: usersToAdd,
        ignored: existingUserIds
    };
};

exports.removeMemberFromGroup = async (
    chatId,
    targetUserId,
    currentUserId
) => {
    /*
      Validate chat exists
    */
    const chat = await Chat.findByPk(chatId);

    if (!chat) {
        throw recordNotFound("Chat not found");
    }

    /*
      Only GROUP supports remove member
    */
    if (chat.type !== "GROUP") {
        throw invalidRequest(
            "Members can only be removed from group chats"
        );
    }

    /*
      Current user must be ADMIN
    */
    const currentUserMember = await ChatMember.findOne({
        where: {
            chat_id: chatId,
            user_id: currentUserId
        }
    });

    if (!currentUserMember) {
        throw invalidRequest(
            "You are not a member of this group"
        );
    }

    if (currentUserMember.role !== "ADMIN") {
        throw invalidRequest(
            "Only admins can remove members"
        );
    }

    /*
      Target member must exist
    */
    const targetMember = await ChatMember.findOne({
        where: {
            chat_id: chatId,
            user_id: targetUserId
        }
    });

    if (!targetMember) {
        throw recordNotFound(
            "Target user is not a member of this group"
        );
    }

    /*
      Prevent removing self using this API
      (use leave-group API separately)
    */
    if (targetUserId === currentUserId) {
        throw invalidRequest(
            "Use leave group API to remove yourself"
        );
    }

    /*
      Remove member
    */
    await targetMember.destroy();

    return {
        success: true,
        message: "Member removed successfully"
    };
};

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
                            "profile_picture",
                            "last_seen"
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

exports.getGroupChatDetails = async (chatId, userId) => {
    const chat = await Chat.findOne({
        where: {
            id: chatId,
            type: "GROUP"
        },
        include: [
            {
                model: ChatMember,
                as: "members",
                where: {
                    user_id: userId,
                    left_at: null
                },
                attributes: [],
                required: true
            },
            {
                model: ChatMember,
                as: "allMembers",
                where: {
                    left_at: null
                },
                include: [
                    {
                        model: User,
                        as: "user",
                        attributes: [
                            "id",
                            "full_name",
                            "profile_picture",
                            "mobile_number"
                        ]
                    }
                ]
            }
        ]
    });
    if (!chat) {
        throw invalidRequest(`Chat [${chatId}] not found or is not a group chat`);
    }
    return chat;
};

exports.leaveGroupChat = async (chatId, userId) => {
    const chatMember = await ChatMember.findOne({
        where: {
            chat_id: chatId,
            user_id: userId
        }
    });
    if (!chatMember) {
        throw invalidRequest(`User [${userId}] is not a member of chat [${chatId}]`);
    }
    if (chatMember.role === "ADMIN") {
        const otherMembers = await ChatMember.findAll({
            where: {
                chat_id: chatId,
                user_id: {
                    [Op.ne]: userId
                },
                left_at: null
            }
        });
        if (otherMembers.length > 0) {
            const newAdmin = otherMembers[0];
            await newAdmin.update({ role: "ADMIN" });
        }
    }
    await chatMember.update({ left_at: new Date() });
    console.log(
        `User [${userId}] left group chat [${chatId}]`
     );
};

exports.updateGroupInfo = async (data) =>{
    const { chatId, currentUserId, chatName, chatProfilePicture } = data;
    
    const chat = await Chat.findOne({
        where: {
            id: chatId,
            type: "GROUP",
            user_id: currentUserId
        }
    });
    if (!chat) {
        throw invalidRequest(`Chat [${chatId}] not found or is not a group chat`);
    }
    await chat.update({
        name: chatName,
        profile_picture: chatProfilePicture
    });
    console.log(
        `Updated group info for chat [${chatId}]`
    );
};

exports.getAvailableMembers = async (groupId, userId) => {
    /*
      Validate chat exists and is a GROUP
    */
    const chat = await Chat.findByPk(groupId);

    if (!chat) {
        throw recordNotFound("Chat not found");
    }

    if (chat.type !== "GROUP") {
        throw invalidRequest(
            "Available members can only be fetched for group chats"
        );
    }

    /*
      Validate user is a member
    */
    const userMember = await ChatMember.findOne({
        where: {
            chat_id: groupId,
            user_id: userId
        }
    });

    if (!userMember) {
        throw invalidRequest(
            "You are not a member of this group"
        );
    }

    /*
      Fetch user's contacts
    */
    const contacts = await sequelize.query(`
        SELECT DISTINCT
            u.id,
            u.full_name,
            u.profile_picture,
            u.mobile_number
        FROM chat_members cm1
        JOIN chat_members cm2
            ON cm1.chat_id = cm2.chat_id
        JOIN users u
            ON u.id = cm2.user_id
        WHERE cm1.user_id = :userId
          AND cm2.user_id != :userId
        ORDER BY u.full_name
    `, {
        replacements: { userId },
        type: sequelize.QueryTypes.SELECT
    });

    /*
      Fetch members already in the group
    */
    const groupMembers = await ChatMember.findAll({
        where: {
            chat_id: groupId
        },
        attributes: ["user_id"]
    });

    const groupMemberIds = groupMembers.map(
        member => member.user_id
    );

    /*
      Map contacts with alreadyInGroup flag
    */
    const availableMembers = contacts.map(contact => ({
        id: contact.id,
        full_name: contact.full_name,
        mobile: contact.mobile_number,
        profile_picture: contact.profile_picture,
        alreadyInGroup: groupMemberIds.includes(
            contact.id
        )
    }));

    return availableMembers;
};
