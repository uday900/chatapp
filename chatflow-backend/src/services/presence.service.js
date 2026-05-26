const redis = require("../config/redis");
const User = require("../models/User");


exports.setUserOnline = async (userId) => {
    console.log(`Setting user ${userId} online in Redis`);
    await redis.set(
        `presence:USER_${userId}`,
        "online",
        "EX",
        30
    );
};

exports.setUserOffline = async (userId) => {
    await redis.del(`presence:USER_${userId}`);

    await User.update(
        {
            last_seen: new Date()
        },
        {
            where: {
                id: userId
            }
        }
    )
    console.log(`Set user ${userId} offline and updated last_seen`);
};

exports.isUserOnline = async (userId) => {
    const status = await redis.get(`presence:USER_${userId}`);
    return status === "online";
};