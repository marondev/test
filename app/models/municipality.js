"use strict";
module.exports = (sequelize, DataTypes) => {
  const Municipality = sequelize.define(
    "municipality",
    {
      name: DataTypes.STRING,
      logo: DataTypes.BLOB,
      server_id: { type: DataTypes.STRING, unique: true, primaryKey: true },
      is_active: DataTypes.BOOLEAN,
      activation_date: DataTypes.DATE,
      backup_date: { type: DataTypes.DATE, allowNull: true },
      logo_version: DataTypes.INTEGER,
      version: DataTypes.INTEGER,
      ip: { type: DataTypes.STRING, defaultValue: "192.168.254.254" },
    },
    {
      timestamps: true,
      underscored: true,
    }
  );
  Municipality.associate = function (models) {};

  return Municipality;
};
