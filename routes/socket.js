const io = require( "socket.io" )();
const socketapi = {
    io: io
};

io.on("connection", function(socket) {
    const userId = socket.handshake.query.userId;
    socket.join(userId);
    console.log(`User ${userId} connected`);
    socket.on("sendNoti", (receiver_id, content) => {
        io.to(receiver_id.toString()).emit("receiveNoti", content, new Date());
    })
});

module.exports = socketapi;