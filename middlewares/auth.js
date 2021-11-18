const models = require('../sequelize/conn');
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
        console.log(jwtPayload);
        const user = await models.user.findByPk(jwtPayload.user_id);
        if (user) {
            return done(null, user);
        } else {
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
        const user = await models.user.findByPk(jwtPayload.user_id);
        const user_type = await models.user_type.findByPk(user.user_type_id);
        const role = user_type.user_type;
        if (role == 'admin') {
            return done(null, user);
        } else {
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
        const user = await models.user.findByPk(jwtPayload.user_id);
        const user_type = await models.user_type.findByPk(user.user_type_id);
        const role = user_type.user_type;
        if (role == 'admin' || role == 'host') {
            return done(null, user);
        } else {
            return done(null, false);
        }
    }
);
