"use strict";
module.exports = (sequelize, DataTypes) => {
  const MemberExperience = sequelize.define(
    "member_experiences",
    {
      member_id: DataTypes.INTEGER,
      title: DataTypes.STRING,
      company: DataTypes.STRING,
      location: DataTypes.STRING,
      description: DataTypes.TEXT,
      start_date: DataTypes.STRING,
      end_date: DataTypes.STRING,
    },
    {
      timestamps: true,
      underscored: true,
    }
  );
  MemberExperience.associate = function (models) {};
  return MemberExperience;
};
