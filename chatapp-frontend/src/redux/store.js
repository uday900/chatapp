import { configureStore } from "@reduxjs/toolkit";

import authReducer from './slice/authSlice'
const store = configureStore({
    reducer: {
        // key_name: slice_file
        auth: authReducer,
    }
});

export default store;