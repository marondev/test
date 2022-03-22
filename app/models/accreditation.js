module.exports = (sequelize, DataTypes) => {
  const Accreditation = sequelize.define(
    "accreditations",
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
      chairman: {
        type: DataTypes.STRING,
      },
      name: {
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

  Accreditation.associate = function (models) {
    Accreditation.hasMany(models.accreditation_files, { as: "files" });
  };

  return Accreditation;
};
