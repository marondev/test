"use strict";
module.exports = (sequelize, DataTypes) => {
  const ResolutionFile = sequelize.define(
    "resolution_files",
    {
      title: DataTypes.STRING,
      filename: DataTypes.STRING,
      type: DataTypes.STRING,
      resolution_number: DataTypes.STRING,
      file: DataTypes.BLOB,
    },
    {
      timestamps: true,
      underscored: true,
    }
  );
  ResolutionFile.associate = function (models) {
    // associations can be defined here
  };
  return ResolutionFile;
};
