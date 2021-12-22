const {models} = require("../sequelize/conn");
const {Op} = require("sequelize");

module.exports.deleteRentalUnconfirmed = async function deleteRentalUnconfirmed(room_id, begin_date, end_date) {
    try {
        let rentals = await models.rental.findAll({
            where: {
                room_id: room_id,
                status: "UNCONFIRMED",
                [Op.or]: [
                    {
                        begin_date: {
                            [Op.between]: [begin_date, end_date]
                        }
                    },
                    {
                        end_date: {
                            [Op.between]: [begin_date, end_date]
                        }
                    }
                ]
            }
        });
        await models.rental.destroy({
            where: {
                room_id: room_id,
                status: "UNCONFIRMED",
                [Op.or]: [
                    {
                        begin_date: {
                            [Op.between]: [begin_date, end_date]
                        }
                    },
                    {
                        end_date: {
                            [Op.between]: [begin_date, end_date]
                        }
                    }
                ]
            }
        });
        return rentals.map(rental => {
            return rental.client_id;
        });
    } catch (err) {
        throw err;
    }
}

module.exports.deleteRental = async function deleteRentalByRoom_id(room_id) {
    try {
        await models.rental.destroy({
            where: {
                room_id: room_id
            }
        });
    } catch (err) {
        throw err;
    }
}