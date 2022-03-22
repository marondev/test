module.exports = (sequelize, DataTypes) => {
  const PrivilegeSpeech = sequelize.define(
    "privilege_speeches",
    {
      delivery_date: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      place_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      author_id: {
        type: DataTypes.INTEGER,
      },
      title: {
        type: DataTypes.STRING,
      },
      remarks: {
        type: DataTypes.TEXT,
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

  PrivilegeSpeech.associate = function (models) {
    PrivilegeSpeech.hasMany(models.privilege_speech_files, { as: "files" });
    PrivilegeSpeech.belongsTo(models.members, {
      as: "author",
      foreignKey: "author_id",
      constraints: false,
    });
  };

  return PrivilegeSpeech;
};
