const express = require('express');
const router = express.Router();
const models = require('../sequelize/conn');

async function getUserById(req, res) {
    const user = await models.user.findByPk(req.params["userId"]);
    res.status(200).json(user);
}

/**
 * Get user by id
 */
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
