require("hazardous");
const express = require("express");
const router = express.Router();
const fsExtra = require("fs-extra");
const fs = require("fs");
const path = require("path");

const Log = require("../models").logs;
const errorMessages = require("../constants/error-messages");

const destination = path.join(__dirname, "..", "data", "backups");
const targetFile = path.join(__dirname, "..", "data", "database.sqlite");
const log = require("electron-log");

router.use(function init(req, res, next) {
  params = require("../constants/params").get();
  next();
});

router.get("/", function (req, res) {
  let name = req.query.name;
  let thisDay = Date.now();
  let timeStamp =
    new Date().toLocaleString().slice(0, 9) +
    " " +
    new Date().toLocaleString("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
  let sourceFile = destination + "/" + thisDay + ".sqlite";

  if (name === "backup") {
    // Async with callbacks:
    fsExtra.copy(targetFile, sourceFile, (err) => {
      if (err) {
        params.error = true;
        params.status_code = 200;
        params.msg = errorMessages.err_0001;
        res.status(200).json(params);
      } else {
        // Log
        Log.create({
          user_id: req.decoded.id,
          entity_id: "",
          entity: "Database",
          action: "Backup",
          description: timeStamp,
        });

        params.error = false;
        params.status_code = 200;
        params.msg = "Database has been successfully back up.";
        res.status(200).json(params);
      }
    });
  } else if (name === "list") {
    params.results = [];

    fs.readdirSync(destination).forEach((file) => {
      if (path.extname(file).substring(1) === "sqlite") params.results.push(file);
    });

    params.error = false;
    params.status_code = 200;
    params.msg = "Listing backups.";
    res.status(200).json(params);
  } else if (name === "restore") {
    try {
      if (req.query.filename) {
        let restoreFile = destination + "/" + req.query.filename + ".sqlite";

        // fsExtra.remove(targetFile, err => {

        //     if (err) {

        //         log.error(err);

        //         params.error = true;
        //         params.status_code = 200;
        //         params.msg = errorMessages.err_0001;
        //         res.status(200).json(params);
        //     } else {

        //         // Async with callbacks:
        //         fsExtra.copy(restoreFile, targetFile, err => {

        //           if (err) {

        //             log.error(err);

        //             params.error = true;
        //             params.status_code = 200;
        //             params.msg = errorMessages.err_0001;
        //             res.status(200).json(params);
        //           } else {

        //             // Log
        //             Log.create({
        //                 user_id: req.decoded.id,
        //                 entity_id: '',
        //                 entity: 'Database',
        //                 action: 'Restore',
        //                 description: timeStamp
        //             });

        //             params.results_count = 1;
        //             params.error = false;
        //             params.status_code = 200;
        //             params.msg = 'Database has been successfully restore.';
        //             res.status(200).json(params);

        //             setTimeout( () => {

        //                 const { app } = require('electron');
        //                 app.relaunch({ args: process.argv.slice(1).concat(['--relaunch']) });
        //                 app.exit(0);

        //                 require('../app.js');
        //             }, 1500);
        //           }
        //         });
        //     }
        // });

        // Async with callbacks:
        fsExtra.copy(restoreFile, targetFile, (err) => {
          if (err) {
            params.error = true;
            params.status_code = 200;
            params.msg = errorMessages.err_0001;
            res.status(200).json(params);
          } else {
            Log.create({
              user_id: req.decoded.id,
              entity_id: "",
              entity: "Database",
              action: "Restore",
              description: timeStamp,
            });

            params.results_count = 1;
            params.error = false;
            params.status_code = 200;
            params.msg = "Database has been successfully restore.";
            res.status(200).json(params);

            setTimeout(() => {
              const { app } = require("electron");
              app.relaunch({
                args: process.argv.slice(1).concat(["--relaunch"]),
              });
              app.exit(0);

              require("../app.js");
            }, 1500);
          }
        });
      } else {
        params.error = true;
        params.status_code = 200;
        params.msg = errorMessages.err_0001;
        res.status(200).json(params);
      }
    } catch (error) {
      Log.create({
        user_id: req.decoded.id,
        entity_id: "",
        entity: "Database",
        action: "Restore",
        description: error,
      });

      params.error = true;
      params.status_code = 200;
      params.msg = errorMessages.err_0001;
      res.status(200).json(params);
    }
  } else {
    params.error = true;
    params.status_code = 200;
    params.msg = errorMessages.err_0001;
    res.status(200).json(params);
  }
});

module.exports = router;
