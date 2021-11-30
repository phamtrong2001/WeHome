const {models, db} = require('../sequelize/conn');
const passportJWT = require('passport-jwt');

const ExtractJwt = passportJWT.ExtractJwt;
const jwtStrategy = passportJWT.Strategy;

const jwtOptions = {};
jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
jwtOptions.secretOrKey = process.env.SECRET_KEY;

/**
 * create new strategy for user
 * @type {JwtStrategy}
 */
module.exports.jwtStrategy = new jwtStrategy(
    jwtOptions,
    async (jwtPayload, done) => {
        try {
            const user = await models.user.findByPk(jwtPayload.user_id);
            if (user) {
                return done(null, user);
            } else {
                return done(null, false);
            }
        } catch (err) {
            console.error(err);
            return done(null, false);
        }
    }
);

/**
 * create new strategy for admin
 * @type {JwtStrategy}
 */
module.exports.isAdmin = new jwtStrategy(
    jwtOptions,
    async (jwtPayload, done) => {
        try {
            const user = await models.user.findByPk(jwtPayload.user_id);
            if (user.role == 'admin') {
                return done(null, user);
            } else {
                return done(null, false);
            }
        } catch (err) {
            console.error(err);
            return done(null, false);
        }
    }
);

/**
 * create new strategy for host
 * @type {JwtStrategy}
 */
module.exports.isHost = new jwtStrategy(
    jwtOptions,
    async (jwtPayload, done) => {
        try {
            const user = await models.user.findByPk(jwtPayload.user_id);
            if (user.role == 'admin' || user.role == 'host') {
                return done(null, user);
            } else {
                return done(null, false);
            }
        } catch (err) {
            console.error(err);
            return done(null, false);
        }
    }
);
