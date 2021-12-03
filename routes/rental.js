const express = require('express');
const router = express.Router();
const {models} = require("../sequelize/conn");
const bodyParser = require('body-parser')
const jwt = require("jsonwebtoken");
const passport = require("passport");
const auth = require("../middlewares/auth");

router.use(bodyParser.urlencoded({extended: false}))
router.use(bodyParser.json())

passport.use('user', auth.jwtStrategy);
passport.use('admin', auth.isAdmin);
passport.use('host', auth.isHost);

router.get('/', passport.authenticate('admin', {session: false}), async function (req, res) {
    try {
        const limit = req.query.limit || 20;
        const page = req.query.page || 1;

        await models.rental.findAll().then(function (project) {
            if (project.length) res.status(200).json(project.slice((page - 1) * limit, page * limit));
            else res.status(404).json({'message': 'Rental not found'});
        })
    } catch (err) {
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

        if (curUser.role != 'admin' && curUser.user_id !== userId) {
            res.status(400).json({'message': 'Invalid UserId supplied'})
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
                    if (project.length) {
                        res.status(200).json(project.slice((page - 1) * limit, page * limit))
                        return
                    }
                    res.status(404).json({'message': 'Rental not found'});
                })
                return
            }
            res.status(400).json({'message': 'Invalid UserId supplied'})
        });
    } catch (err) {
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

        if (curUser.role != 'admin' && curUser.user_id !== hostId) {
            res.status(400).json({'message': 'Invalid HostId supplied'})
            return
        }
        await models.user.findOne({
            where: {
                user_id: hostId
            }
        }).then(async function (project) {
            console.log(project);
            if (project) {
                if (project.role !== "host") {
                    res.status(400).json({'message': 'Invalid HostId supplied'})
                    return
                }
                await models.rental.findAll({
                    include: {
                        model: models.room,
                        required: true,
                        where: {host_id: hostId}
                    }
                }).then(function (project) {
                    if (project.length) {
                        res.status(200).json(project.slice((page - 1) * limit, page * limit))
                    } else res.status(404).json({'message': 'Rental not found'});
                })
                return;
            }
            res.status(400).json({'message': 'Invalid HostId supplied'})
        });
    } catch (err) {
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
            if (project) {
                await models.room.findByPk(project.room_id).then(async function (room) {
                    if (curUser.role != 'admin' && curUser.user_id !== room.host_id && curUser.user_id !== project.client_id) {
                        res.status(401).send("Unauthorized");
                        return
                    }
                });
                res.status(200).json(project);
                return
            }
            res.status(404).json({'message': 'Rental not found'});
        })
    } catch (err) {
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
                    if (curUser.role != 'admin' && curUser.user_id !== room.host_id && curUser.user_id !== project.client_id) {
                        res.status(401).send("Unauthorized");
                        return;
                    }
                });
                const updateRental = {
                    rental_id: rentalId,
                    room_id: req.body.roomId,
                    begin_date: req.body.beginDate,
                    end_date: req.body.endDate,
                    status: req.body.status || project.status,
                    cost: req.body.cost,
                    client_id: req.body.clientId
                }
                let change = false;
                if (project.status !== updateRental.status && updateRental.status !== "UNCONFIRMED") change = true;
                await models.rental.update(updateRental, {
                    where: {
                        rental_id: rentalId
                    }
                })
                res.status(200).json({'message': 'OK'});
                if (!change) return;
                let content;
                if (req.body.status === "CONFIRMED") content = curUser.name + " has accepted your rental";
                if (req.body.status === "RETURNED") content = "The " + curUser.name + " has confirmed check-out";
                if (req.body.status === "REJECTED") content = curUser.name + " has rejected your rental";
                const createNotification = {
                    user_id: project.client_id,
                    content: content,
                    status: 0
                }
                await models.notification.create(createNotification);
                return
            }
            res.status(404).json({'message': 'Rental not found'});
        })
    } catch (err) {
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
            rental_id: req.body.rentalId,
            room_id: req.body.roomId,
            begin_date: req.body.beginDate,
            end_date: req.body.endDate,
            status: 0,
            cost: req.body.cost,
            client_id: payload.user_id
        }
        await models.rental.create(newRental);
        res.status(200).json({'message': 'OK'});
        await models.room.findOne({
            where: {
                room_id: req.body.roomId
            }
        }).then(async function (project) {
            const newNotification = {
                user_id: project.host_id,
                content: "The " + curUser.name + " has created a rental of your room",
                status: "UNCONFIRMED"
            }
            await models.notification.create(newNotification)
        })
    } catch (err) {
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
                if (curUser.role != 'admin' && project.client_id !== curUser.user_id) {
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
            res.status(404).json({'message': 'Rental not found'});
        })
    } catch (err) {
        res.status(500).send(err);
    }
}

router.delete('/:rentalId', passport.authenticate('user', {session: false}), deleteRentalById);

module.exports = router;
