"use strict";
module.exports = (sequelize, DataTypes) => {
  const OrdinanceFile = sequelize.define(
    "ordinance_files",
    {
      title: DataTypes.STRING,
      filename: DataTypes.STRING,
      type: DataTypes.STRING,
      ordinance_number: DataTypes.STRING,
      file: DataTypes.BLOB,
    },
    {
      timestamps: true,
      underscored: true,
    }
  );
  OrdinanceFile.associate = function (models) {
    // associations can be defined here
  };
  return OrdinanceFile;
};
