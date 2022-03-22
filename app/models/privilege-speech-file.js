"use strict";
module.exports = (sequelize, DataTypes) => {
  const PrivilegeSpeechFile = sequelize.define(
    "privilege_speech_files",
    {
      title: DataTypes.STRING,
      filename: DataTypes.STRING,
      type: DataTypes.STRING,
      privilege_speech_id: DataTypes.INTEGER,
      file: DataTypes.BLOB,
    },
    {
      timestamps: true,
      underscored: true,
    }
  );
  PrivilegeSpeechFile.associate = function (models) {
    // associations can be defined here
  };
  return PrivilegeSpeechFile;
};
