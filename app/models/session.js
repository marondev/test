module.exports = (sequelize, DataTypes) => {
  const Session = sequelize.define(
    "sessions",
    {
      date: {
        type: DataTypes.INTEGER,
        unique: true,
        allowNull: false,
        primaryKey: true,
      },
      place_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      number: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      type: {
        type: DataTypes.STRING,
        allowNull: false,
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

  Session.associate = function (models) {
    Session.hasMany(models.session_notes, { as: "notes" });
    Session.hasMany(models.session_files, { as: "files" });
    Session.hasMany(models.session_members, { as: "members" });
    Session.hasMany(models.resolutions, {
      as: "resolutions",
      foreignKey: "session_date",
      sourceKey: "date",
      constraints: false,
    });
    Session.hasMany(models.committee_reports, {
      as: "committee_reports",
      foreignKey: "delivery_date",
      sourceKey: "date",
      constraints: false,
    });
    Session.hasMany(models.privilege_speeches, {
      as: "privilege_speeches",
      foreignKey: "delivery_date",
      sourceKey: "date",
      constraints: false,
    });

    Session.hasMany(models.ordinances, {
      as: "first_reading_ordinances",
      foreignKey: "first_reading_date",
      sourceKey: "date",
      constraints: false,
    });
    Session.hasMany(models.ordinances, {
      as: "second_reading_ordinances",
      foreignKey: "second_reading_date",
      sourceKey: "date",
      constraints: false,
    });
    Session.hasMany(models.ordinances, {
      as: "committee_hearing_ordinances",
      foreignKey: "committee_hearing_date",
      sourceKey: "date",
      constraints: false,
    });
    Session.hasMany(models.ordinances, {
      as: "third_reading_ordinances",
      foreignKey: "third_reading_date",
      sourceKey: "date",
      constraints: false,
    });
    Session.hasMany(models.ordinances, {
      as: "ammended_ordinances",
      foreignKey: "ammended_date",
      sourceKey: "date",
      constraints: false,
    });
    Session.hasMany(models.ordinances, {
      as: "repealed_ordinances",
      foreignKey: "repealed_date",
      sourceKey: "date",
      constraints: false,
    });
  };

  return Session;
};
