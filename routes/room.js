const express = require('express');
const router = express.Router();
const {models, db} = require('../sequelize/conn');
const {Sequelize, Op, QueryTypes} = require("sequelize");

/**
 * Get all room
 */
async function getRooms(req, res) {
    try {
        const rooms = await models.room.findAll({limit: 100});
        res.status(200).json(rooms);
    } catch (err) {
        res.status(500).json({message: err});
    }
}
router.get('/', getRooms);

/**
 * Get room by id
 */
async function getRoomById(req, res) {
    try {
        const room = await models.room.findByPk(req.params["roomId"]);
        if (!room) {
            res.status(400).send({message: 'Invalid roomId'});
        }
        res.status(200).json(room);
    } catch (err) {
        res.status(500).json({message: err});
    }
}
router.get('/:roomId', getRoomById);

/**
 * Update room by id
 */
async function updateRoom(req, res) {
    try {
        const room = await models.room.findByPk(req.params["roomId"]);
        if (!room) {
            res.status(400).json({message: 'Invalid roomId'});
            return;
        }
        const newRoom = {
            name: req.body.name,
            address_id: req.body.address_id,
            latitude: req.body.latitude,
            longitude: req.body.longitude,
            roomType: req.body.roomType,
            hostId: req.body.hostId,
            numGuest: req.body.numGuest,
            numBed: req.body.numBed,
            numBedroom: req.body.numBedroom,
            numBathroom: req.body.numBathroom,
            rule: req.body.rule,
            accommodationType: req.body.accommodation_type,
            price: req.body.price,
            confirmed: req.body.confirmed,
            rate: req.body.rate
        }

        await models.room.update(newRoom, {
            where: {
                room_id: req.params["roomId"]
            }
        });
        res.status(200).json({message: 'OK'});
    } catch (err) {
        res.status(500).json({message: err});
    }
}
router.put('/:roomId', updateRoom);

/**
 * Delete room by id
 */
async function deleteRoom(req, res) {
    try {
        const room = await models.room.findByPk(req.params["roomId"]);
        if (!room) {
            res.status(400).json({message: 'Invalid roomId'});
            return;
        }
        await models.room.destroy({
            where: {
                room_id: req.params["roomId"]
            }
        });
        res.status(200).json({message: 'Success'});
    } catch (err) {
        res.status(500).json({message: err});
    }
}
router.delete('/:roomId', deleteRoom);

/**
 * Search room by geo coordinate
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
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

/**
 * Create room
 */
async function createRoom(req, res) {
    try {
        const newRoom = {
            name: req.body.name,
            address_id: req.body.address_id,
            latitude: req.body.latitude,
            longitude: req.body.longitude,
            roomType: req.body.roomType,
            hostId: req.body.hostId,
            numGuest: req.body.numGuest,
            numBed: req.body.numBed,
            numBedroom: req.body.numBedroom,
            numBathroom: req.body.numBathroom,
            rule: req.body.rule,
            accommodationType: req.body.accommodation_type,
            price: req.body.price,
            confirmed: req.body.confirmed,
            rate: req.body.rate
        }
        await models.room.create(newRoom);
        res.status(200).json({message: 'OK'});
    } catch (err) {
        res.status(500).json({message: err});
    }
}
router.post('/create', createRoom);

/**
 * Get rooms by hostId
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
async function filterRoom(req, res) {
    try {
        let room;
        if (req.body.hostId) {
            room = await models.room.findAll({
                where: {
                    host_id: req.body.hostId
                }
            });
        }
        if (!room) {
            res.status(200).send({message: 'No room'});
        }
        res.status(200).json(room);
    } catch (err) {
        res.status(500).json({message: err});
    }
}
router.post('/filter', filterRoom);

module.exports = router;