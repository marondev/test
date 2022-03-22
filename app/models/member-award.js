"use strict";
module.exports = (sequelize, DataTypes) => {
  const MemberAward = sequelize.define(
    "member_awards",
    {
      member_id: DataTypes.INTEGER,
      title: DataTypes.STRING,
      association: DataTypes.STRING,
      description: DataTypes.TEXT,
      date: DataTypes.STRING,
    },
    {
      timestamps: true,
      underscored: true,
    }
  );
  MemberAward.associate = function (models) {};
  return MemberAward;
};
