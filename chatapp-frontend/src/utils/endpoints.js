
export const API_ENDPOINTS = {
    // Auth endpoints
    LOGIN: '/auth/login',
    FORGOT_PASSWORD: '/auth/forgot-password',
    VERIFY_FORGOT_OTP: '/auth/verify-forgot-otp',
    RESET_PASSWORD: '/auth/reset-password',
    REGISTER: '/auth/register',
    REFRESH_TOKEN: '/auth/refresh',
    LOGOUT: '/auth/logout',

    // User endpoints
    PROFILE: '/user/profile',
    UPDATE_PROFILE: '/user/profile',
    USERS: '/users',
    USER_DETAILS: (userId) => `/users/${userId}`,
    CHAT_MEMBER: (chatId, memberId) => `/chats/${chatId}/members/${memberId}`,
  
    // Chat endpoints
    CHATS: "/chats/my-chats",
    CHAT_MESSAGES: (chatId) => `/chats/${chatId}/messages`,
    CHAT_CLEAR: (chatId) => `/chats/${chatId}/clear`,
    CHAT_ADD_MEMBERS: (chatId) => `/chats/${chatId}/members`,
    CHAT_AVAILABLE_MEMBERS: (chatId) => `/chats/${chatId}/available-members`,
    CHAT_CREATE: "/chats/create",
    CONTACTS: "/users/contacts",
    USER_BY_MOBILE: (mobile) => `/users/mobile/${mobile}`,
    GROUP_DETAILS: (chatId) => `/chats/${chatId}/group-details`,

    // Chat socket events
    CHAT_JOIN: "chat:join",
    CHAT_ERROR: "chat:error",
    CHAT_LEAVE: "chat:leave",
    MESSAGE_SEND: "message:send",
    MESSAGE_RECEIVE: "message:new",
    MESSAGE_DELETE: "message:delete",
    MESSAGE_DELETED: "message:deleted",
    MESSAGE_UPDATE: "message:update",
    MESSAGE_UPDATED: "message:updated",
    MESSAGES_READ: "messages:read",
    
    HEARTBEAT: "presence:heartbeat",
    PRESENCE_ONLINE: "presence:online",
    PRESENCE_OFFLINE: "presence:offline",
    TYPING_START: "typing:start",
    TYPING_STOP: "typing:stop",

    TYPING_STARTED: "typing:started",
    TYPING_STOPPED: "typing:stopped",

    // File upload
    UPLOAD_FILE: '/upload',
    UPLOAD_AVATAR: '/upload/avatar'
}

export const REACT_ENDPOINTS = {
    HOME: "/",
    LOGIN: "/auth/login",
    SIGNUP: "/auth/register",
    FORGOT_PASSWORD: "/auth/forgot",
    VERIFY_OTP: "/auth/verify-otp",
    RESET_PASSWORD: "/auth/reset",
    GROUP_DETAILS: "/group-details/:chatId",
    SETTINGS: "/settings"
}
