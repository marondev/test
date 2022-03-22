"use strict";
module.exports = (sequelize, DataTypes) => {
  const SessionNote = sequelize.define(
    "session_notes",
    {
      note: DataTypes.TEXT,
      session_date: DataTypes.INTEGER,
      user_id: DataTypes.INTEGER,
    },
    {
      timestamps: true,
      underscored: true,
    }
  );
  SessionNote.associate = function (models) {
    SessionNote.belongsTo(models.users, {
      as: "user",
      foreignKey: "id",
      constraints: false,
    });
  };
  return SessionNote;
};
