const express = require('express');
const router = express.Router();
const passport = require('passport');
const auth = require("../middlewares/auth");
const jwt = require("jsonwebtoken");
const {models} = require("../sequelize/conn");

passport.use('user', auth.jwtStrategy);
passport.use('admin', auth.isAdmin);

/**
 * Get notification by user id
 * @author: admin, host, user
 */
router.get('/', passport.authenticate('user', {session: false}), async function (req,res){
    try {
        const payload = jwt.decode(req.headers.authorization.split(' ')[1]);
        await models.notification.findAll({
            where: {
                user_id: payload.user_id
            },
            order: [["last_update", "DESC"]]
        }).then(function (project){
            res.status(200).json(project);
        })
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
});

router.get('/all', passport.authenticate('admin', {session: false}), async function (req,res){
    try {
        await models.notification.findAll({
            order: [["last_update", "DESC"]]
        }).then(function (project){
            res.status(200).json(project);
        })
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
});

router.delete('/:notificationId', passport.authenticate('user', {session: false}), async function (req, res) {
   try {
        await models.notification.destroy({
            where: {
                id: req.params.notificationId
            }
        });
        res.status(200).send("OK");
   } catch (err) {
       console.log(err);
       res.status(500).send(err);
   }
});

router.put('/:notificationId', passport.authenticate('user', {session: false}), async function (req, res) {
    try {
        await models.notification.update({
            status: req.body.status
        }, {
            where: {
                id: req.params.notificationId
            }
        });
        res.status(200).send("OK");
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
});

module.exports = router;
