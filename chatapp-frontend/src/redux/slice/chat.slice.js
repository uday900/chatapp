import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
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
// Slice
// ==============================
const chatSlice = createSlice({
    name: "chat",
    initialState,
    reducers: {
        setSelectedChat: (state, action) => {
            console.log("Selected chat:", action.payload);
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

            const newMessage = action.payload;
            const chatId = newMessage.chat_id;

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
                chat.id === chatId
                    ? {
                        ...chat,
                        lastMessage: {
                            id: newMessage.id,
                            message: newMessage.message,
                            sender_id: newMessage.sender_id,
                            created_at: newMessage.createdAt,
                        },
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
            );
    }
});

export const {
    setSelectedChat,
    clearSelectedChat,
    clearChatError,
    clearMessagesError,

    appendNewMessage,
} = chatSlice.actions;

export default chatSlice.reducer;