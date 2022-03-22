"use strict";
module.exports = (sequelize, DataTypes) => {
  const MemberEducation = sequelize.define(
    "member_educations",
    {
      member_id: DataTypes.INTEGER,
      school: DataTypes.STRING,
      degree: DataTypes.STRING,
      start_date: DataTypes.STRING,
      end_date: DataTypes.STRING,
    },
    {
      timestamps: true,
      underscored: true,
    }
  );
  MemberEducation.associate = function (models) {};
  return MemberEducation;
};
