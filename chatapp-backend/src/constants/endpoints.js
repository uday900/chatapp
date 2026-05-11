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

    BY_ID: "/:id"
};