"use strict";
module.exports = (sequelize, DataTypes) => {
  const Member = sequelize.define(
    "members",
    {
      place_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      firstname: DataTypes.STRING,
      middlename: DataTypes.STRING,
      lastname: DataTypes.STRING,
      avatar: DataTypes.BLOB,
      suffix: DataTypes.STRING,
      is_current: DataTypes.BOOLEAN,
      sync_id: { type: DataTypes.STRING, allowNull: true },
      version: { type: DataTypes.INTEGER, defaultValue: 0 },
    },
    {
      timestamps: true,
      // paranoid: true,
      underscored: true,
    }
  );
  Member.associate = function (models) {
    Member.hasMany(models.member_committees, {
      as: "committees",
      foreignKey: "member_id",
    });
    Member.hasMany(models.member_awards, {
      as: "awards",
      foreignKey: "member_id",
    });
    Member.hasMany(models.member_educations, {
      as: "educations",
      foreignKey: "member_id",
    });
    Member.hasMany(models.member_experiences, {
      as: "experiences",
      foreignKey: "member_id",
    });
    Member.hasMany(models.member_projects, {
      as: "projects",
      foreignKey: "member_id",
    });
    Member.hasMany(models.ordinances, {
      as: "ordinances",
      foreignKey: "author_id",
      constraints: false,
    });
    Member.hasMany(models.resolutions, {
      as: "resolutions",
      foreignKey: "author_id",
      constraints: false,
    });
    Member.hasMany(models.committee_reports, {
      as: "committee_reports",
      foreignKey: "author_id",
      constraints: false,
    });

    Member.belongsToMany(models.sessions, {
      as: "sessions",
      through: {
        model: models.session_members,
      },
      constraints: false,
    });
  };
  return Member;
};
