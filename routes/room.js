const express = require('express');
const router = express.Router();
const {models, db} = require('../sequelize/conn');
const {Sequelize, Op, QueryTypes} = require("sequelize");

async function search(req, res) {
    try {
        const lat = req.body.latitude;
        const long = req.body.longitude;
        const radius = req.body.radius;
        const distance = db.Sequelize.literal("6371 * acos(cos(radians("+lat+")) * cos(radians(latitude)) * cos(radians("+long+") - radians(longitude)) + sin(radians("+lat+")) * sin(radians(latitude)))");
        const rooms = await models.room.findAll({
            attributes: [
                'room_id',
                'room_name',
                'latitude',
                'longitude',
                'host_id',
                'price',
                [distance,'distance']
            ],
            where: db.Sequelize.where(distance, "<=", radius),
            // having: {
            //     distance: {
            //         [Op.lte]: radius
            //     }
            // },
            order: db.Sequelize.col('distance'),
            limit: 100
        });
        var response = [];
        for (let room of rooms) {
            let images = await models.image.findAll({
                where: {
                    room_id: room.room_id
                }
            });
            response.push({
                'room_id': room.room_id,
                'room_name': room.room_name,
                'latitude': room.latitude,
                'longitude': room.longitude,
                'host_id': room.host_id,
                'price': room.price,
                'image': images
            });
        }
        // console.log(response);
        res.status(200).json(response);
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
}
router.post('/search', search);

module.exports = router;
