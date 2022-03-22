"use strict";
module.exports = (sequelize, DataTypes) => {
  const AccreditationFile = sequelize.define(
    "accreditation_files",
    {
      title: DataTypes.STRING,
      filename: DataTypes.STRING,
      type: DataTypes.STRING,
      accreditation_number: DataTypes.STRING,
      file: DataTypes.BLOB,
    },
    {
      timestamps: true,
      underscored: true,
    }
  );
  AccreditationFile.associate = function (models) {
    // associations can be defined here
  };
  return AccreditationFile;
};
