"use strict";
module.exports = (sequelize, DataTypes) => {
  const Committee = sequelize.define(
    "committees",
    {
      name: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
      },
    },
    {
      timestamps: false,
      underscored: true,
    }
  );
  Committee.associate = function (models) {
    Committee.belongsToMany(models.ordinances, {
      as: "ordinances",
      through: {
        model: models.ordinance_committees,
      },
      
    });

    Committee.belongsToMany(models.resolutions, {
      as: "resolutions",
      through: {
        model: models.resolution_committees,
      },
    });

    Committee.belongsToMany(models.committee_reports, {
      as: "committee_reports",
      through: {
        model: models.committee_report_committees,
      },
    });

    Committee.belongsToMany(models.members, {
      as: "members",
      through: {
        model: models.member_committees,
      },
    });
  };

  return Committee;
};
