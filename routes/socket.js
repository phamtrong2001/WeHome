const {models, db} = require("../sequelize/conn");
const io = require( "socket.io" )();
const socketapi = {
    io: io
};

io.on("connection", function(socket) {
    try {
        const userId = socket.handshake.query.userId;
        socket.join(userId);
        console.log(`User ${userId} connected`);
        socket.on("send_rental", async (receiver_id, content) => {
            io.to(receiver_id.toString()).emit("receive_rental", content, new Date());
            const newNotification = {
                user_id: receiver_id,
                content: content,
                type: "RENTAL",
                status: "UNREAD",
                last_update: new Date().toISOString()
            };
            await models.notification.create(newNotification);
        });

        socket.on("send_feedback", async (roomId, content) => {
            const room = await models.room.findByPk(roomId);
            io.to(room.host_id.toString()).emit("receive_feedback", content, new Date());
            const newNotification = {
                user_id: room.host_id,
                content: content,
                type: "FEEDBACK",
                status: "UNREAD",
                last_update: new Date().toISOString()
            };
            await models.notification.create(newNotification);
        })

        socket.on("send_room", async (receiver_id, content) => {
            io.to(receiver_id.toString()).emit("receive_room", content, new Date());
            const newNotification = {
                user_id: receiver_id,
                content: content,
                type: "ROOM",
                status: "UNREAD",
                last_update: new Date().toISOString()
            };
            await models.notification.create(newNotification);
        });
    } catch (err) {
        console.log(err);
        socket.emit('error', err.message);
    }
});

module.exports = socketapi;