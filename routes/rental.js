const express = require('express');
const router = express.Router();
const {models} = require("../sequelize/conn");
const bodyParser = require('body-parser')
const jwt = require("jsonwebtoken");
const passport = require("passport");
const auth = require("../middlewares/auth");
const Image = require("../utils/image");
const Facility = require("../utils/facility");
const {deleteRentalUnconfirmed} = require("../utils/rental");

router.use(bodyParser.urlencoded({extended: false}))
router.use(bodyParser.json())

passport.use('user', auth.jwtStrategy);
passport.use('admin', auth.isAdmin);
passport.use('host', auth.isHost);

router.get('/', passport.authenticate('admin', {session: false}), async function (req, res) {
    try {
        const limit = req.query.limit || 20;
        const page = req.query.page || 1;

        await models.rental.findAll().then(async function (project) {
            let response = [];
            for (let i = (page - 1) * limit; i < page * limit; i++) {
                if (i >= project.length) break;
                let rental = project[i];
                let images = await Image.getImage(rental.room_id);
                let room = await models.room.findByPk(rental.room_id);
                response.push({
                    rental_id: rental.rental_id,
                    room_id: rental.room_id,
                    room_name: room.room_name,
                    begin_date: rental.begin_date,
                    end_date: rental.end_date,
                    status: rental.status,
                    cost: rental.cost,
                    room: room.host_id,
                    client_id: rental.client_id,
                    images: images,
                    last_update: rental.last_update
                });
            }
            res.status(200).json({
                total: project.length,
                rentals: response
            });
        })
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
})

/**
 * Get rental by user id
 * @author: user
 */
async function getRentalByUserId(req, res) {
    try {
        const payload = jwt.decode(req.headers.authorization.split(' ')[1]);
        const curUser = await models.user.findByPk(payload.user_id);

        const limit = req.query.limit || 20;
        const page = req.query.page || 1;

        let userId = req.params.userId;

        if (curUser.role != 'admin' && curUser.user_id != userId) {
            res.status(401).json({'message': 'Unauthorized'})
            return
        }
        await models.user.findOne({
            where: {
                user_id: userId
            }
        }).then(async function (project) {
            if (project) {
                await models.rental.findAll({
                    where: {
                        client_id: userId
                    }
                }).then(async function (project) {
                    let response = [];
                    for (let i = (page - 1) * limit; i < page * limit; i++) {
                        if (i >= project.length) break;
                        let rental = project[i];
                        let images = await Image.getImage(rental.room_id);
                        let room = await models.room.findByPk(rental.room_id);
                        response.push({
                            rental_id: rental.rental_id,
                            room_id: rental.room_id,
                            room_name: room.room_name,
                            begin_date: rental.begin_date,
                            end_date: rental.end_date,
                            status: rental.status,
                            cost: rental.cost,
                            host_id: room.host_id,
                            client_id: rental.client_id,
                            images: images,
                            last_update: rental.last_update
                        });
                    }
                    res.status(200).json({
                        total: project.length,
                        rentals: response
                    });
                })
                return;
            }
            res.status(400).json({'message': 'Invalid UserId supplied'})
        });
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
}

router.get('/user/:userId', passport.authenticate('user', {session: false}), getRentalByUserId);

/**
 * Get rental by host id
 * @author: admin, host
 */

async function getRentalByHostId(req, res) {
    try {
        const payload = jwt.decode(req.headers.authorization.split(' ')[1]);
        const curUser = await models.user.findByPk(payload.user_id);

        const limit = req.query.limit || 20;
        const page = req.query.page || 1;

        let hostId = req.params.hostId;

        if (curUser.role != 'admin' && curUser.user_id != hostId) {
            res.status(400).json({'message': 'Invalid HostId supplied'})
            return
        }
        await models.user.findByPk(hostId).then(async function (project) {
            // console.log(project);
            if (project) {
                if (project.role != "host" && project.role != 'admin') {
                    res.status(400).json({'message': 'Invalid HostId supplied'})
                    return
                }
                await models.rental.findAll({
                    include: {
                        model: models.room,
                        as: 'room',
                        required: true,
                        where: {host_id: hostId}
                    }
                }).then(async function (project) {
                    let response = [];
                    for (let i = (page - 1) * limit; i < page * limit; i++) {
                        if (i >= project.length) break;
                        let rental = project[i];
                        let images = await Image.getImage(rental.room_id);
                        let room = await models.room.findByPk(rental.room_id);
                        response.push({
                            rental_id: rental.rental_id,
                            room_id: rental.room_id,
                            room_name: room.room_name,
                            begin_date: rental.begin_date,
                            end_date: rental.end_date,
                            status: rental.status,
                            cost: rental.cost,
                            host_id: room.host_id,
                            client_id: rental.client_id,
                            images: images,
                            last_update: rental.last_update
                        });
                    }
                    res.status(200).json({
                        total: project.length,
                        rentals: response
                    });
                })
                return;
            }
            res.status(400).json({'message': 'Invalid HostId supplied'})
        });
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
}

router.get('/host/:hostId', passport.authenticate('host', {session: false}), getRentalByHostId);

/**
 * Get rental by id
 * @author: user
 */
async function getRentalById(req, res) {
    try {
        const payload = jwt.decode(req.headers.authorization.split(' ')[1]);
        const curUser = await models.user.findByPk(payload.user_id);

        let rentalId = req.params.rentalId;

        await models.rental.findByPk(rentalId).then(async function (project) {
            await models.room.findByPk(project.room_id).then(async function (room) {
                if (curUser.role != 'admin' && curUser.user_id != room.host_id && curUser.user_id != project.client_id) {
                    res.status(401).send("Unauthorized");
                    return
                }
                let response;
                let images = await Image.getImage(project.room_id);
                response = {
                    rental_id: project.rental_id,
                    room_id: project.room_id,
                    room_name: room.room_name,
                    begin_date: project.begin_date,
                    end_date: project.end_date,
                    status: project.status,
                    cost: project.cost,
                    host_id: room.host_id,
                    client_id: project.client_id,
                    images: images,
                    last_update: project.last_update
                };
                res.status(200).json(response);
            });
        })
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
}

router.get('/:rentalId', passport.authenticate('user', {session: false}), getRentalById);

/**
 * Update rental by id
 * @author: user
 */
async function updateRentalById(req, res) {
    try {
        const payload = jwt.decode(req.headers.authorization.split(' ')[1]);
        const curUser = await models.user.findByPk(payload.user_id);

        let rentalId = req.params.rentalId;

        await models.rental.findByPk(rentalId).then(async function (project) {
            if (project) {
                await models.room.findByPk(project.room_id).then(async function (room) {
                    if (curUser.role != 'admin' && curUser.user_id != room.host_id && curUser.user_id != project.client_id) {
                        res.status(401).send("Unauthorized");
                        return;
                    }
                });
                const updateRental = {
                    room_id: req.body.room_id || project.room_id,
                    begin_date: req.body.begin_date || project.begin_date,
                    end_date: req.body.end_date || project.end_date,
                    status: req.body.status || project.status,
                    cost: req.body.cost,
                    client_id: req.body.client_id || project.client_id
                }
                await models.rental.update(updateRental, {
                    where: {
                        rental_id: rentalId
                    }
                });
                let rejectedClients = [];
                if (project.status === 'UNCONFIRMED' && updateRental.status === 'CONFIRMED') {
                    rejectedClients = await deleteRentalUnconfirmed(updateRental.room_id, updateRental.begin_date, updateRental.end_date);
                }
                res.status(200).json(rejectedClients);
                return
            }
        })
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
}

router.put('/:rentalId', passport.authenticate('user', {session: false}), updateRentalById);

/**
 * Create rental
 * @author : admin , user
 */
async function createRental(req, res) {
    try {
        const payload = jwt.decode(req.headers.authorization.split(' ')[1]);
        const curUser = await models.user.findByPk(payload.user_id);

        const newRental = {
            room_id: req.body.room_id,
            begin_date: req.body.begin_date,
            end_date: req.body.end_date,
            status: "UNCONFIRMED",
            cost: req.body.cost,
            client_id: req.body.client_id || payload.user_id
        }
        await models.rental.create(newRental);
        const rental = await models.rental.findOne({
            where: {
                room_id: newRental.room_id,
                begin_date: newRental.begin_date,
                end_date: newRental.end_date,
                cost: newRental.cost,
                client_id: newRental.client_id
            }
        });
        res.status(200).json(rental);
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
}

router.post('/create', passport.authenticate('user', {session: false}), createRental);

/**
 * Delete rental by id
 * @author : admin, user
 */
async function deleteRentalById(req, res) {
    try {
        const payload = jwt.decode(req.headers.authorization.split(' ')[1]);
        const curUser = await models.user.findByPk(payload.user_id);

        let rentalId = req.params.rentalId;

        await models.rental.findByPk(rentalId).then(async function (project) {
            if (project) {
                if (curUser.role != 'admin' && project.client_id != curUser.user_id) {
                    res.status(401).send('Unauthorized');
                    return;
                }
                await models.rental.destroy({
                    where: {
                        rental_id: rentalId
                    }
                })
                res.status(200).json({'message': 'OK'});
                return
            }
        })
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
}

router.delete('/:rentalId', passport.authenticate('user', {session: false}), deleteRentalById);

async function filterHostRentalByStatus(req, res) {
    try {
        const payload = jwt.decode(req.headers.authorization.split(' ')[1]);

        const limit = req.query.limit || 20;
        const page = req.query.page || 1;

        const rentals = await models.rental.findAll({
            include: {
                model: models.room,
                as: 'room',
                required: true,
                where: {host_id: payload.user_id}
            },
            where: {
                status: req.body.status
            }
        });

        let response = [];
        for (let i = (page - 1) * limit; i < page * limit; i++) {
            if (i >= rentals.length) break;
            let rental = rentals[i];
            let images = await Image.getImage(rental.room_id);
            let room = await models.room.findByPk(rental.room_id);
            response.push({
                rental_id: rental.rental_id,
                room_id: rental.room_id,
                room_name: room.room_name,
                begin_date: rental.begin_date,
                end_date: rental.end_date,
                status: rental.status,
                cost: rental.cost,
                host_id: room.host_id,
                client_id: rental.client_id,
                images: images,
                last_update: rental.last_update
            });
        }
        res.status(200).json({
            total: rentals.length,
            rentals: response
        });
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
}

router.post('/host/filter', passport.authenticate('host', {session: false}), filterHostRentalByStatus)

async function filterUserRentalByStatus(req, res) {
    try {
        const payload = jwt.decode(req.headers.authorization.split(' ')[1]);

        const limit = req.query.limit || 20;
        const page = req.query.page || 1;

        const rentals = await models.rental.findAll({
            where: {
                client_id: payload.user_id,
                status: req.body.status
            }
        });

        let response = [];
        for (let i = (page - 1) * limit; i < page * limit; i++) {
            if (i >= rentals.length) break;
            let rental = rentals[i];
            let images = await Image.getImage(rental.room_id);
            let room = await models.room.findByPk(rental.room_id);
            response.push({
                rental_id: rental.rental_id,
                room_id: rental.room_id,
                room_name: room.room_name,
                begin_date: rental.begin_date,
                end_date: rental.end_date,
                status: rental.status,
                cost: rental.cost,
                host_id: room.host_id,
                client_id: rental.client_id,
                images: images,
                last_update: rental.last_update
            });
        }
        res.status(200).json({
            total: rentals.length,
            rentals: response
        });
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
}

router.post('/user/filter', passport.authenticate('user', {session: false}), filterUserRentalByStatus)

module.exports = router;
