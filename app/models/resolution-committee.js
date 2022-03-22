"use strict";
module.exports = (sequelize, DataTypes) => {
  const ResolutionCommittee = sequelize.define(
    "resolution_committees",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      committee_id: DataTypes.INTEGER,
      resolution_number: DataTypes.STRING,
    },
    {
      timestamps: true,
      underscored: true,
    }
  );
  ResolutionCommittee.associate = function (models) {
    ResolutionCommittee.belongsTo(models.resolutions, {
      as: "resolution",
      foreignKey: "resolution_number",
      constraints: false,
    });
    ResolutionCommittee.belongsTo(models.committees, {
      as: "committee",
      foreignKey: "committee_id",
      constraints: false,
    });
  };
  return ResolutionCommittee;
};
