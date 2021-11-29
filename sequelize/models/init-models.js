var DataTypes = require("sequelize").DataTypes;
var _address = require("./address");
var _facility = require("./facility");
var _facility_room = require("./facility_room");
var _feedback = require("./feedback");
var _image = require("./image");
var _notification = require("./notification");
var _rental = require("./rental");
var _report = require("./report");
var _room = require("./room");
var _room_type = require("./room_type");
var _user = require("./user");

function initModels(sequelize) {
    var address = _address(sequelize, DataTypes);
    var facility = _facility(sequelize, DataTypes);
    var facility_room = _facility_room(sequelize, DataTypes);
    var feedback = _feedback(sequelize, DataTypes);
    var image = _image(sequelize, DataTypes);
    var notification = _notification(sequelize, DataTypes);
    var rental = _rental(sequelize, DataTypes);
    var report = _report(sequelize, DataTypes);
    var room = _room(sequelize, DataTypes);
    var room_type = _room_type(sequelize, DataTypes);
    var user = _user(sequelize, DataTypes);

    facility.belongsToMany(room, {
        as: 'room_id_rooms',
        through: facility_room,
        foreignKey: "facility_id",
        otherKey: "room_id"
    });
    room.belongsToMany(facility, {
        as: 'facility_id_facilities',
        through: facility_room,
        foreignKey: "room_id",
        otherKey: "facility_id"
    });
    room.belongsTo(address, {as: "address", foreignKey: "address_id"});
    address.hasMany(room, {as: "rooms", foreignKey: "address_id"});
    facility_room.belongsTo(facility, {as: "facility", foreignKey: "facility_id"});
    facility.hasMany(facility_room, {as: "facility_rooms", foreignKey: "facility_id"});
    facility_room.belongsTo(room, {as: "room", foreignKey: "room_id"});
    room.hasMany(facility_room, {as: "facility_rooms", foreignKey: "room_id"});
    feedback.belongsTo(room, {as: "room", foreignKey: "room_id"});
    room.hasMany(feedback, {as: "feedbacks", foreignKey: "room_id"});
    image.belongsTo(room, {as: "room", foreignKey: "room_id"});
    room.hasMany(image, {as: "images", foreignKey: "room_id"});
    rental.belongsTo(room, {as: "room", foreignKey: "room_id"});
    room.hasMany(rental, {as: "rentals", foreignKey: "room_id"});
    room.belongsTo(room_type, {as: "room_type", foreignKey: "room_type_id"});
    room_type.hasMany(room, {as: "rooms", foreignKey: "room_type_id"});
    feedback.belongsTo(user, {as: "client", foreignKey: "client_id"});
    user.hasMany(feedback, {as: "feedbacks", foreignKey: "client_id"});
    notification.belongsTo(user, {as: "user", foreignKey: "user_id"});
    user.hasMany(notification, {as: "notifications", foreignKey: "user_id"});
    rental.belongsTo(user, {as: "client", foreignKey: "client_id"});
    user.hasMany(rental, {as: "rentals", foreignKey: "client_id"});
    report.belongsTo(user, {as: "user", foreignKey: "user_id"});
    user.hasMany(report, {as: "reports", foreignKey: "user_id"});
    room.belongsTo(user, {as: "host", foreignKey: "host_id"});
    user.hasMany(room, {as: "rooms", foreignKey: "host_id"});

    return {
        address,
        facility,
        facility_room,
        feedback,
        image,
        notification,
        rental,
        report,
        room,
        room_type,
        user,
    };
}

module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
