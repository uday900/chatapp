
export const API_ENDPOINTS = {
    // Auth endpoints
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH_TOKEN: '/auth/refresh',
    LOGOUT: '/auth/logout',

    // User endpoints
    PROFILE: '/user/profile',
    UPDATE_PROFILE: '/user/profile',
    USERS: '/users',
  
    // Chat endpoints
    CHATS: '/chats',
    CREATE_CHAT: '/chats',
    CHAT_MESSAGES: (chatId) => `/chats/${chatId}/messages`,
    SEND_MESSAGE: (chatId) => `/chats/${chatId}/messages`,
    
    // File upload
    UPLOAD_FILE: '/upload',
    UPLOAD_AVATAR: '/upload/avatar'
}

export const REACT_ENDPOINTS = {
    HOME: "/",
    LOGIN: "/login"
}