const API_BASE_URL = "/api";
const API_VERSION = "v1";
const URL_SEPARATOR = "/";

const API_URL = API_BASE_URL + URL_SEPARATOR + API_VERSION;

module.exports = {
    API_BASE_URL,
    API_VERSION,
    URL_SEPARATOR,
    API_URL,

    USERS: API_URL + "/users",
    AUTH: API_URL + "/auth",
    CHATS: API_URL + "/chats",
    USER_CONTACT: "/contacts",
    SEARCH_BY_MOBILE: "/mobile/:mobileNumber",

    BY_ID: "/:id",

    SOCKET_EVENTS: {
        CHAT_JOIN: "chat:join",
        MESSAGE_SEND: "message:send",
        MESSAGE_NEW: "message:new",
        MESSAGE_DELETE: "message:delete",
        MESSAGE_DELETED: "message:deleted",
        MESSAGE_UPDATE: "message:update",
        MESSAGE_UPDATED: "message:updated",
        TYPING_START: "typing:start",
        TYPING_STOP: "typing:stop",
        TYPING_STARTED: "typing:started",
        TYPING_STOPPED: "typing:stopped",
        PRESENCE_HEARTBEAT: "presence:heartbeat",
        PRESENCE_ONLINE: "presence:online",
        PRESENCE_OFFLINE: "presence:offline",
        MESSAGES_READ: "messages:read",
        CHAT_ERROR: "chat:error"
    },

    SOCKET_ROOMS: {
        CHAT_PREFIX: "chat_"
    }
};