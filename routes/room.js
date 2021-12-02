const express = require('express');
const router = express.Router();
const Image = require('../controllers/image');
const {models, db} = require('../sequelize/conn');
const {Sequelize, Op, QueryTypes} = require("sequelize");

/**
 * Get all room
 */
async function getRooms(req, res) {
    try {
        const limit = req.query.limit || 20;
        const page = req.query.page || 1;
        const rooms = await models.room.findAll();
        let response = [];
        for (let i = (page-1) * limit; i < page * limit; i++) {
            let room = rooms[i];
            if (!room) break;
            let images = await Image.getImage(room.room_id);
            response.push({
                'room_id': room.room_id,
                'room_name': room.room_name,
                'latitude': room.latitude,
                'longitude': room.longitude,
                'address_id': room.address_id,
                'roomType': room.room_type_id,
                'numGuest': room.num_guest,
                'numBed': room.num_bed,
                'numBedroom': room.num_bedroom,
                'numBathroom': room.num_bathroom,
                'rule': room.rule,
                'accommodationType': room.accommodation_type,
                'confirmed': room.confirmed,
                'rate': room.rate,
                'host_id': room.host_id,
                'price': room.price,
                'image': images
            });
        }
        res.status(200).json(response);
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
            return;
        }
        let images = await Image.getImage(room.room_id);
        let response = {
            'room_id': room.room_id,
            'room_name': room.room_name,
            'latitude': room.latitude,
            'longitude': room.longitude,
            'address_id': room.address_id,
            'roomType': room.room_type_id,
            'numGuest': room.num_guest,
            'numBed': room.num_bed,
            'numBedroom': room.num_bedroom,
            'numBathroom': room.num_bathroom,
            'rule': room.rule,
            'accommodationType': room.accommodation_type,
            'confirmed': room.confirmed,
            'rate': room.rate,
            'host_id': room.host_id,
            'price': room.price,
            'image': images
        };
        res.status(200).json(response);
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
            room_name: req.body.roomName,
            address_id: req.body.addressId,
            latitude: req.body.latitude,
            longitude: req.body.longitude,
            roomType: req.body.roomType,
            hostId: req.body.hostId,
            numGuest: req.body.numGuest,
            numBed: req.body.numBed,
            numBedroom: req.body.numBedroom,
            numBathroom: req.body.numBathroom,
            rule: req.body.rule,
            accommodationType: req.body.accommodationType,
            price: req.body.price,
            confirmed: req.body.confirmed,
            rate: req.body.rate
        }
        await models.room.update(newRoom, {
            where: {
                room_id: req.params["roomId"]
            }
        });

        await Image.deletImage(req.params["roomId"]);

        const images = req.body.image;
        await Image.createImage(req.params["roomId"], images);

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
        await Image.deleteImage(req.params["roomId"]);
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
        const limit = req.query.limit || 20;
        const page = req.query.page || 1;

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
                'address_id',
                'room_type_id',
                'num_guest',
                'num_bed',
                'num_bedroom',
                'num_bathroom',
                'rule',
                'accommodation_type',
                'confirmed',
                'rate',
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
        let response = [];
        for (let i = (page-1) * limit; i < page * limit; i++) {
            let room = rooms[i];
            if (!room) break;
            let images = await Image.getImage(room.room_id);
            response.push({
                'room_id': room.room_id,
                'room_name': room.room_name,
                'latitude': room.latitude,
                'longitude': room.longitude,
                'address_id': room.address_id,
                'roomType': room.room_type_id,
                'numGuest': room.num_guest,
                'numBed': room.num_bed,
                'numBedroom': room.num_bedroom,
                'numBathroom': room.num_bathroom,
                'rule': room.rule,
                'accommodationType': room.accommodation_type,
                'confirmed': room.confirmed,
                'rate': room.rate,
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
            room_name: req.body.roomName,
            address_id: req.body.addressId,
            latitude: req.body.latitude,
            longitude: req.body.longitude,
            roomType: req.body.roomType,
            hostId: req.body.hostId,
            numGuest: req.body.numGuest,
            numBed: req.body.numBed,
            numBedroom: req.body.numBedroom,
            numBathroom: req.body.numBathroom,
            rule: req.body.rule,
            accommodationType: req.body.accommodationType,
            price: req.body.price,
            confirmed: req.body.confirmed,
            rate: req.body.rate
        }
        await models.room.create(newRoom);
        let room = await models.room.findOne({
            where: {
                room_name: newRoom.room_name
            }
        });
        const images = req.body.image;
        await Image.createImage(room.room_id, images);
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
        const limit = req.query.limit || 20;
        const page = req.query.page || 1;

        let rooms;
        if (req.body.hostId) {
            rooms = await models.room.findAll({
                where: {
                    host_id: req.body.hostId
                }
            });
        }
        if (!rooms) {
            res.status(200).send({message: 'No room'});
            return;
        }
        let response = [];
        for (let i = (page-1) * limit; i < page * limit; i++) {
            let room = rooms[i];
            if (!room) break;
            let images = await Image.getImage(room.room_id);
            response.push({
                'room_id': room.room_id,
                'room_name': room.room_name,
                'latitude': room.latitude,
                'longitude': room.longitude,
                'address_id': room.address_id,
                'roomType': room.room_type_id,
                'numGuest': room.num_guest,
                'numBed': room.num_bed,
                'numBedroom': room.num_bedroom,
                'numBathroom': room.num_bathroom,
                'rule': room.rule,
                'accommodationType': room.accommodation_type,
                'confirmed': room.confirmed,
                'rate': room.rate,
                'host_id': room.host_id,
                'price': room.price,
                'image': images
            });
        }
        res.status(200).json(response);
    } catch (err) {
        res.status(500).json({message: err});
    }
}
router.post('/filter', filterRoom);

module.exports = router;