var express = require('express');
var router = express.Router();

/**
 * Get user by id
 */
router.get('/:userId', function (req, res) {
    res.send(req.params["userId"]);
});

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
