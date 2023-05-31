const Sequelize = require('sequelize');
module.exports = function (sequelize, DataTypes) {
  return sequelize.define('report_user', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    report_by: {
      type: DataTypes.CHAR(255),
      allowNull: true
    },
    report_to: {
      type: DataTypes.CHAR(255),
      allowNull: true
    },
    type: {
      type: DataTypes.ENUM('user', 'post'),
      allowNull: true
    },
    reason: {
      type: DataTypes.CHAR(255),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'report_user',
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
