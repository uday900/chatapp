
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
    CHATS: "/chats/my-chats",
    CHAT_MESSAGES: (chatId) => `/chats/${chatId}/messages`,
    GROUP_DETAILS: (chatId) => `/chats/${chatId}/group-details`,

    // Chat socket events
    CHAT_JOIN: "chat:join",
    CHAT_ERROR: "chat:error",
    CHAT_LEAVE: "chat:leave",
    MESSAGE_SEND: "message:send",
    MESSAGE_RECEIVE: "message:new",
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
    GROUP_DETAILS: "/group-details/:chatId"
}