const express = require('express');
const router = express.Router();

/**
 * Get room by id
 */
router.get('/:roomId', function (req, res) {
    res.send('');
});

/**
 * Update room by id
 */
router.put('/:roomId', function (req, res) {
    res.send('');
});

/**
 * Delete room by id
 */
router.delete('/:roomId', function (req, res) {
    res.send('');
});

module.exports = router;
