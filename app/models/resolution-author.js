"use strict";
module.exports = (sequelize, DataTypes) => {
  const ResolutionAuthor = sequelize.define(
    "resolution_authors",
    {
      member_id: DataTypes.INTEGER,
      resolution_number: DataTypes.STRING,
      role: DataTypes.STRING,
    },
    {
      timestamps: true,
      underscored: true,
    }
  );
  ResolutionAuthor.associate = function (models) {
    // ResolutionAuthor.belongsTo( models.resolutions, { as: 'resolution', foreignKey: 'resolution_id' } );
    ResolutionAuthor.belongsTo(models.members, {
      as: "info",
      foreignKey: "member_id",
      constraints: false,
    });
  };
  return ResolutionAuthor;
};
