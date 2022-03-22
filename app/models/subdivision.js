module.exports = (sequelize, DataTypes) => {
  const Subdivision = sequelize.define(
    "subdivisions",
    {
      date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      number: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
        primaryKey: true,
      },
      clearance_number: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
      },
      developer_name: {
        type: DataTypes.STRING,
      },
      project_name: {
        type: DataTypes.STRING,
      },
      place_id: {
        type: DataTypes.INTEGER,
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

  Subdivision.associate = function (models) {
    Subdivision.hasMany(models.subdivision_files, { as: "files" });
  };

  return Subdivision;
};
