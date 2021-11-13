const models = require('../sequelize/conn');
const passportJWT = require('passport-jwt');

const ExtractJwt = passportJWT.ExtractJwt;
const jwtStrategy = passportJWT.Strategy;

const jwtOptions = {};
jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
jwtOptions.secretOrKey = process.env.SECRET_KEY;


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

module.exports.isAdmin = new jwtStrategy(
    jwtOptions,
    async (jwtPayload, done) => {
        const user = await models.user.findByPk(jwtPayload.user_id);
        if (user.user_type_id == 1) {
            return done(null, user);
        } else {
            return done(null, false);
        }
    }
);

module.exports.isHost = new jwtStrategy(
    jwtOptions,
    async (jwtPayload, done) => {
        const user = await models.user.findByPk(jwtPayload.user_id);
        if (user.user_type_id == 2 || user.user_type_id == 1) {
            return done(null, user);
        } else {
            return done(null, false);
        }
    }
);
