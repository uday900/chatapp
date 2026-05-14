export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
  CHAT_SETTINGS: 'chat_settings'
};


export const VALIDATION_RULES = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD_MIN_LENGTH: 8,
  MESSAGE_MAX_LENGTH: 2000,
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 20
};

export const getProfileImage = (name, userId) => {
  if (name && !userId) {
    // console.log("Generating avatar for:", name, userId);
    return "https://ui-avatars.com/api/?name=" + encodeURIComponent(name) + "&background=random&size=128";
  }
  return "https://i.pravatar.cc/150?img=" + userId;
};