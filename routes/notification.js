const express = require('express');
const models = require("../sequelize/conn");
const router = express.Router();
const passport = require('passport');

/**
 * Get notification by user id
 * @author: admin, host, user
 */
router.get('/', passport.authenticate('jwt', {session: false}), async function (rep,res){
    const payload = jwt.decode(req.headers.authorization.split(' ')[1]);
    await models.rental.findAll({
        where: {
            user_id: payload.user_id
        }
    }).then(function (project){
        if (project.length) res.status(200).json(project);
        else res.status(404).json({'message': 'Notification not found'});
    })
})

module.exports = router;
