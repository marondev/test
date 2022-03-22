"use strict";
module.exports = (sequelize, DataTypes) => {
  const MemberCommittee = sequelize.define(
    "member_committees",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      member_id: DataTypes.INTEGER,
      committee_id: DataTypes.INTEGER,
      isHead: DataTypes.BOOLEAN,
    },
    {
      timestamps: true,
      underscored: true,
    }
  );
  MemberCommittee.associate = function (models) {
    MemberCommittee.belongsTo(models.members, {
      as: "member",
      foreignKey: "member_id",
      constraints: false,
    });
    MemberCommittee.belongsTo(models.committees, {
      as: "committee",
      foreignKey: "committee_id",
      constraints: false,
    });
  };
  return MemberCommittee;
};
