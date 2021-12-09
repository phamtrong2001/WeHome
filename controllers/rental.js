const {models} = require("../sequelize/conn");
const {Op} = require("sequelize");
module.exports.deleteRentalUnconfirmed = async function deleteRentalUnconfirmed(room_id, begin_date, end_date) {
    try {
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
    } catch (err) {
        throw err;
    }
}