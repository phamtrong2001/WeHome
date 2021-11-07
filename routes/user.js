const express = require('express');
const router = express.Router();
const models = require('../sequelize/conn');

/**
 * Get user by id
 */
async function getUserById(req, res) {
    const user = await models.user.findByPk(req.params["userId"]);
    res.status(200).json(user);
}

router.get('/:userId', getUserById);

/**
 * Update user by id
 */
router.put('/:userId', function (req, res) {
    res.send('');
});

/**
 * Delete user by id
 */
router.delete('/:userId', function (req, res) {
    res.send('');
});

module.exports = router;
