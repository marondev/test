"use strict";
module.exports = (sequelize, DataTypes) => {
  const OrdinanceAuthor = sequelize.define(
    "ordinance_authors",
    {
      member_id: DataTypes.INTEGER,
      ordinance_number: DataTypes.STRING,
      role: DataTypes.STRING,
    },
    {
      timestamps: true,
      underscored: true,
    }
  );
  OrdinanceAuthor.associate = function (models) {
    // OrdinanceAuthor.belongsTo( models.ordinances, { as: 'ordinance', foreignKey: 'ordinance_id' } );
    OrdinanceAuthor.belongsTo(models.members, {
      as: "info",
      foreignKey: "member_id",
      constraints: false,
    });
  };
  return OrdinanceAuthor;
};
