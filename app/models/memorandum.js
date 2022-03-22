module.exports = (sequelize, DataTypes) => {
  const Memorandum = sequelize.define(
    "memoranda",
    {
      executed_date: {
        type: DataTypes.DATE,
      },
      approved_date: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      place_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      type: {
        type: DataTypes.STRING,
      },
      first_party: {
        type: DataTypes.STRING,
      },
      second_party: {
        type: DataTypes.STRING,
      },
      other_party: {
        type: DataTypes.STRING,
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

  Memorandum.associate = function (models) {
    Memorandum.hasMany(models.memorandum_files, { as: "files" });
  };

  return Memorandum;
};
