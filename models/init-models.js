var DataTypes = require("sequelize").DataTypes;
var _video_detail = require("./video_detail");

function initModels(sequelize) {
  var video_detail = _video_detail(sequelize, DataTypes);


  return {
    video_detail,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
