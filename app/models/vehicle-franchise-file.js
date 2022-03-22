"use strict";
module.exports = (sequelize, DataTypes) => {
  const VehicleFranchiseFile = sequelize.define(
    "vehicle_franchise_files",
    {
      title: DataTypes.STRING,
      filename: DataTypes.STRING,
      type: DataTypes.STRING,
      vehicle_franchise_number: DataTypes.STRING,
      file: DataTypes.BLOB,
    },
    {
      timestamps: true,
      underscored: true,
    }
  );
  VehicleFranchiseFile.associate = function (models) {
    // associations can be defined here
  };
  return VehicleFranchiseFile;
};
