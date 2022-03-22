"use strict";
module.exports = (sequelize, DataTypes) => {
  const CommitteeReportCommittee = sequelize.define(
    "committee_report_committees",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      committee_report_number: DataTypes.STRING,
      committee_id: DataTypes.INTEGER,
    },
    {
      timestamps: true,
      underscored: true,
    }
  );
  CommitteeReportCommittee.associate = function (models) {
    // CommitteeReportCommittee.belongsTo(models.committee_reports, {as: 'committee_report', foreignKey: 'committee_report_number'});
    CommitteeReportCommittee.belongsTo(models.committees, {
      as: "committee",
      foreignKey: "committee_id",
      constraints: false,
    });
  };
  return CommitteeReportCommittee;
};
