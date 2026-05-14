const User = require("../models/User");
const { unauthorized, recordNotFound } = require("../utils/errorFactory");
const chatSocket = require("./chat.socket");
const presenceService = require("../services/presence.service");
const { SOCKET_EVENTS } = require("../constants/endpoints");

const jwt = require("../utils/jwt");

module.exports = (io) => {

    // Middleware to authenticate socket connections
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth?.token?.split(" ")[1] ||
                socket.handshake.headers?.authorization?.split(" ")[1];
            console.log("Authenticating socket connection with token:", token);
            if (!token) {
                console.log("No token provided for socket connection");
                return next(unauthorized("Authentication token is required"));
            }

            const decoded = jwt.verifyToken(token);

            const user = await User.findByPk(decoded.id);
            if (!user) {
                return next(recordNotFound("User not found"));
            }
            socket.user = user;

            next();

        } catch (error) {
            return next(error);
        }
    })


    io.on("connection", async (socket)  => {
        console.log(
            "User connected to socket:",
            socket.id
        );

        await presenceService.setUserOnline(socket.user.id);
        socket.broadcast.emit(
            SOCKET_EVENTS.PRESENCE_ONLINE,
            {
                userId: socket.user.id
            }
        );
        /*
          Register socket events
        */
        chatSocket(io, socket);

        socket.on("disconnect", async () => {
            console.log("User disconnected:", socket.id);
            const userId = socket.user.id;
            await presenceService.setUserOffline(userId);
            socket.broadcast.emit(
                SOCKET_EVENTS.PRESENCE_OFFLINE,
                {
                    userId: socket.user.id,
                    lastSeen: new Date()
                }
            );
        });
    });
};