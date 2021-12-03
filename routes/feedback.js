const express = require('express');
const {models, db} = require("../sequelize/conn");
const router = express.Router();


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
        await models.feedback.create(newFeedback);
        res.status(200).json({'message': 'OK'});
    } catch (err) {
        res.status(500).json({message: err});
    }
}

router.post('/create', createFeedback);

module.exports = router;
