const express = require('express');
const router = express.Router();
const models = require("../sequelize/conn");


/**
 * Get all room
 */
async function getRooms(req, res) {
    const rooms = await models.room.findAll({limit: 100});
    res.status(200).json(rooms);
}

router.get('/', getRooms);
/**
 * Get room by id
 */
async function getRoomById(req, res) {
    const room = await models.room.findByPk(req.params["roomId"]);
    if (!room) {
        res.status(400).send({'message': 'Invalid roomId'});
        return;
    }
    res.status(200).json(room);
}

router.get('/:roomId', getRoomById);

/**
 * Update room by id
 */
async function updateRoom(req, res) {
    const room = await models.room.findByPk(req.params["roomId"]);
    if (!room) {
        res.status(400).json({'message': 'Invalid roomId'});
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
    res.status(200).json({'message': 'OK'});
}
router.put('/:roomId', updateRoom);

/**
 * Delete room by id
 */
async function deleteRoom(req, res) {
    const room = await models.room.findByPk(req.params["roomId"]);
    if (!room) {
        res.status(400).json({'message': 'Invalid roomId'});
        return;
    }
    await models.room.destroy({
        where: {
            room_id: req.params["roomId"]
        }
    });
    res.status(200).json({'message': 'Success'});
}
router.delete('/:roomId', deleteRoom);

/**
 * Create room
 */
async function createRoom(req, res) {
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
    res.status(200).json({'message': 'OK'});
}

router.get('/create', createRoom);

async function filterRoom(res, req) {
    const latitude = res.body.latitude;
    const longitude = res.body.longitude;
    const room = await models.room.findAll({
        where: {

        }
    })
}
router.get('/filter', filterRoom);

module.exports = router;