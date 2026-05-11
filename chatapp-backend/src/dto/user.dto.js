exports.mapUserResponse = (user) => {
  return {
    id: user.id,
    full_name: user.full_name,
    email: user.email,
    mobile: user.mobile,
    profile_picture: user.profile_picture,
    last_seen: user.last_seen
  };
};