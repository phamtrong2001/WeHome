const express = require('express');
const router = express.Router();
const models = require('../sequelize/conn');
const jwt = require('jsonwebtoken');
const auth = require('../middlewares/auth');
const passport = require('passport');

const bcrypt = require('bcrypt');
const {validate_user, validate_pass} = require("../middlewares/validate");
const {QueryTypes, Op} = require("sequelize");

passport.use('jwt', auth.jwtStrategy);
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
    const users = await models.user.findAll({
        limit: 100
    });
    res.status(200).json(users);
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
    const user = await models.user.findByPk(req.params["userId"]);
    if (!user) {
        res.status(400).send({'message': 'Invalid userId'});
        return;
    }
    res.status(200).json(user);
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
    // console.log(req.headers.authorization.split(' ')[1]);
    const payload = jwt.decode(req.headers.authorization.split(' ')[1]);
    // console.log(payload);
    if (payload.user_id != req.params["userId"]) {
        res.status(400).json({'message': 'Invalid userId'});
        return;
    }
    const newUser = {
        name: req.body.name,
        phone: req.body.phone,
        email: req.body.email,
        username: req.body.username,
        password: req.body.password
    }
    if (newUser.username) {
        let user = await models.user.findOne({
            where: {
                username: newUser.username
            }
        });
        if (user) {
            res.status(400).json({'message': 'Failed! Username is already in use!'});
            return;
        }
    }
    if (newUser.username && !validate_user(newUser.username, newUser.password)) {
        res.status(400).json({'message': 'Invalid username!'});
        return;
    }
    if (newUser.username && newUser.password) {
        if (!validate_pass(newUser.username, newUser.password)) {
            res.status(400).json({'message': 'Invalid password'});
            return;
        } else {
            newUser.password = bcrypt.hashSync(newUser.password, +process.env.SALT);
        }
    }
    await models.user.update(newUser, {
        where: {
            user_id: req.params["userId"]
        }
    });
    res.status(200).json({'message': 'OK'});
}
router.put('/:userId', passport.authenticate('jwt', {session: false}), updateUser);

/**
 * Delete user by userId
 * @author: admin
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
async function deleteUser(req, res) {
    const user = await models.user.findByPk(req.params["userId"]);
    if (!user) {
        res.status(400).json({'message': 'Invalid userId'});
        return;
    }
    await models.user.destroy({
        where: {
            user_id: req.params["userId"]
        }
    });
    res.status(200).json({'message': 'Success'});
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
    const newUser = {
        id: req.body.id,
        name: req.body.name,
        phone: req.body.phone,
        email: req.body.email,
        user_type_id: req.body.userType,
        username: req.body.username,
        password: req.body.password
    }
    const user = await models.user.findOne({
        where: {
            username: newUser.username
        }
    });
    if (user) {
        res.status(400).json({'message': 'Failed! Username is already in use!'});
        return;
    }
    if (!validate_user(newUser.username, newUser.password)) {
        res.status(400).json({'message': 'Invalid username!'});
        return;
    }
    if (!validate_pass(newUser.username, newUser.password)) {
        res.status(400).json({'message': 'Invalid password'});
        return;
    }
    newUser.password = bcrypt.hashSync(newUser.password, +process.env.SALT);
    await models.user.create(newUser);
    res.status(200).json({'message': 'OK'});
}
router.post('/create', createUser);

/**
 * Filter users
 * @author user
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
async function filterUser(req, res) {
    const findObj = {
        user_id: req.body.userId,
        phone: req.body.phone,
        name: req.body.name,
        email: req.body.email
    };
    if (findObj.user_id) {
        let users = await models.user.findAll({
            where: {
                user_id: findObj.user_id
            },
            limit: 100
        });
        res.status(200).json(users);
        return;
    }
    if (findObj.name) {
        let users = await models.user.findAll({
            where: {
                name: {
                    [Op.like]: '%' + findObj.name + '%'
                }
            },
            limit: 100
        });
        res.status(200).json(users);
        return;
    }
    if (findObj.phone) {
        let users = await models.user.findAll({
            where: {
                phone: findObj.phone
            },
            limit: 100
        });
        res.status(200).json(users);
    }
    if (findObj.email) {
        let users = await models.user.findAll({
            where: {
                email: {
                    [Op.like]: '%' + findObj.email + '%'
                }
            },
            limit: 100
        });
        res.status(200).json(users);
    }
}
router.post('/filter', passport.authenticate('jwt', {session: false}),filterUser);

/**
 * Login
 */
router.post('/login',async (req, res, next) => {
    const {username, password} = req.body;
    if (username && password) {
        let user = await models.user.findOne({
            where: {
                username: username
            }
        });
        if (!user) {
            res.status(401).json({'message': 'No such user found'});
            return;
        }
        if (bcrypt.compareSync(password, user.password)) {
            let payload = {user_id: user.user_id};
            let token = jwt.sign(payload, process.env.SECRET_KEY, {expiresIn: '1d'});
            res.status(200).json({'message': 'OK', 'token': token});
        } else {
            res.status(401).json({'message': 'Password is incorrect!'});
            return;
        }
    }
});

/**
 * Logout
 * @author: user
 */
router.post('/logout', passport.authenticate('jwt', {session: false}), (req, res) => {
    res.status(200).send("Logged out!");
});

module.exports = router;
