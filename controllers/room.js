const {models} = require("../sequelize/conn");
const {where} = require("sequelize");
module.exports.ratedRoom = async function updateRate(room_id) {
    try {
        const feedbacks = await models.feedback.findAll({
            where: {
                room_id: room_id
            }
        });
        let rate = 0;
        let numOfRated = 0;
        for (let feedback of feedbacks) {
            if (feedback.rate) {
                rate += feedback.rate;
                numOfRated++;
            }
        }
        rate /= numOfRated;
        await models.room.update({rate: rate}, {
            where: {
                room_id: room_id
            }
        });
    } catch (err) {
        console.log(err);
        throw err;
    }
}