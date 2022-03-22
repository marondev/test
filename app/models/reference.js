"use strict";
module.exports = (sequelize, DataTypes) => {
  const References = sequelize.define(
    "references",
    {
      title: DataTypes.STRING,
      type: DataTypes.STRING,
      place_id: DataTypes.INTEGER,
      filename: DataTypes.STRING,
      file: DataTypes.BLOB,
      sync_id: { type: DataTypes.STRING, allowNull: true },
      version: { type: DataTypes.INTEGER, defaultValue: 1 },
    },
    {
      timestamps: true,
      underscored: true,
    }
  );
  References.associate = function (models) {
    // associations can be defined here
  };
  return References;
};
