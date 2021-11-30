const express = require('express');
const router = express.Router();
const {models, db} = require('../sequelize/conn');

async function search(req, res) {
    try {
        const {lat, long} = req.body;
        const rooms = await models.room.findAll({
            attributes: [
                'room_id',
                'room_name',
                'latitude',
                'longitude',
                'host_id',
                'price',
                [db.Sequelize.literal("6371 * acos(cos(radians("+lat+")) * cos(radians(latitude)) * cos(radians("+long+") - radians(longitude)) + sin(radians("+lat+")) * sin(radians(latitude)))"),'distance']
            ],
            order: db.Sequelize.col('distance'),
            limit: 10
        });
        res.status(200).send(rooms);
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
}
router.post('/search', search);

module.exports = router;
