const {models, db} = require("../sequelize/conn");
const io = require( "socket.io" )();
const socketapi = {
    io: io
};

io.on("connection", function(socket) {
    const userId = socket.handshake.query.userId;
    socket.join(userId);
    console.log(`User ${userId} connected`);
    socket.on("send_rental", async (receiver_id, content) => {
        io.to(receiver_id.toString()).emit("receive_rental", content, new Date());
        const newNotification = {
            user_id: receiver_id,
            content: content,
            type: "RENTAL",
            status: "UNREAD"
        };
        await models.notification.create(newNotification);
        console.log(content);
    });

    socket.on("send_feedback", async (roomId, content) => {
        const room = await models.room.findOne({
            where: {
                room_id: roomId
            }
        })
        io.to(room.host_id.toString()).emit("receive_feedback", roomId, content, new Date());
        const newNotification = {
            user_id: room.host_id,
            content: content,
            type: "FEEDBACK",
            status: "UNREAD"
        };
        await models.notification.create(newNotification);
    })
});

module.exports = socketapi;