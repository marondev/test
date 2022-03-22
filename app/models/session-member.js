"use strict";
module.exports = (sequelize, DataTypes) => {
  const SessionMember = sequelize.define(
    "session_members",
    {
      member_id: DataTypes.INTEGER,
      session_date: DataTypes.INTEGER,
    },
    {
      timestamps: true,
      underscored: true,
    }
  );
  SessionMember.associate = function (models) {
    // SessionMember.belongsTo( models.sessions, { as: 'session', foreignKey: 'session_id' } );
    SessionMember.belongsTo(models.members, {
      as: "info",
      foreignKey: "member_id",
      constraints: false,
    });
  };
  return SessionMember;
};
