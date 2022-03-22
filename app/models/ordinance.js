module.exports = (sequelize, DataTypes) => {
  const Ordinance = sequelize.define(
    "ordinances",
    {
      place_id: {
        type: DataTypes.STRING,
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
      committee_report_number: { type: DataTypes.STRING },
      source: { type: DataTypes.STRING },
      status: { type: DataTypes.STRING },
      author_id: { type: DataTypes.INTEGER, allowNull: true },
      first_reading_date: { type: DataTypes.INTEGER, allowNull: true },
      second_reading_date: { type: DataTypes.INTEGER, allowNull: true },
      third_reading_date: { type: DataTypes.INTEGER, allowNull: true },
      committee_hearing_date: { type: DataTypes.INTEGER, allowNull: true },
      ammended_date: { type: DataTypes.INTEGER, allowNull: true },
      repealed_date: { type: DataTypes.INTEGER, allowNull: true },
      approved_date: { type: DataTypes.DATE },
      effectivity_date: { type: DataTypes.DATE },
      publication_date: { type: DataTypes.DATE },
      remarks: { type: DataTypes.TEXT },
      sync_id: { type: DataTypes.STRING, allowNull: true },
      version: { type: DataTypes.INTEGER, defaultValue: 1 },
    },
    {
      timestamps: true,
      underscored: true,
    }
  );

  Ordinance.associate = function (models) {
    Ordinance.hasMany(models.ordinance_files, { as: "files" });
    Ordinance.hasMany(models.ordinance_committees, { as: "committees", constraints: false });

    Ordinance.belongsTo(models.members, {
      as: "author",
      foreignKey: "author_id",
      targetKey: "id",
      constraints: false,
    });
    // Ordinance.belongsTo(models.sessions, {as: 'first_reading_session', foreignKey: 'first_reading_date', targetKey: 'date', constraints: false});
    // Ordinance.belongsTo(models.sessions, {as: 'second_reading_session', foreignKey: 'second_reading_date', targetKey: 'date', constraints: false});
    // Ordinance.belongsTo(models.sessions, {as: 'committee_hearing_session', foreignKey: 'committee_hearing_date', targetKey: 'date', constraints: false});
    // Ordinance.belongsTo(models.sessions, {as: 'third_reading_session', foreignKey: 'third_reading_date', targetKey: 'date', constraints: false});
    // Ordinance.belongsTo(models.sessions, {as: 'ammended_session', foreignKey: 'ammended_date', targetKey: 'date', constraints: false});
    // Ordinance.belongsTo(models.sessions, {as: 'repealed_session', foreignKey: 'repealed_date', targetKey: 'date', constraints: false});

    Ordinance.hasMany(models.ordinance_authors, {
      as: "co_authors",
      scope: {
        role: "author",
      },
      constraints: false,
    });

    Ordinance.hasMany(models.ordinance_authors, {
      as: "co_sponsors",
      scope: {
        role: "sponsor",
      },
      constraints: false,
    });
  };

  return Ordinance;
};
