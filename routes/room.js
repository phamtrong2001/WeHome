const express = require('express');
const router = express.Router();
const {filters} = require("pug");
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
            res.status(400).send({'message': 'Invalid roomId'});
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
            res.status(400).json({'message': 'Invalid roomId'});
            return;
        }
        await models.room.destroy({
            where: {
                room_id: req.params["roomId"]
            }
        });
        res.status(200).json({'message': 'Success'});
    } catch (err) {
        res.status(500).json({message: err});
    }
}
router.delete('/:roomId', deleteRoom);

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
        res.status(200).json({'message': 'OK'});
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
            if (!req.body.filter) {
                room = await models.room.findAll({
                    where: {
                        host_id: req.body.hostId
                    }
                });
            } else if (req.body.filter != 'Empty') {
                let condition;
                if (req.body.filter == 'Arriving soon') {
                    condition = 'begin_date Between Current_date() AND (Current_date() + 3)';
                } else if (req.body.filter == 'Checking out') {
                    condition = 'end_date Between Current_date() AND (Current_date() + 3)'
                } else if (req.body.filter == 'Currently hosting') {
                    condition = 'begin_date <= Current_date() AND end_date > Current_date()';
                }
                room = await models.room.findAll({
                    where: {
                        host_id: req.body.hostId,
                        room_id: {
                            [Op.in]: db.literal(
                                '( Select room_id From rental' +
                                ' Where rental.room_id = room.room_id' +
                                ' And ' + condition +
                                ' And status = CONFIRMED' +
                                ')'
                            )
                        }
                    }
                });
            } else {
                room = await models.room.findAll({
                    where: {
                        host_id: req.body.hostId,
                        room_id: {
                            [Op.notIn]: db.literal(
                                '( Select room_id From rental' +
                                ' Where rental.room_id = room.room_id' +
                                ' And begin_date < Current_date() ' +
                                ' And status = CONFIRMED' +
                                ')'
                            )
                        }
                    }
                });
            }

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