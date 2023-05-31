const Sequelize = require('sequelize');
module.exports = function (sequelize, DataTypes) {
  return sequelize.define('users', {
    id: {
      type: DataTypes.CHAR(255),
      allowNull: false,
      defaultValue: "",
      primaryKey: true

    },
    username: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: ""
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    profile: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    verification_code: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: ""
    },
    email_verified_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    fullname: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: ""
    },
    location: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: ""
    },
    online_status: {
      type: DataTypes.ENUM('online', 'offline'),
      allowNull: true,
      defaultValue: "online"
    },
    is_active: {
      type: DataTypes.ENUM('no', 'yes'),
      allowNull: true
    },
    sport: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: ""
    },
    login_type: {
      type: DataTypes.ENUM('1', '2', '3', '4'),
      allowNull: true,
      defaultValue: "1",
      comment: "1- facebook,2-google,3-instagram,4-twitter"
    }
  }, {
    sequelize,
    tableName: 'users',
    timestamps: false,
    indexes: [
      {
        name: "users_email_unique",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "email" },
        ]
      },
    ]
  });
};
