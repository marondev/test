"use strict";
module.exports = (sequelize, DataTypes) => {
  const Classification = sequelize.define(
    "classifications",
    {
      name: DataTypes.STRING,
    },
    {
      timestamps: false,
    }
  );
  Classification.associate = function (models) {
    // associations can be defined here
  };
  return Classification;
};
