"use strict";
module.exports = (sequelize, DataTypes) => {
  const MemberProject = sequelize.define(
    "member_projects",
    {
      member_id: DataTypes.INTEGER,
      name: DataTypes.STRING,
      description: DataTypes.STRING,
      date: DataTypes.STRING,
    },
    {
      timestamps: true,
      underscored: true,
    }
  );
  MemberProject.associate = function (models) {};
  return MemberProject;
};
