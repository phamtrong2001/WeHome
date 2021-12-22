const express = require('express');
const router = express.Router();
const Image = require('../utils/image');
const Facility = require('../utils/facility');
const Rental = require('../utils/rental');
const {models, db} = require('../sequelize/conn');
const {Sequelize, Op, QueryTypes} = require("sequelize");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const auth = require("../middlewares/auth");

passport.use('host', auth.isHost);
passport.use('admin', auth.isAdmin);

router.get('/room-type', async function (req, res) {
    try {
        const limit = req.query.limit || 20;
        const page = req.query.page || 1;
        let roomTypes = await models.room_type.findAll();
        res.status(200).json({
            total: roomTypes.length,
            roomTypes: roomTypes.slice((page - 1) * limit, page * limit)
        });
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
})

async function getRoomType(room_type_id) {
    try {
        let roomType = await models.room_type.findByPk(room_type_id);
        return roomType.room_type;
    } catch (err) {
        throw err;
    }
}

/**
 * Get all room
 */
async function getRooms(req, res) {
    try {
        const limit = req.query.limit || 20;
        const page = req.query.page || 1;
        const rooms = await models.room.findAll();
        res.status(200).json({
            total: rooms.length,
            rooms: rooms.slice((page - 1) * limit, page * limit)
        });
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
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
        let facilities = await Facility.getFacilityRoom(room.room_id);
        // let roomType = await getRoomType(room.room_type_id);
        let response = {
            'room_id': room.room_id,
            'room_name': room.room_name,
            'latitude': room.latitude,
            'longitude': room.longitude,
            'address_id': room.address_id,
            'room_type': room.room_type_id,
            'num_guest': room.num_guest,
            'num_bed': room.num_bed,
            'num_bedroom': room.num_bedroom,
            'num_bathroom': room.num_bathroom,
            'rule': room.rule,
            'accommodation_type': room.accommodation_type,
            'confirmed': room.confirmed,
            'rate': room.rate,
            'total_rated': room.total_rated,
            'host_id': room.host_id,
            'price': room.price,
            'images': images,
            'facilities': facilities
        };
        res.status(200).json(response);
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
}

router.get('/:roomId', getRoomById);

/**
 * Update room by id
 */
async function updateRoom(req, res) {
    try {
        const payload = jwt.decode(req.headers.authorization.split(' ')[1]);
        const curUser = await models.user.findByPk(payload.user_id);

        const room = await models.room.findByPk(req.params["roomId"]);
        if (!room) {
            res.status(400).json({message: 'Invalid roomId'});
            return;
        }
        if (curUser.role != 'admin' && room.host_id != curUser.user_id) {
            res.status(401).send('Unauthorized');
            return;
        }
        const newRoom = {
            room_name: req.body.room_name,
            address_id: req.body.address_id,
            latitude: req.body.latitude,
            longitude: req.body.longitude,
            room_type_id: req.body.room_type_id,
            num_guest: req.body.num_guest,
            num_bed: req.body.num_bed,
            num_bedroom: req.body.num_bedroom,
            num_bathroom: req.body.num_bathroom,
            rule: req.body.rule,
            accommodation_type: req.body.accommodation_type,
            price: req.body.price,
            confirmed: req.body.confirmed,
            rate: req.body.rate
        }
        await models.room.update(newRoom, {
            where: {
                room_id: req.params["roomId"]
            }
        });

        const images = req.body.images;
        if (images) {
            await Image.deleteImage(req.params["roomId"]);
            await Image.createImage(req.params["roomId"], images);
        }

        const facilities = req.body.facilities;
        if (facilities) {
            await Facility.deleteFacilityRoom(req.params["roomId"]);
            await Facility.addFacilityRoom(req.params["roomId"], facilities);
        }

        res.status(200).json({message: 'OK'});
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
}

router.put('/:roomId', passport.authenticate('host', {session: false}), updateRoom);

/**
 * Delete room by id
 */
async function deleteRoom(req, res) {
    try {
        const payload = jwt.decode(req.headers.authorization.split(' ')[1]);
        const curUser = await models.user.findByPk(payload.user_id);

        const room = await models.room.findByPk(req.params["roomId"]);
        if (!room) {
            res.status(400).json({message: 'Invalid roomId'});
            return;
        }
        if (curUser.role != 'admin' && room.host_id != curUser.user_id) {
            res.status(401).send('Unauthorized');
            return;
        }
        await Image.deleteImage(req.params["roomId"]);
        await Facility.deleteFacilityRoom(req.params["roomId"]);
        await Rental.deleteRental(req.params["roomId"]);
        await models.favourite.destroy({
            where: {
                room_id: req.params["roomId"]
            }
        });
        await models.feedback.destroy({
            where: {
                room_id: req.params["roomId"]
            }
        });
        await models.room.destroy({
            where: {
                room_id: req.params["roomId"]
            }
        });
        res.status(200).json({message: 'Success'});
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
}

router.delete('/:roomId', passport.authenticate('host', {session: false}), deleteRoom);

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

        const lat = req.body.latitude || 21.028195403;
        const long = req.body.longitude || 105.854159778;
        const radius = req.body.radius || 20;
        const begin_date = req.body.begin_date || "1970-1-1";
        const end_date = req.body.end_date || "1970-1-1";
        const num_guest = req.body.num_guest || 0;

        const distance = db.Sequelize.literal("6371 * acos(cos(radians(" + lat + ")) * cos(radians(latitude)) * cos(radians(" + long + ") - radians(longitude)) + sin(radians(" + lat + ")) * sin(radians(latitude)))");
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
                'total_rated',
                'host_id',
                'price',
                [distance, 'distance']
            ],
            where: db.Sequelize.where(distance, "<=", radius),
            having: {
                confirmed: true,
                num_guest: {
                    [Op.gte]: num_guest
                },
                room_id: {
                    [Op.notIn]: db.literal(
                        '( SELECT room_id FROM rental' +
                        ' WHERE rental.room_id = room.room_id' +
                        ' AND ((begin_date BETWEEN ' + begin_date + ' AND ' + end_date + ')' +
                        ' OR (end_date BETWEEN ' + begin_date + ' AND ' + end_date + ')) ' +
                        ' AND status = "CONFIRMED"' +
                        ')'
                    )
                }
            },
            order: db.Sequelize.col('price'),
            limit: 100
        });
        let response = [];
        for (let i = (page - 1) * limit; i < page * limit; i++) {
            if (i >= rooms.length) break;
            let room = rooms[i];
            let images = await Image.getImage(room.room_id);
            let facilities = await Facility.getFacilityRoom(room.room_id);
            // let roomType = await getRoomType(room.room_type_id);
            response.push({
                'room_id': room.room_id,
                'room_name': room.room_name,
                'latitude': room.latitude,
                'longitude': room.longitude,
                'address_id': room.address_id,
                'room_type': room.room_type_id,
                'num_guest': room.num_guest,
                'num_bed': room.num_bed,
                'num_bedroom': room.num_bedroom,
                'num_bathroom': room.num_bathroom,
                'rule': room.rule,
                'accommodation_type': room.accommodation_type,
                'confirmed': room.confirmed,
                'rate': room.rate,
                'total_rated': room.total_rated,
                'host_id': room.host_id,
                'price': room.price,
                'images': images,
                'facilities': facilities
            });
        }
        // console.log(response);
        res.status(200).json({
            total: rooms.length,
            rooms: response
        });
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
        const payload = jwt.decode(req.headers.authorization.split(' ')[1]);

        const newRoom = {
            room_name: req.body.room_name,
            address_id: req.body.address_id,
            latitude: req.body.latitude,
            longitude: req.body.longitude,
            room_type_id: req.body.room_type_id,
            host_id: req.body.host_id || payload.user_id,
            num_guest: req.body.num_guest,
            num_bed: req.body.num_bed,
            num_bedroom: req.body.num_bedroom,
            num_bathroom: req.body.num_bathroom,
            rule: req.body.rule,
            accommodation_type: req.body.accommodation_type,
            price: req.body.price,
            confirmed: req.body.confirmed,
            rate: req.body.rate
        }
        await models.room.create(newRoom);
        let rooms = await models.room.findAll({
            where: {
                room_name: newRoom.room_name,
                host_id: newRoom.host_id
            },
            order: [["room_id", "DESC"]],
            limit: 1
        });
        let room = rooms[0];
        const images = req.body.images;
        await Image.createImage(room.room_id, images);
        const facilities = req.body.facilities;
        await Facility.addFacilityRoom(room.room_id, facilities);
        res.status(200).json({
            room_id: room.room_id,
            message: 'OK'
        });
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
}

router.post('/create', passport.authenticate('host', {session: false}), createRoom);

/**
 * Get rooms by host_id
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
async function filterRoom(req, res) {
    try {
        const limit = req.query.limit || 20;
        const page = req.query.page || 1;

        let confirmed = req.body.confirmed;

        if (confirmed !== false) {
            confirmed = true;
        }

        let rooms;
        if (req.body.host_id) {
            if (!req.body.filter) {
                rooms = await models.room.findAll({
                    where: {
                        host_id: req.body.host_id,
                        confirmed: confirmed
                    }
                });
            } else if (req.body.filter == 'Unconfirmed') {
                rooms = await models.room.findAll({
                    where: {
                        host_id: req.body.host_id,
                        confirmed: false
                    }
                });
            } else if (req.body.filter != 'Empty') {
                let condition;
                if (req.body.filter == 'Arriving soon') {
                    condition = 'begin_date BETWEEN Current_date() + 1 AND (Current_date() + 3)';
                } else if (req.body.filter == 'Checking out') {
                    condition = 'end_date BETWEEN Current_date() + 1 AND (Current_date() + 3)'
                } else if (req.body.filter == 'Currently hosting') {
                    condition = 'begin_date <= Current_date() AND end_date >= Current_date()';
                }
                rooms = await models.room.findAll({
                    where: {
                        host_id: req.body.host_id,
                        confirmed: true,
                        room_id: {
                            [Op.in]: db.literal(
                                '( SELECT room_id FROM rental' +
                                ' WHERE rental.room_id = room.room_id' +
                                ' AND ' + condition +
                                ' AND status = "CONFIRMED"' +
                                ')'
                            )
                        }
                    }
                });
            } else {
                rooms = await models.room.findAll({
                    where: {
                        host_id: req.body.host_id,
                        confirmed: confirmed,
                        room_id: {
                            [Op.notIn]: db.literal(
                                '( SELECT room_id FROM rental' +
                                ' WHERE rental.room_id = room.room_id' +
                                ' AND begin_date <= Current_date()' +
                                ' AND end_date >= Current_date()' +
                                ' AND status = "CONFIRMED"' +
                                ')'
                            )
                        }
                    }
                });
            }
        } else {
            rooms = await models.room.findAll({
                where: {
                    confirmed: confirmed
                }
            });
        }
        let response = [];
        for (let i = (page - 1) * limit; i < page * limit; i++) {
            if (i >= rooms.length) break;
            let room = rooms[i];
            let images = await Image.getImage(room.room_id);
            let facilities = await Facility.getFacilityRoom(room.room_id);
            // let roomType = await getRoomType(room.room_type_id);
            response.push({
                'room_id': room.room_id,
                'room_name': room.room_name,
                'latitude': room.latitude,
                'longitude': room.longitude,
                'address_id': room.address_id,
                'room_type': room.room_type_id,
                'num_guest': room.num_guest,
                'num_bed': room.num_bed,
                'num_bedroom': room.num_bedroom,
                'num_bathroom': room.num_bathroom,
                'rule': room.rule,
                'accommodation_type': room.accommodation_type,
                'confirmed': room.confirmed,
                'rate': room.rate,
                'total_rated': room.total_rated,
                'host_id': room.host_id,
                'price': room.price,
                'images': images,
                'facilities': facilities
            });
        }
        res.status(200).json({
            total: rooms.length,
            rooms: response
        });
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
}

router.post('/filter', filterRoom);

router.get('/:roomId/rental_date', async function (req, res) {
    try {
        const room_id = req.params.roomId;
        const rentals = await models.rental.findAll({
            where: {
                room_id: room_id,
                status: "CONFIRMED"
            }
        });
        const response = rentals.map(rental => {
            return {
                begin_date: rental.begin_date,
                end_date: rental.end_date
            };
        });
        res.status(200).json(response);
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
});

router.post('/admin-search', passport.authenticate('admin', {session: false}), async function (req, res) {
    try {
        const limit = req.query.limit || 20;
        const page = req.query.page || 1;

        const lat = req.body.latitude;
        const long = req.body.longitude;
        const radius = req.body.radius || 20;
        const room_name = req.body.room_name || "";
        const host_id = req.body.host_id;
        const confirmed = req.body.confirmed;

        let response = [];
        let rooms;

        if (lat && long) {
            const distance = db.Sequelize.literal("6371 * acos(cos(radians(" + lat + ")) * cos(radians(latitude)) * cos(radians(" + long + ") - radians(longitude)) + sin(radians(" + lat + ")) * sin(radians(latitude)))");
            rooms = await models.room.findAll({
                where: db.Sequelize.where(distance, "<=", radius),
                having: {
                    room_name: {
                        [Op.like]: "%" + room_name + "%"
                    }
                }
            });
        } else {
            rooms = await models.room.findAll({
                where: {
                    room_name: {
                        [Op.like]: "%" + room_name + "%"
                    }
                }
            });
        }
        for (let room of rooms) {
            if (host_id && room.host_id != host_id) {
                continue;
            }
            if (confirmed !== undefined && room.confirmed !== confirmed) {
                continue;
            }
            response.push(room);
        }
        res.status(200).json({
            total: response.length,
            rooms: response.slice((page - 1) * limit, page * limit)
        });
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
});

module.exports = router;