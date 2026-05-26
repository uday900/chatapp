import { io } from "socket.io-client";

import { STORAGE_KEYS } from "../utils/constants";

const wsUrl = import.meta.env.VITE_WEBSOCKET_URL || ENV.WS_URL;

let socket = null;

export const connectSocket = () => {

    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    if (!token) {
        console.error("No token found. Cannot initialize socket.");
        return;
    };
    if (socket?.connected) {
        console.log("Socket already connected.");
        return;
    }

    socket = io(wsUrl, {
        transports: ['websocket'],
        auth: {
            token: `Bearer ${token}`,
        },
    });

    socket.on("connect", () => {
        console.log("Socket connected:", socket.id);
    });

    socket.on("connect_error", (err) => {
        console.error("Socket connection error:", err);
    });

    socket.on("disconnect", () => {
        console.log("Socket disconnected.");
    });

    return socket;
};

export const getSocket = () => {
    if (!socket) {
        console.warn("Socket not initialized. Reconnecting...");
        connectSocket();
    }
    return socket;
}

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
        console.log("Socket disconnected and cleaned up.");
    } else {
        console.log("No socket to disconnect.");
    }
};