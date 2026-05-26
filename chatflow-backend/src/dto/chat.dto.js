const presenceService = require("../services/presence.service");

exports.mapToChatSummary = async (chat, currentUserId, unreadCount = 0) => {
    let lastMessage = null;
    const memberCount =
        chat.type === "GROUP"
            ? (chat.allMembers || []).filter(member => !member.left_at).length
            : null;

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
            created_at: lastMsg.createdAt,
            updated_at: lastMsg.updatedAt || null,
            is_deleted: lastMsg.is_deleted,
            deleted_by: lastMsg.deleted_by,
            deleted_at: lastMsg.deletedAt || null
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
        memberCount,
        unreadCount
    };
};

exports.mapChatMessagesResponse =
    async (chat, currentUserId) => {
        const memberCount =
            chat.type === "GROUP"
                ? (chat.allMembers || []).filter(member => !member.left_at).length
                : null;
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
        const readReceipts =
            chat.type === "GROUP"
                ? (chat.allMembers || [])
                    .filter(member => !member.left_at)
                    .map(member => ({
                        userId: member.user_id,
                        name: member.user?.full_name || null,
                        profile_picture: member.user?.profile_picture || null,
                        lastReadMessageId: member.last_read_message_id || 0
                    }))
                : [];
        return {
            chat: {
                chatId: chat.id,
                name: chatName,
                type: chat.type,
                profile_picture: chatProfilePicture,
                last_seen: lastActive,
                isOnline: isOnline,
                other_user_id: other_user_id,
                lastReadMessageId: lastReadMessageId,
                memberCount,
                readReceipts
            },

            messages:
                chat.ChatMessages.map(msg => ({
                    id: msg.id,
                    message: msg.message,
                    sender_id: msg.sender_id,
                    sender_name: msg.sender ? msg.sender.full_name : null,
                    sender_profile_picture: msg.sender ? msg.sender.profile_picture : null,
                    created_at: msg.createdAt,
                    updated_at: msg.updatedAt || null,
                    is_deleted: msg.is_deleted,
                    deleted_by: msg.deleted_by,
                    deleted_at: msg.deletedAt || null,
                    reply_to_message_id: msg.reply_to_message_id
                }))
        };
    };
