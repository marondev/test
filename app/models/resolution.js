module.exports = (sequelize, DataTypes) => {
  const Resolution = sequelize.define(
    "resolutions",
    {
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
      title: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: { notEmpty: true },
      },
      session_date: { type: DataTypes.INTEGER },
      committee_report_number: { type: DataTypes.STRING },
      author_id: { type: DataTypes.INTEGER, allowNull: true },
      approved_date: { type: DataTypes.DATE },
      remarks: { type: DataTypes.TEXT },
      sync_id: { type: DataTypes.STRING, allowNull: true },
      version: { type: DataTypes.INTEGER, defaultValue: 1 },
    },
    {
      timestamps: true,
      underscored: true,
    }
  );

  Resolution.associate = function (models) {
    Resolution.hasMany(models.resolution_files, { as: "files" });
    Resolution.hasMany(models.resolution_committees, { as: "committees" });
    Resolution.belongsTo(models.members, {
      as: "author",
      foreignKey: "author_id",
      targetKey: "id",
      constraints: false,
    });

    // Resolution.belongsTo(models.sessions, {as: 'session', foreignKey: 'session_date', targetKey: 'date', constraints: false});

    Resolution.hasMany(models.resolution_authors, {
      as: "co_authors",
      scope: {
        role: "author",
      },
      constraints: false,
    });

    Resolution.hasMany(models.resolution_authors, {
      as: "co_sponsors",
      scope: {
        role: "sponsor",
      },
      constraints: false,
    });
  };

  return Resolution;
};
