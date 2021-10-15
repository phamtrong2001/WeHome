var DataTypes = require("sequelize").DataTypes;
var _amenities = require("./amenities");
var _amenities_room = require("./amenities_room");
var _feedbacks = require("./feedbacks");
var _images = require("./images");
var _places = require("./places");
var _proposes = require("./proposes");
var _rental = require("./rental");
var _room_type = require("./room_type");
var _rooms = require("./rooms");
var _type_user = require("./type_user");
var _users = require("./users");

function initModels(sequelize) {
  var amenities = _amenities(sequelize, DataTypes);
  var amenities_room = _amenities_room(sequelize, DataTypes);
  var feedbacks = _feedbacks(sequelize, DataTypes);
  var images = _images(sequelize, DataTypes);
  var places = _places(sequelize, DataTypes);
  var proposes = _proposes(sequelize, DataTypes);
  var rental = _rental(sequelize, DataTypes);
  var room_type = _room_type(sequelize, DataTypes);
  var rooms = _rooms(sequelize, DataTypes);
  var type_user = _type_user(sequelize, DataTypes);
  var users = _users(sequelize, DataTypes);


  return {
    amenities,
    amenities_room,
    feedbacks,
    images,
    places,
    proposes,
    rental,
    room_type,
    rooms,
    type_user,
    users,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
