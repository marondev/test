"use strict";
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "users",
    {
      place_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      fullname: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      avatar: DataTypes.BLOB,
      username: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
      },
      password: DataTypes.STRING,
      role: DataTypes.STRING,
      last_login: DataTypes.DATE,
      sync_id: { type: DataTypes.STRING, allowNull: true },
      version: { type: DataTypes.INTEGER, defaultValue: 0 },
    },
    {
      timestamps: true,
      underscored: true,
    }
  );
  User.associate = function (models) {};
  return User;
};
