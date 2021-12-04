const {db, models} = require("../sequelize/conn");
const {QueryTypes} = require("sequelize");

module.exports.getFacilityRoom = async function getFacilityRoom(room_id) {
    try {
        let facilities = await models.facility_room.findAll({
            where: {
                room_id: room_id
            }
        });
        return facilities.map(obj => {
            return obj.facility_id;
        });
    } catch (err) {
        throw err;
    }
}

module.exports.deleteFacilityRoom = async function deleteFacilityRoom(room_id) {
    try {
        await models.facility_room.destroy({
            where: {
                room_id: room_id
            }
        });
    } catch (err) {
        throw err;
    }
}

module.exports.addFacilityRoom = async function addFacilityRoom(room_id, facilities) {
    try {
        for (let facilityId of facilities) {
            await models.facility_room.create({
                room_id: room_id,
                facility_id: facilityId
            });
        }
    } catch (err) {
        throw err;
    }
}