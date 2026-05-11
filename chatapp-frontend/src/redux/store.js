import { configureStore } from "@reduxjs/toolkit";

import authReducer from './slice/authSlice'
import chatReducer from './slice/chat.slice'

const store = configureStore({
    reducer: {
        // key_name: slice_file
        auth: authReducer,
        chat: chatReducer
    }
});

export default store;