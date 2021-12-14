const express = require('express');
const passport = require("passport");
const auth = require("../middlewares/auth");
const jwt = require("jsonwebtoken");
const {models} = require("../sequelize/conn");
const router = express.Router();

passport.use('user', auth.jwtStrategy);

router.get('/', passport.authenticate('user', {session: false}), async function (req, res) {
    try {
        const payload = jwt.decode(req.headers.authorization.split(' ')[1]);
        const favours = await models.favourite.findAll({
            where: {
                user_id: payload.user_id
            }
        });
        res.status(200).json(favours.map(favour => {
            return favour.room_id;
        }));
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
});

router.post('/create', passport.authenticate('user', {session: false}), async function (req, res) {
    try {
        const payload = jwt.decode(req.headers.authorization.split(' ')[1]);
        const newFavour = {
            user_id: payload.user_id,
            room_id: req.body.room_id
        }
        await models.favourite.create(newFavour);
        res.status(200).send("OK");
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
});

router.post('/delete', passport.authenticate('user', {session: false}), async function (req, res) {
    try {
        const payload = jwt.decode(req.headers.authorization.split(' ')[1]);
        const room_id = req.body.room_id;
        if (!room_id) {
            res.status(400).send("No room_id is supplied");
            return;
        }
        await models.favourite.destroy({
            where: {
                user_id: payload.user_id,
                room_id: room_id
            }
        })
        res.status(200).send("OK");
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
});

module.exports = router;