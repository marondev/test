"use strict";
module.exports = (sequelize, DataTypes) => {
  const SessionFile = sequelize.define(
    "session_files",
    {
      title: DataTypes.STRING,
      filename: DataTypes.STRING,
      type: DataTypes.STRING,
      session_date: DataTypes.INTEGER,
      file: DataTypes.BLOB,
    },
    {
      timestamps: true,
      underscored: true,
    }
  );
  SessionFile.associate = function (models) {
    // associations can be defined here
  };
  return SessionFile;
};
