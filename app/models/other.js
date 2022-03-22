module.exports = (sequelize, DataTypes) => {
  const Other = sequelize.define(
    "others",
    {
      date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      number: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      chairman: {
        type: DataTypes.STRING,
      },
      title: {
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

  Other.associate = function (models) {
    Other.hasMany(models.other_files, { as: "files" });
  };

  return Other;
};
