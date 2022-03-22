"use strict";
module.exports = (sequelize, DataTypes) => {
  const OtherFile = sequelize.define(
    "other_files",
    {
      title: DataTypes.STRING,
      filename: DataTypes.STRING,
      type: DataTypes.STRING,
      other_id: DataTypes.INTEGER,
      file: DataTypes.BLOB,
    },
    {
      timestamps: true,
      underscored: true,
    }
  );
  OtherFile.associate = function (models) {
    // associations can be defined here
  };
  return OtherFile;
};
