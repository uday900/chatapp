const chatSocket =require("./chat.socket");

module.exports = (io) => {
    io.on("connection", (socket) => {
        console.log(
            "User connected to socket:",
            socket.id
        );

        /*
          Register socket events
        */
        chatSocket(io, socket);

        socket.on("disconnect", () => {
            console.log(
                "User disconnected:",
                socket.id
            );
        });
    });
};