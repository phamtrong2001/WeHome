const express = require('express');
const {models, db} = require("../sequelize/conn");
const router = express.Router();
const Room = require("../utils/room");
const passport = require("passport");
const auth = require("../middlewares/auth");

passport.use('user', auth.jwtStrategy);

/**
 * Create Feedback
 */
async function createFeedback(req, res) {
    try {
        const newFeedback = {
            room_id: req.body.room_id,
            client_id: req.body.client_id,
            feedback: req.body.feedback,
            rate: req.body.rate
        }
        if (newFeedback.rate) {
            await Room.ratedRoom(newFeedback.room_id, newFeedback.rate);
        }
        await models.feedback.create(newFeedback);
        res.status(200).json({'message': 'OK'});
    } catch (err) {
        console.log(err);
        res.status(500).json({message: err});
    }
}

router.post('/create', passport.authenticate('user', {session: false}), createFeedback);

async function getFeedbackByRoomId(req, res) {
    try {
        const limit = req.query.limit || 20;
        const page = req.query.page || 1;

        const feedbacks = await models.feedback.findAll({
            where: {
                room_id: req.params.roomId
            },
            order: [["last_update", "DESC"]]
        });
        res.status(200).json({
            total: feedbacks.length,
            feedbacks: feedbacks.slice((page - 1) * limit, page * limit)
        });
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
}

router.get('/:roomId', passport.authenticate('user', {session: false}), getFeedbackByRoomId);

module.exports = router;