const Sequelize = require('sequelize');
module.exports = function (sequelize, DataTypes) {
  return sequelize.define('video_comments', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    sender_id: {
      type: DataTypes.CHAR(36),
      allowNull: true
    },
    video_id: {
      type: DataTypes.CHAR(255),
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('send', 'deleted'),
      allowNull: true,
      defaultValue: "send"
    },
    comment: {
      type: DataTypes.STRING(10000),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'video_comments',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
