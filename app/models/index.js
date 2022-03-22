require("hazardous");
const fs = require("fs");
const path = require("path");
const { Sequelize, DataTypes } = require('sequelize');
const sqlite3 = require("sqlite3");

const sequelize = new Sequelize({
  dialect: "sqlite",
  dialectModule: sqlite3,
  storage: path.join(__dirname, "..", "data", "database.sqlite"),
});

const db = {};

fs.readdirSync(__dirname)
  .filter(function (file) {
    return file.indexOf(".") !== 0 && file !== "index.js";
  })
  .forEach(function (file) {
    const model = require(path.join(__dirname, file))(sequelize, DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach(function (modelName) {
  if ("associate" in db[modelName]) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
