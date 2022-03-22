"use strict";
module.exports = (sequelize, DataTypes) => {
  const OrdinanceCommittee = sequelize.define(
    "ordinance_committees",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      committee_id: DataTypes.INTEGER,
      ordinance_number: DataTypes.STRING,
    },
    {
      timestamps: true,
      underscored: true,
    }
  );
  OrdinanceCommittee.associate = function (models) {
    OrdinanceCommittee.belongsTo(models.ordinances, {
      as: "ordinance",
      foreignKey: "ordinance_number",
      constraints: false,
    });
    OrdinanceCommittee.belongsTo(models.committees, {
      as: "committee",
      foreignKey: "committee_id",
      constraints: false,
    });
  };
  return OrdinanceCommittee;
};
