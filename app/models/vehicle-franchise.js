module.exports = (sequelize, DataTypes) => {
  const VehicleFranchise = sequelize.define(
    "vehicle_franchises",
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
      plate_number: {
        type: DataTypes.STRING,
      },
      owner: {
        type: DataTypes.STRING,
      },
      type: {
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

  VehicleFranchise.associate = function (models) {
    VehicleFranchise.hasMany(models.vehicle_franchise_files, { as: "files" });
  };

  return VehicleFranchise;
};
