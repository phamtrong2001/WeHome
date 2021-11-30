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
        res.status(200).send(rooms);
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
}
router.post('/search', search);

module.exports = router;
