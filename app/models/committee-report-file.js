"use strict";
module.exports = (sequelize, DataTypes) => {
  const CommitteeReportFile = sequelize.define(
    "committee_report_files",
    {
      title: DataTypes.STRING,
      filename: DataTypes.STRING,
      type: DataTypes.STRING,
      committee_report_number: DataTypes.STRING,
      file: DataTypes.BLOB,
    },
    {
      timestamps: true,
      underscored: true,
    }
  );
  CommitteeReportFile.associate = function (models) {
    // associations can be defined here
  };
  return CommitteeReportFile;
};
