const presenceService = require("../services/presence.service");

exports.mapToChatSummary = async (chat, currentUserId, unreadCount = 0) => {
    let lastMessage = null;

    if (chat.ChatMessages && chat.ChatMessages.length > 0) {
        const lastMsg = chat.ChatMessages[chat.ChatMessages.length - 1];

        lastMessage = {
            id: lastMsg.id,
            message: lastMsg.message,
            sender_id: lastMsg.sender_id,
            sender_name: lastMsg.sender ? lastMsg.sender.full_name : null,
            sender_profile_picture: lastMsg.sender
                ? lastMsg.sender.profile_picture
                : null,
            created_at: lastMsg.createdAt
        };
    }

    let chatName = chat.name;

    if (!chatName && chat.type === "ONE_TO_ONE") {
        const otherMember = chat.allMembers.find(
            m => m.user_id !== currentUserId
        );

        if (otherMember && otherMember.user) {
            chatName = otherMember.user.full_name;
        }
    }

    let chatProfilePicture = chat.profile_picture_url;

    if (!chatProfilePicture && chat.type === "ONE_TO_ONE") {
        const otherMember = chat.allMembers.find(
            m => m.user_id !== currentUserId
        );

        if (otherMember && otherMember.user) {
            chatProfilePicture = otherMember.user.profile_picture;
        }
    }

    let other_user_id = null;
    let lastReadMessageId = null;

    if (chat.type === "ONE_TO_ONE") {
        const otherMember = chat.allMembers.find(
            m => m.user_id !== currentUserId
        );

        if (otherMember) {
            other_user_id = otherMember.user_id;
            lastReadMessageId = otherMember.last_read_message_id;
        }
    }

    const isOnline =
        chat.type === "ONE_TO_ONE" && other_user_id
            ? await presenceService.isUserOnline(other_user_id)
            : null;

    return {
        chatId: chat.id,
        lastMessage,
        name: chatName,
        profile_picture: chatProfilePicture,
        type: chat.type,
        created_at: chat.createdAt,
        isOnline,
        other_user_id,
        lastReadMessageId,
        unreadCount
    };
};

exports.mapChatMessagesResponse =
    async (chat, currentUserId) => {
        let chatName = chat.name;
        if (!chatName && chat.type === "ONE_TO_ONE") {
            const otherMember = chat.allMembers.find(m => m.user_id !== currentUserId);
            if (otherMember && otherMember.user) {
                chatName = otherMember.user.full_name;
            }
        }
        let chatProfilePicture = chat.profile_picture_url;
        if (!chatProfilePicture && chat.type === "ONE_TO_ONE") {
            const otherMember = chat.allMembers.find(m => m.user_id !== currentUserId);
            if (otherMember && otherMember.user) {
                chatProfilePicture = otherMember.user.profile_picture;
            }
        }
        let lastActive = null;
        let isOnline = null;
        let other_user_id = null;
        let lastReadMessageId = null;
        if (chat.type === "ONE_TO_ONE") {
            const otherMember = chat.allMembers.find(m => m.user_id !== currentUserId);
            if (otherMember) {
                lastActive = otherMember.user?.last_seen || null;
                other_user_id = otherMember.user_id;
                lastReadMessageId = otherMember.last_read_message_id;
            }
        }
        if (other_user_id) {
            isOnline = await presenceService.isUserOnline(other_user_id);
        }
        return {
            chat: {
                chatId: chat.id,
                name: chatName,
                type: chat.type,
                profile_picture: chatProfilePicture,
                last_seen: lastActive,
                isOnline: isOnline,
                other_user_id: other_user_id,
                lastReadMessageId: lastReadMessageId
            },

            messages:
                chat.ChatMessages.map(msg => ({
                    id: msg.id,
                    message: msg.message,
                    sender_id: msg.sender_id,
                    sender_name: msg.sender ? msg.sender.full_name : null,
                    sender_profile_picture: msg.sender ? msg.sender.profile_picture : null,
                    created_at: msg.createdAt,
                    reply_to_message_id: msg.reply_to_message_id
                }))
        };
    };