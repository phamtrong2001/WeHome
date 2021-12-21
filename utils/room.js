const {models} = require("../sequelize/conn");
const Image = require("../utils/image");
const Facility = require("../utils/facility");
const Rental = require("../utils/rental");
module.exports.ratedRoom = async function updateRate(room_id, rate) {
    try {
        const room = await models.room.findByPk(room_id);
        let total_rate = room.rate * room.total_rated + rate;
        let numOfRated = room.total_rated + 1;

        total_rate /= numOfRated;
        await models.room.update({
            rate: total_rate,
            total_rated: numOfRated
        }, {
            where: {
                room_id: room_id
            }
        });
    } catch (err) {
        throw err;
    }
}

module.exports.deleteRoom = async function deleteRoom(room_id) {
    try {
        await Image.deleteImage(room_id);
        await Facility.deleteFacilityRoom(room_id);
        await Rental.deleteRental(room_id);
        await models.favourite.destroy({
            where: {
                room_id: room_id
            }
        });
        await models.feedback.destroy({
            where: {
                room_id: room_id
            }
        });
        await models.room.destroy({
            where: {
                room_id: room_id
            }
        });
    } catch (err) {
        throw(err);
    }
}