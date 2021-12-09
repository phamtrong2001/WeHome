const express = require('express');
const passport = require("passport");
const auth = require("../middlewares/auth");
const {models} = require("../sequelize/conn");
const {route} = require("express/lib/router");
const {Op} = require("sequelize");
const router = express.Router();

passport.use('admin', auth.isAdmin);
passport.use('user', auth.jwtStrategy);

router.get('/', /*passport.authenticate('user', {session: false}),*/ async function (req, res) {
    try {
        const limit = req.query.limit || 20;
        const page = req.query.page || 1;

        const facilities = await models.facility.findAll();
        res.status(200).json({
            total: facilities.length,
            facilities: facilities.slice((page - 1) * limit, page * limit)
        });
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
});

router.post('/create', passport.authenticate('admin', {session: false}), async function (req, res) {
    try {
        const facilities = req.body.facilities;
        for (let facility of facilities) {
            await models.facility.create(facility);
        }
        res.status(200).send('OK');
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
});

router.post('/delete', passport.authenticate('admin', {session: false}), async function (req, res) {
    try {
        const facilities = req.body.facilities;
        await models.facility.destroy({
            where: {
                facility: {
                    [Op.in]: facilities
                }
            }
        })
        res.status(200).send('OK');
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
});

module.exports = router;
