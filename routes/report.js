const express = require('express');
const router = express.Router();
const {models, db} = require("../sequelize/conn");

/**
 * Create report
 */
async function createReport(req, res) {
    try {
        const newReport = {
            user_id: req.body.user_id,
            description: req.body.description,
        }
        await models.report.create(newReport);
        res.status(200).json({'message': 'OK'});
    } catch (err) {
        res.status(500).json({message: err});
    }
}

router.post('/create', createReport);

module.exports = router;
