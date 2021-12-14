const {models} = require("../sequelize/conn");
module.exports.ratedRoom = async function updateRate(room_id, rate) {
    try {
        const room = await models.room.findByPk(room_id);
        let total_rate = room.rate * room.total_rated + rate;
        let numOfRated = room.total_rated + 1;

        total_rate /= numOfRated;
        await models.room.update({rate: total_rate}, {
            where: {
                room_id: room_id
            }
        });
    } catch (err) {
        console.log(err);
        throw err;
    }
}