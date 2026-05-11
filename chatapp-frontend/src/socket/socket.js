import { io } from "socket.io-client";

import { ENV } from "../config/env";
import { STORAGE_KEYS } from "../utils/constants";

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

    socket = io(ENV.WS_URL, {
        transports: ['websocket'],
        auth: {
            token: `Bearer ${token}`,
        },
    });

    socket.on("connect", () => {
        console.log("Socket connected:", socket.id);
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