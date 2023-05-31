const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('video_views', {
    id: {
      type: DataTypes.CHAR(255),
      allowNull: false,
      defaultValue: "",
      primaryKey: true
    },
    video_id: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: ""
    },
    user_id: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'video_views',
    timestamps: false
  });
};
