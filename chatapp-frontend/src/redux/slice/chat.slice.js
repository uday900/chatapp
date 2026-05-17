import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { showError } from "../../utils/toast";
import { API_ENDPOINTS } from "../../utils/endpoints";
import api from "../../api/axios";

const initialState = {
    chats: [],
    selectedChat: null,

    chatsLoading: false,
    chatsError: null,

    messages: {},
    messagesLoading: false,
    messagesError: null,
}

// ==============================
// Get My Chats API
// ==============================
export const getMyChatsApi = createAsyncThunk(
    "chat/getMyChatsApi",
    async (_, { rejectWithValue }) => {
        try {
            console.log("Fetching chats...");

            const response = await api.get(
                API_ENDPOINTS.CHATS
            );

            console.log("Chats Response:", response.data);

            /**
             * Expected response:
             * {
             *   success: true,
             *   data: []
             * }
             */

            return response.data?.data || [];
        } catch (error) {
            console.error("Get chats error:", error);

            const message =
                error?.response?.data?.message ||
                "Failed to load chats";

            showError(message);

            return rejectWithValue(message);
        }
    }
);

// ==============================
// Get Chat Messages API
// ==============================
export const getChatMessagesApi = createAsyncThunk(
    "chat/getChatMessagesApi",
    async (chatId, { rejectWithValue }) => {
        try {
            console.log(
                "Fetching messages for chatId:",
                chatId
            );

            const response = await api.get(
                API_ENDPOINTS.CHAT_MESSAGES(chatId)
            );

            console.log(
                "Messages Response:",
                response.data
            );

            /**
             * Actual response:
             * {
             *   success: true,
             *   data: {
             *     chat: {},
             *     messages: []
             *   }
             * }
             */

            return {
                chatId,
                chat: response.data?.data?.chat || null,
                messages:
                    response.data?.data?.messages || [],
            };
        } catch (error) {
            console.error(
                "Get messages error:",
                error
            );

            const message =
                error?.response?.data?.message ||
                "Failed to load messages";

            showError(message);

            return rejectWithValue(message);
        }
    }
);

// ==============================
// Clear chat messages API
// ==============================
export const clearChatMessagesApi = createAsyncThunk(
    "chat/clearChatMessagesApi",
    async (chatId, { rejectWithValue }) => {
        try {
            const response = await api.delete(
                API_ENDPOINTS.CHAT_CLEAR(chatId)
            );
            return {
                chatId,
                data: response?.data,
            };
        } catch (error) {
            console.error("Clear chat error:", error?.response?.data || error.message);
            const message =
                error?.response?.data?.message ||
                "Failed to clear chat";
            showError(message);
            return rejectWithValue(message);
        }
    }
);

// ==============================
// Mark chat message as read API
// ==============================
export const markChatMessagesRead = createAsyncThunk(
    "chat/markChatMessagesRead",
    async ({ chatId, lastReadMessageId = 0 }, { rejectWithValue }) => {
        try {
            console.log("Making an api call to /chats/${chatId}/messages/read?lastReadMessageId=${lastReadMessageId}",)
            const response = api.put(
                `/chats/${chatId}/messages/read?lastReadMessageId=${lastReadMessageId}`,
                {}
            )
            return {
                chatId,
                lastReadMessageId,
                data: response?.data
            }
        } catch (error) {
            console.error(error?.response?.data);
            return rejectWithValue(error?.response?.data || error.message);
        }
    }
);

// ==============================
// Slice
// ==============================
const chatSlice = createSlice({
    name: "chat",
    initialState,
    reducers: {
        setSelectedChat: (state, action) => {
            console.log(`Selected chat [${action.payload?.chatId}]:`, action.payload);
            state.selectedChat = action.payload;
        },
        clearSelectedChat: (state) => {
            state.selectedChat = null;
        },
        clearChatError: (state) => {
            state.chatsError = null;
        },

        clearMessagesError: (state) => {
            state.messagesError = null;
        },

        appendNewMessage: (state, action) => {

            console.log("Appending new message:", action.payload);
            const newMessage = action.payload;
            const chatId = newMessage.chatId;

            if (!state.messages[chatId]) {
                state.messages[chatId] = [];
            }

            const alreadyExists = state.messages[chatId].some(
                (msg) => msg.id === newMessage.id
            );

            if (!alreadyExists) {
                state.messages[chatId].push(newMessage);
            }

            // also update last message in sidebar
            state.chats = state.chats.map((chat) =>
                chat.chatId === chatId
                    ? {
                        ...chat,
                        lastMessage: {
                            id: newMessage.id,
                            message: newMessage.message,
                            sender_id: newMessage.sender_id,
                            created_at: newMessage.created_at,
                        },
                        unreadCount:
                            state.selectedChat?.chatId === chatId
                                ? 0
                                : (chat.unreadCount || 0) + 1,
                    }
                    : chat
            )
                .sort((a, b) => {
                    const aTime = a.lastMessage?.created_at
                        ? new Date(a.lastMessage.created_at).getTime()
                        : 0;

                    const bTime = b.lastMessage?.created_at
                        ? new Date(b.lastMessage.created_at).getTime()
                        : 0;

                    return bTime - aTime; // latest first
                });;
        },

        resetUnreadCount: (state, action) => {
            const chatId = action.payload;
            state.chats = state.chats.map((chat) =>
                chat.chatId === chatId
                    ? { ...chat, unreadCount: 0 }
                    : chat
            );
            /*
    also update selectedChat
    */
            if (
                state.selectedChat?.chatId === chatId
            ) {
                state.selectedChat = {
                    ...state.selectedChat,
                    unreadCount: 0
                };
            }
        },

        markMessagesRead: (state, action) => {
            console.log("payload for markMessagesRead:", action.payload);
            const { chatId, lastReadMessageId } = action.payload;
            const parsedChatId = Number(chatId);
            console.log(
                "payload chatId:",
                parsedChatId
            );
            state.chats = state.chats.map((chat) =>
                chat.chatId === parsedChatId
                    ? { ...chat, lastReadMessageId }
                    : chat
            );



            state.chats.forEach((chat) => {
                console.log(
                    "state chatId:",
                    chat.chatId,
                    "match:",
                    chat.chatId === parsedChatId
                );
            });
            // also update on side bar
            if (state.selectedChat?.chatId === parsedChatId) {
                state.selectedChat.lastReadMessageId =
                    Number(lastReadMessageId);
            }
            console.log("updated selected chat lastread", state.selectedChat);
        }

    },
    extraReducers: (builder) => {
        builder
            .addCase(getMyChatsApi.pending, (state) => {
                state.chatsLoading = true;
                state.chatsError = null;
            })
            .addCase(getMyChatsApi.fulfilled, (state, action) => {
                state.chatsLoading = false;
                state.chats = action.payload;
                state.chatsError = null;
                if (
                    action.payload?.length > 0 &&
                    !state.selectedChat
                ) {
                    state.selectedChat =
                        action.payload[0];
                }
            })
            .addCase(getMyChatsApi.rejected, (state, action) => {
                state.chatsLoading = false;
                state.chatsError = action.payload || "Failed to load chats";
            })

            // ==============================
            // Get Chat Messages
            // ==============================
            .addCase(getChatMessagesApi.pending, (state) => {
                state.messagesLoading = true;
                state.messagesError = null;
            })

            .addCase(
                getChatMessagesApi.fulfilled,
                (state, action) => {
                    state.messagesLoading = false;
                    state.messagesError = null;

                    console.log(
                        "Storing messages for chatId:",
                        action.payload.chatId,
                        action.payload.messages
                    );
                    // store messages by chatId
                    state.messages[action.payload.chatId] =
                        action.payload.messages;

                    /**
                     * Also update selected chat
                     * with fresh chat details from API
                     */
                    state.selectedChat = action.payload.chat;
                }
            )

            .addCase(
                getChatMessagesApi.rejected,
                (state, action) => {
                    state.messagesLoading = false;
                    state.messagesError =
                        action.payload ||
                        "Failed to load messages";
                }
            )
            .addCase(clearChatMessagesApi.fulfilled, (state, action) => {
                const chatId = action.payload.chatId;
                state.messages[chatId] = [];
                state.chats = state.chats.map((chat) =>
                    chat.chatId === chatId
                        ? {
                            ...chat,
                            lastMessage: null,
                            lastReadMessageId: 0,
                        }
                        : chat
                );
                if (state.selectedChat?.chatId === chatId) {
                    state.selectedChat = {
                        ...state.selectedChat,
                        lastReadMessageId: 0,
                    };
                }
            });
    }
});

export const {
    setSelectedChat,
    clearSelectedChat,
    clearChatError,
    clearMessagesError,

    appendNewMessage,
    resetUnreadCount,
    markMessagesRead
} = chatSlice.actions;

export default chatSlice.reducer;