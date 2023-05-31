const Sequelize = require('sequelize');
module.exports = function (sequelize, DataTypes) {
  return sequelize.define('chat_messages', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    room_id: {
      type: DataTypes.CHAR(36),
      allowNull: true
    },
    sender_id: {
      type: DataTypes.CHAR(36),
      allowNull: true
    },
    reply_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    message: {
      type: DataTypes.STRING(10000),
      allowNull: true
    },
    message_type: {
      type: DataTypes.ENUM('1', '2', '3'),
      allowNull: true,
      defaultValue: "1",
      comment: "1-message,2-image,3-video"
    },
    status: {
      type: DataTypes.ENUM('send', 'deleted'),
      allowNull: true,
      defaultValue: "send"
    },
    thumbnail: {
      type: DataTypes.STRING(1000),
      allowNull: true
    },
    read_message: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: "0-unread, 1-read"
    }
  }, {
    sequelize,
    tableName: 'chat_messages',
    timestamps: false,
    paranoid: true,
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
