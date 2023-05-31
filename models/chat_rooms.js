const Sequelize = require('sequelize');
module.exports = function (sequelize, DataTypes) {
  return sequelize.define('chat_rooms', {
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
    user_id: {
      type: DataTypes.CHAR(36),
      allowNull: true
    },
    receiver_id: {
      type: DataTypes.CHAR(36),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'chat_rooms',
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
