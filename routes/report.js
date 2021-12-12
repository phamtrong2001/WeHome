const express = require('express');
const router = express.Router();
const {models, db} = require("../sequelize/conn");
const passport = require("passport");
const auth = require("../middlewares/auth");

passport.use('user', auth.jwtStrategy);
passport.use('admin', auth.isAdmin);

/**
 * Create report
 */
async function createReport(req, res) {
    try {
        const newReport = {
            description: req.body.description,
        }
        await models.report.create(newReport);
        res.status(200).json({'message': 'OK'});
    } catch (err) {
        console.log(err);
        res.status(500).json({message: err});
    }
}

router.post('/create', createReport);

router.get('/', passport.authenticate('admin', {session: false}), async function (req, res) {
   try {
       const limit = req.query.limit || 20;
       const page = req.query.page || 1;

       const reports = await models.report.findAll({
           order: [["last_update", "DESC"]]
       });
       res.status(200).json({
           total: reports.length,
           reports: reports.slice((page - 1) * limit, page * limit)
       });
   } catch (err) {
       console.log(err);
       res.status(500).send(err);
   }
});

module.exports = router;
