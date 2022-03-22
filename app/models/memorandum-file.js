"use strict";
module.exports = (sequelize, DataTypes) => {
  const MemorandumFile = sequelize.define(
    "memorandum_files",
    {
      title: DataTypes.STRING,
      filename: DataTypes.STRING,
      type: DataTypes.STRING,
      memorandum_id: DataTypes.INTEGER,
      file: DataTypes.BLOB,
    },
    {
      timestamps: true,
      underscored: true,
    }
  );
  MemorandumFile.associate = function (models) {
    // associations can be defined here
  };
  return MemorandumFile;
};
