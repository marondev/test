"use strict";
module.exports = (sequelize, DataTypes) => {
  const Log = sequelize.define(
    "logs",
    {
      description: DataTypes.STRING,
      user_id: DataTypes.INTEGER,
      entity_id: DataTypes.STRING,
      entity: DataTypes.STRING,
      action: DataTypes.STRING,
      sync_id: { type: DataTypes.STRING, allowNull: true },
      segment_id: { type: DataTypes.STRING, allowNull: true },
      version: { type: DataTypes.INTEGER, defaultValue: 1 },
    },
    {
      timestamps: true,
      underscored: true,
    }
  );
  Log.associate = function (models) {};
  return Log;
};
