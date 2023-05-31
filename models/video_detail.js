const Sequelize = require('sequelize');
module.exports = function (sequelize, DataTypes) {
  return sequelize.define('video_detail', {
    id: {
      type: DataTypes.CHAR(255),
      allowNull: false,
      defaultValue: "",
      primaryKey: true
    },
    video_url: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: ""
    },
    user_id: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    velocity: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: ""
    },
    start_point: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    end_point: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: ""
    },
    time: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: ""
    },
    distance: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: ""
    },
    thumbnail: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: ""
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: ""
    },
    video_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: ""
    },
    views_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    }
  }, {
    sequelize,
    tableName: 'video_detail',
    timestamps: false
  });
};
