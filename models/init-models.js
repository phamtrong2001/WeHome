var DataTypes = require("sequelize").DataTypes;
var _address = require("./address");
var _facility = require("./facility");
var _facility_room = require("./facility_room");
var _feedback = require("./feedback");
var _image = require("./image");
var _rental = require("./rental");
var _report = require("./report");
var _room = require("./room");
var _room_type = require("./room_type");
var _user = require("./user");
var _user_type = require("./user_type");

function initModels(sequelize) {
  var address = _address(sequelize, DataTypes);
  var facility = _facility(sequelize, DataTypes);
  var facility_room = _facility_room(sequelize, DataTypes);
  var feedback = _feedback(sequelize, DataTypes);
  var image = _image(sequelize, DataTypes);
  var rental = _rental(sequelize, DataTypes);
  var report = _report(sequelize, DataTypes);
  var room = _room(sequelize, DataTypes);
  var room_type = _room_type(sequelize, DataTypes);
  var user = _user(sequelize, DataTypes);
  var user_type = _user_type(sequelize, DataTypes);


  return {
    address,
    facility,
    facility_room,
    feedback,
    image,
    rental,
    report,
    room,
    room_type,
    user,
    user_type,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
