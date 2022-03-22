"use strict";
module.exports = (sequelize, DataTypes) => {
  const SubdivisionFile = sequelize.define(
    "subdivision_files",
    {
      title: DataTypes.STRING,
      filename: DataTypes.STRING,
      type: DataTypes.STRING,
      subdivision_number: DataTypes.STRING,
      file: DataTypes.BLOB,
    },
    {
      timestamps: true,
      underscored: true,
    }
  );
  SubdivisionFile.associate = function (models) {
    // associations can be defined here
  };
  return SubdivisionFile;
};
