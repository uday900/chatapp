import { configureStore } from "@reduxjs/toolkit";

import authReducer from './slice/authSlice'
import chatReducer from './slice/chat.slice'
import userChatReducer from './slice/user.slice'

const store = configureStore({
    reducer: {
        // key_name: slice_file
        auth: authReducer,
        chat: chatReducer,
        userchat: userChatReducer
    }
});

export default store;