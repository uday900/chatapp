exports.mapToChatSummary = (chat, currentUserId, unreadCount = 0) => {
    let lastMessage = null;
    if (chat.ChatMessages && chat.ChatMessages.length > 0) {
        const lastMsg = chat.ChatMessages[chat.ChatMessages.length - 1];
        lastMessage = {
            id: lastMsg.id,
            message: lastMsg.message,
            sender_id: lastMsg.sender_id,
            created_at: lastMsg.createdAt
        };
    }
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

    return {
        id: chat.id,
        lastMessage: lastMessage,
        name: chatName,
        profile_picture: chatProfilePicture,
        type: chat.type,
        unreadCount: unreadCount
    };
};

exports.mapChatMessagesResponse =
    (chat, currentUserId) => {
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
        return {
            chat: {
                id: chat.id,
                name: chatName,
                type: chat.type,
                profile_picture: chatProfilePicture
            },

            messages:
                chat.ChatMessages.map(msg => ({
                    id: msg.id,
                    message: msg.message,
                    sender_id: msg.sender_id,
                    sender_name: msg.sender ? msg.sender.full_name : null,
                    sender_profile_picture: msg.sender ? msg.sender.profile_picture : null,
                    created_at:
                        msg.createdAt
                }))
        };
    };