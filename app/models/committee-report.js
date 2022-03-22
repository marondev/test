module.exports = (sequelize, DataTypes) => {
  const CommitteeReport = sequelize.define(
    "committee_reports",
    {
      delivery_date: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      author_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      place_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      number: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
        primaryKey: true,
      },
      type: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      remarks: {
        type: DataTypes.STRING,
      },
      is_committee: {
        type: DataTypes.BOOLEAN,
      },
      description: {
        type: DataTypes.TEXT,
      },
      sync_id: { type: DataTypes.STRING, allowNull: true },
      version: { type: DataTypes.INTEGER, defaultValue: 1 },
    },
    {
      timestamps: true,
      underscored: true,
    }
  );

  CommitteeReport.associate = function (models) {
    CommitteeReport.hasMany(models.committee_report_files, { as: "files" });
    CommitteeReport.hasMany(models.committee_report_committees, {
      as: "committees",
    });
    CommitteeReport.belongsTo(models.members, {
      as: "author",
      foreignKey: "author_id",
      constraints: false,
    });
    CommitteeReport.hasMany(models.ordinances, {
      as: "ordinances",
      foreignKey: "committee_report_number",
      sourceKey: "number",
      constraints: false,
    });
    CommitteeReport.hasMany(models.resolutions, {
      as: "resolutions",
      foreignKey: "committee_report_number",
      sourceKey: "number",
      constraints: false,
    });
  };

  return CommitteeReport;
};
