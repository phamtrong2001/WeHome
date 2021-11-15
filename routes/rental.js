const express = require('express');
const router = express.Router();
const models = require("../sequelize/conn");
const bodyParser = require('body-parser')

router.use(bodyParser.urlencoded({ extended: false }))
router.use(bodyParser.json())

router.get('/',function (rep,res){

})

/**
 * Get rental by user id
 * @author: admin, host, user
 * user_type_id = 2 => danh sách thuê các phòng của chủ trọ
 * user_type_id = 3 => danh sách thuê của người dùng
 */

async function getRentalByUserId(req, res) {
    let userId = req.params.userId;

    if (parseInt(userId).toString() !== userId){
        res.status(400).json({'message' : 'Invalid rentalId supplied'})
        return
    }
    await models.user.findOne({
        where: {
            user_id : userId
        }
    }).then( async function (project) {
        if (project) {
            if (project.user_type_id === 3) {
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
                })
            }
            models.room.hasMany(models.rental, {foreignKey: 'room_id'})
            models.rental.belongsTo(models.room, {foreignKey: 'room_id'})
            await models.rental.findAll({
                include: {
                    model: models.room,
                    required: true,
                    where: {host_id: userId}
                }
            }).then(function (project) {
                res.status(200).json(project)
            });
        }
    })
}

router.get('/user/:userId', getRentalByUserId);

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
                discount: req.body.discount,
                client_id: req.body.clientId
            }
            await models.rental.update(updateRental, {
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
        discount: req.body.discount,
        client_id: req.body.clientId
    }
    await models.rental.create(newRental);
    res.status(200).json({'message': 'OK'});
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
