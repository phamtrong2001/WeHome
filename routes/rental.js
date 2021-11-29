const express = require('express');
const router = express.Router();
const models = require("../sequelize/conn");
const bodyParser = require('body-parser')

router.use(bodyParser.urlencoded({ extended: false }))
router.use(bodyParser.json())

router.get('/',async function (rep,res){
    await models.rental.findAll().then(function (project){
        if (project.length) res.status(200).json(project);
        else res.status(404).json({'message': 'Rental not found'});
    })
})

/**
 * Get rental by user id
 * @author: admin, host, user
 */

async function getRentalByUserId(req, res) {
    let userId = req.params.userId;

    if (parseInt(userId).toString() !== userId){
        res.status(400).json({'message' : 'Invalid UserId supplied'})
        return
    }
    await models.user.findOne({
        where: {
            user_id : userId
        }
    }).then( async function (project) {
        if (project) {
            await models.rental.findAll({
                where: {
                    client_id: userId
                }
            }).then(async function (project) {
                if (project.length) {
                    res.status(200).json(project)
                    return
                }
                res.status(404).json({'message': 'Rental not found'});
                return
            })
        }
        res.status(400).json({'message' : 'Invalid UserId supplied'})
    });
}

router.get('/user/:userId', getRentalByUserId);

/**
 * Get rental by host id
 * @author: admin, host
 */

async function getRentalByHostId(req, res) {
    let hostId = req.params.hostId;

    if (parseInt(hostId).toString() !== hostId){
        res.status(400).json({'message' : 'Invalid HostId supplied'})
        return
    }
    await models.user.findOne({
        where: {
            user_id : hostId
        }
    }).then( async function (project) {
        if (project) {
            if (project.role !== "host") {
                res.status(400).json({'message': 'Invalid HostId supplied'})
                return
            }
            models.room.hasMany(models.rental, {foreignKey: 'room_id'})
            models.rental.belongsTo(models.room, {foreignKey: 'room_id'})
            await models.rental.findAll({
                include: {
                    model: models.room,
                    required: true,
                    where: {host_id: hostId}
                }
            }).then(function (project) {
                if (project.length){
                    res.status(200).json(project)
                }
                else res.status(404).json({'message': 'Rental not found'});
            })
            return;
        }
        res.status(400).json({'message' : 'Invalid HostId supplied'})
    });
}

router.get('/host/:hostId', getRentalByHostId);

/**
 * Get rental by id
 * @author: admin, host, user
 */
async function getRentalById(req, res) {
    let rentalId = req.params.rentalId;

    if (parseInt(rentalId).toString() !== rentalId){
        res.status(400).json({'message' : 'Invalid rentalId supplied'})
        return
    }
    await models.rental.findByPk(rentalId).then(async function (project) {
        if (project) {
            res.status(200).json(project);
            return
        }
        res.status(404).json({'message': 'Rental not found'});
    })
}

router.get('/:rentalId', getRentalById);

/**
 * Update rental by id
 * @author: admin, user
 */
async function updateRentalById(req, res) {
    let rentalId = req.params.rentalId;

    if (parseInt(rentalId).toString() !== rentalId){
        res.status(400).json({'message' : 'Invalid rentalId supplied'})
        return
    }
    await models.rental.findByPk(rentalId).then(async function (project) {
        if (project) {
            const updateRental = {
                rental_id: rentalId,
                room_id: req.body.roomId,
                begin_date: req.body.beginDate,
                end_date: req.body.endDate,
                status: req.body.status,
                cost: req.body.cost,
                client_id: req.body.clientIdId
            }
            await models.rental.update(updateRental, {
                where: {
                    rental_id: rentalId
                }
            })
            res.status(200).json({'message': 'OK'});
            let content;
            if(req.body.status === 1) content = "Landlord has accepted your rental";
            else content = "Your landlord has rejected your rental";
            const createNotification = {
                user_id: req.body.client_id,
                content: content,
                status: 0
            }
            await models.notification.create(createNotification);
            return
        }
        res.status(404).json({'message': 'Rental not found'});
    })
}
router.put('/:rentalId',updateRentalById);

/**
 * Create rental
 * @author : admin , user
 */
async function createRental(req, res) {
    const newRental = {
        rental_id : req.body.rentalId,
        room_id: req.body.roomId,
        begin_date: req.body.beginDate,
        end_date: req.body.endDate,
        status: 0,
        cost: req.body.cost,
        client_id: req.body.clientId
    }
    await models.rental.create(newRental);
    res.status(200).json({'message': 'OK'});
    await models.room.findOne({
        where: {
            room_id: req.body.roomId
        }
    }).then(async function(project){
        const newNotification = {
            user_id: project.host_id,
            content: "The user has created a rental of your room",
            status: 0
        }
        await models.notification.create(newNotification)
    })
}
router.post('/create',createRental);

/**
 * Delete rental by id
 * @author : admin, user
 */
async function deleteRentalById(req, res) {
    let rentalId = req.params.rentalId;

    if (parseInt(rentalId).toString() !== rentalId){
        res.status(400).json({'message' : 'Invalid rentalId supplied'})
        return
    }
    await models.rental.findByPk(rentalId).then(async function (project) {
        if (project) {
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
}
router.delete('/:rentalId',deleteRentalById);

module.exports = router;