const express = require('express');
const router = express.Router();
const {models, db} = require('../sequelize/conn');
const jwt = require('jsonwebtoken');
const auth = require('../middlewares/auth');
const passport = require('passport');

const bcrypt = require('bcryptjs');
const {validate_user, validate_pass} = require("../middlewares/validate");
const {QueryTypes, Op} = require("sequelize");
const {sendEmail} = require("../utils/email");
const {deleteRoom} = require("../utils/room");

passport.use('user', auth.jwtStrategy);
passport.use('admin', auth.isAdmin);
passport.use('host', auth.isHost);

/**
 * Get all user
 * @author admin
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
async function getUsers(req, res) {
    try {
        const users = await models.user.findAll();
        const limit = req.query.limit || 20;
        const page = req.query.page || 1;
        res.status(200).json({
            total: users.length,
            users: users.slice((page - 1) * limit, page * limit)
        });
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
}

router.get('/', passport.authenticate('admin', {session: false}), getUsers);

/**
 * Get user by userId
 * @author: all
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
async function getUserById(req, res) {
    try {
        const user = await models.user.findByPk(req.params["userId"]);
        if (!user) {
            res.status(400).send({message: 'Invalid userId'});
            return;
        }
        res.status(200).json(user);
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
}

router.get('/:userId', getUserById);

/**
 * Update user by userId
 * @author: user
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
async function updateUser(req, res) {
    try {
        // console.log(req.headers.authorization.split(' ')[1]);
        const payload = jwt.decode(req.headers.authorization.split(' ')[1]);
        const curUser = await models.user.findByPk(payload.user_id);

        const user = await models.user.findByPk(req.params["userId"]);
        if (!user) {
            res.status(400).json({message: 'Invalid userId'});
            return;
        }

        let role = (req.body.role != 'admin' ? req.body.role : 'client');
        if (user.role == 'admin') {
            role = 'admin';
        }

        const newUser = {
            name: req.body.name,
            phone: req.body.phone,
            email: req.body.email,
            username: req.body.username,
            role: role
        }

        if (curUser.role != 'admin') {
            if (payload.user_id != req.params["userId"]) {
                res.status(400).json({message: 'Invalid userId'});
                return;
            }
            if (newUser.username && newUser.username != user.username) {
                let user = await models.user.findOne({
                    where: {
                        username: newUser.username
                    }
                });
                if (user) {
                    res.status(400).json({message: 'Failed! Username is already in use!'});
                    return;
                }
            }
            if (newUser.email && newUser.email != user.email) {
                let user = await models.user.findOne({
                    where: {
                        email: newUser.email
                    }
                });
                if (user) {
                    res.status(400).json({message: 'Failed! Email is already in use!'});
                    return;
                }
            }
            if (newUser.phone && newUser.phone != user.phone) {
                let user = await models.user.findOne({
                    where: {
                        phone: newUser.phone
                    }
                });
                if (user) {
                    res.status(400).json({message: 'Failed! Phone number is already in use!'});
                    return;
                }
            }
            if (newUser.username && !validate_user(newUser.username)) {
                res.status(400).json({message: 'Invalid username!'});
                return;
            }
            if (newUser.username && newUser.password) {
                if (!validate_pass(newUser.username, newUser.password)) {
                    res.status(400).json({message: 'Invalid password'});
                    return;
                } else {
                    newUser.password = bcrypt.hashSync(newUser.password, +process.env.SALT);
                }
            }
        }
        await models.user.update(newUser, {
            where: {
                user_id: req.params["userId"]
            }
        });
        res.status(200).json({message: 'OK'});
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
}

router.put('/:userId', passport.authenticate('user', {session: false}), updateUser);

/**
 * Delete user by userId
 * @author: admin
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
async function deleteUser(req, res) {
    try {
        const user = await models.user.findByPk(req.params["userId"]);
        if (!user) {
            res.status(400).json({message: 'Invalid userId'});
            return;
        }
        let rooms = await models.room.findAll({
            where: {
                host_id: user.user_id
            }
        });
        for (let room of rooms) {
            await deleteRoom(room.room_id);
        }
        await models.favourite.destroy({
            where: {
                user_id: user.user_id
            }
        });
        await models.feedback.destroy({
            where: {
                client_id: user.user_id
            }
        });
        await models.notification.destroy({
            where: {
                user_id: user.user_id
            }
        });
        await models.rental.destroy({
            where: {
                client_id: user.user_id
            }
        })
        await models.user.destroy({
            where: {
                user_id: req.params["userId"]
            }
        });
        res.status(200).json({message: 'Success'});
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
}

router.delete('/:userId', passport.authenticate('admin', {session: false}), deleteUser);

/**
 * Sign up new user
 * @author all
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
async function createUser(req, res) {
    try {
        const newUser = {
            name: req.body.name,
            phone: req.body.phone,
            email: req.body.email,
            role: (req.body.role != 'admin' ? req.body.role : 'client'),
            username: req.body.username,
            password: req.body.password
        }
        const user = await models.user.findOne({
            where: {
                username: newUser.username
            }
        });
        const email = await models.user.findOne({
            where: {
                email: newUser.email
            }
        });
        const phone = await models.user.findOne({
            where: {
                phone: newUser.phone
            }
        });
        if (user) {
            res.status(400).json({message: 'Failed! Username is already in use!'});
            return;
        }
        if (email) {
            res.status(400).json({message: 'Failed! Email is already in use!'});
            return;
        }
        if (phone) {
            res.status(400).json({message: 'Failed! Phone number is already in use!'});
            return;
        }
        if (!validate_user(newUser.username, newUser.password)) {
            res.status(400).json({message: 'Invalid username!'});
            return;
        }
        if (!validate_pass(newUser.username, newUser.password)) {
            res.status(400).json({message: 'Invalid password'});
            return;
        }
        newUser.password = bcrypt.hashSync(newUser.password, +process.env.SALT);
        await models.user.create(newUser);
        res.status(200).json({message: 'OK'});
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
}

router.post('/create', createUser);

/**
 * Change password
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
async function changePassword(req, res) {
    try {
        const payload = jwt.decode(req.headers.authorization.split(' ')[1]);
        const curUser = await models.user.findByPk(payload.user_id);

        var newPassword = req.body.password;
        const oldPassword = req.body.oldPassword;

        if (curUser.role != 'admin') {
            if (payload.user_id != req.params["userId"]) {
                res.status(400).json({message: 'Invalid userId'});
                return;
            }

            if (!bcrypt.compareSync(oldPassword, curUser.password)) {
                res.status(400).json({message: 'Password is incorrect'});
                return;
            }

            if (!validate_pass(curUser.username, newPassword)) {
                res.status(400).json({message: 'Invalid password'});
                return;
            } else {
                newPassword = bcrypt.hashSync(newPassword, +process.env.SALT);
            }
        }
        await models.user.update({password: newPassword}, {
            where: {
                user_id: req.params["userId"]
            }
        });
        res.status(200).json({message: 'OK'});
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
}

router.post('/:userId/change-password', passport.authenticate('user', {session: false}), changePassword);

router.post('/forgot-password', async function (req, res) {
    try {
        const username = req.body.username;
        const email = req.body.email;

        const user = await models.user.findOne({
            where: {
                username: username,
                email: email
            }
        });
        if (!user) {
            res.status(400).send("Invalid information supplied");
            return;
        }
        const newPass = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        console.log(newPass);
        const password = bcrypt.hashSync(newPass, +process.env.SALT);
        await models.user.update({password: password}, {
            where: {
                user_id: user.user_id
            }
        });
        sendEmail(email, newPass);
        res.status(200).send("OK");
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
});

/**
 * Filter users
 * @author user
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
async function filterUser(req, res) {
    try {
        const limit = req.query.limit || 20;
        const page = req.query.page || 1;
        const findObj = {
            phone: req.body.phone,
            name: req.body.name,
            email: req.body.email
        };
        const users = await models.user.findAll({
            where: {
                name: {
                    [Op.like]: '%' + (findObj.name ? findObj.name : '') + '%'
                },
                phone: {
                    [Op.like]: '%' + (findObj.phone ? findObj.phone : '') + '%'
                },
                email: {
                    [Op.like]: '%' + (findObj.email ? findObj.email : '') + '%'
                }
            }
        });
        res.status(200).json({
            total: users.length,
            users: users.slice((page - 1) * limit, page * limit)
        });
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
}

router.post('/filter', passport.authenticate('user', {session: false}), filterUser);

/**
 * Login
 */
router.post('/login', async (req, res, next) => {
    try {
        const {username, password} = req.body;
        if (username && password) {
            let user = await models.user.findOne({
                where: {
                    username: username
                }
            });
            if (!user) {
                res.status(400).json({message: 'No such user found'});
                return;
            }
            if (bcrypt.compareSync(password, user.password)) {
                let payload = {user_id: user.user_id};
                let token = jwt.sign(payload, process.env.SECRET_KEY, {expiresIn: '7d'});
                res.status(200).json({
                    message: 'OK',
                    userId: user.user_id,
                    role: user.role,
                    name: user.name,
                    token: token
                });
            } else {
                res.status(400).json({message: 'Password is incorrect!'});
            }
        }
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
});

/**
 * Logout
 * @author: user
 */
router.post('/logout', (req, res) => {
    res.status(200).json({message: "Logged out!", token: null});
});

router.get('/ping/current-user', passport.authenticate('user', {session: false}), (req, res) => {
    res.status(200).send('OK');
})

module.exports = router;
