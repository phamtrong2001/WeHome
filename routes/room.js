const express = require('express');
const router = express.Router();
const models = require("../sequelize/conn");
const {Op} = require("sequelize");
const {filters} = require("pug");


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

async function filterRoom(req, res) {
    try {
        let room;
        if (req.body.hostId) {
            room = await models.room.findAll({
                where: {
                    host_id: req.body.hostId
                }
            });
        } else if (req.body.lat && req.body.long) {
            let findObj = {
                latitude: req.body.lat,
                longitude: req.body.long,
            };

            room = await models.room.findAll({
                where: {
                    latitude: {
                        [Op.gt]: findObj.latitude - 0.5,
                        [Op.lt]: findObj.latitude + 0.5
                    },
                    longitude: {
                        [Op.gt]: findObj.longitude - 0.5,
                        [Op.lt]: findObj.longitude + 0.5
                    }
                }
            });
            room = room.filter(value1 => {
                let lat1 = findObj.latitude;
                let lat2 = value1.get("latitude");
                let lon1 = findObj.longitude;
                let lon2 = value1.get("longitude")
                const R = 6371e3; // metres
                const φ1 = lat1 * Math.PI/180; // φ, λ in radians
                const φ2 = lat2 * Math.PI/180;
                const Δφ = (lat2-lat1) * Math.PI/180;
                const Δλ = (lon2-lon1) * Math.PI/180;

                const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                    Math.cos(φ1) * Math.cos(φ2) *
                    Math.sin(Δλ/2) * Math.sin(Δλ/2);
                const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

                let d = R * c; // in metres
                return d < 20000;
            })
        }

        if (!room) {
            res.status(400).send({'message': 'No room'});
        }
        res.status(200).json(room);
    } catch (err) {
        res.status(500).json({message: err});
    }
}
router.post('/filter', filterRoom);

module.exports = router;