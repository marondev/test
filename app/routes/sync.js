const express = require("express");
const router = express.Router();

const Op = require("sequelize").Op;
const Model = require("../models");
const Ordinance = require("../models").ordinances;
const Resolution = require("../models").resolutions;
const Session = require("../models").sessions;
const CommitteeReport = require("../models").committee_reports;
const PrivilegeSpeech = require("../models").privilege_speeches;
const Memorandum = require("../models").memoranda;
const Franchise = require("../models").vehicle_franchises;
const Accreditation = require("../models").accreditations;
const Subdivision = require("../models").subdivisions;
const Other = require("../models").others;
const Member = require("../models").members;
const Log = require("../models").logs;
const Committee = require("../models").committees;
const References = require("../models").references;
const errorMessages = require("../constants/error-messages");

router.use(function init(req, res, next) {
  params = require("../constants/params").get();
  next();
});

// Middleware
const checkInput = function (req, res, next) {
  if (isNaN(req.query.version) && !req.params.segment) {
    params.error = true;
    params.status_code = 200;
    params.msg = errorMessages.err_0001 + " - Invalid input supplied";
    res.status(200).json(params);
  } else {
    next();
  }
};

router.get("/:segment", [checkInput], function (req, res) {
  let where = {
    [Op.or]: {
      version: { [Op.gt]: +req.query.version },
      sync_id: null,
    },
  };

  switch (req.params.segment) {
    case "logs":
      // Get only the deleted segments
      where = {
        action: "delete",
        [Op.or]: {
          version: { [Op.gt]: +req.query.version },
          sync_id: null,
        },
      };

      Log.findAndCountAll({
        limit: -1,
        where: where,
      })
        .then((results) => {
          params.results = results.rows;
          params.total_count = results.count;
          params.results_count = results.rows.length;
          res.status(200).json(params);
        })
        .catch((err) => {
          params.error = true;
          params.status_code = 200;
          params.msg = errorMessages.err_0001;
          res.status(200).json(params);
        });
      break;

    case "committees":
      Committee.findAndCountAll({
        limit: -1,
      })
        .then((results) => {
          params.results = results.rows;
          params.total_count = results.count;
          params.results_count = results.rows.length;
          res.status(200).json(params);
        })
        .catch((err) => {
          params.error = true;
          params.status_code = 200;
          params.msg = err;
          res.status(200).json(params);
        });
      break;

    case "ordinances":
      Ordinance.findAndCountAll({
        limit: -1,
        where: where,
        include: [
          "files",
          "co_sponsors",
          "co_authors",
          {
            model: Model.ordinance_committees,
            as: "committees",
            attributes: ["committee_id"],
          },
        ],
      })
        .then((results) => {
          params.results = results.rows;
          params.total_count = results.count;
          params.results_count = results.rows.length;
          res.status(200).json(params);
        })
        .catch((err) => {
          params.error = true;
          params.status_code = 200;
          params.msg = err;
          res.status(200).json(params);
        });
      break;

    case "resolutions":
      Resolution.findAndCountAll({
        limit: -1,
        where: where,
        include: ["files", "committees", "co_authors", "co_sponsors"],
      })
        .then((results) => {
          params.results = results.rows;
          params.total_count = results.count;
          params.results_count = results.rows.length;
          res.status(200).json(params);
        })
        .catch((err) => {
          params.error = true;
          params.status_code = 200;
          params.msg = err;
          res.status(200).json(params);
        });
      break;

    case "sessions":
      Session.findAndCountAll({
        limit: -1,
        where: where,
        include: ["files", "members"],
      })
        .then((results) => {
          params.results = results.rows;
          params.total_count = results.count;
          params.results_count = results.rows.length;
          res.status(200).json(params);
        })
        .catch((err) => {
          params.error = true;
          params.status_code = 200;
          params.msg = errorMessages.err_0001;
          res.status(200).json(params);
        });
      break;

    case "committee-reports":
      CommitteeReport.findAndCountAll({
        limit: -1,
        where: where,
        include: ["files", "committees"],
      })
        .then((results) => {
          params.results = results.rows;
          params.total_count = results.count;
          params.results_count = results.rows.length;
          res.status(200).json(params);
        })
        .catch((err) => {
          params.error = true;
          params.status_code = 200;
          params.msg = errorMessages.err_0001;
          res.status(200).json(params);
        });
      break;

    case "privilege-speeches":
      PrivilegeSpeech.findAndCountAll({
        limit: -1,
        where: where,
        include: ["files"],
      })
        .then((results) => {
          params.results = results.rows;
          params.total_count = results.count;
          params.results_count = results.rows.length;
          res.status(200).json(params);
        })
        .catch((err) => {
          params.error = true;
          params.status_code = 200;
          params.msg = errorMessages.err_0001;
          res.status(200).json(params);
        });
      break;

    case "memoranda":
      Memorandum.findAndCountAll({
        limit: -1,
        where: where,
        include: ["files"],
      })
        .then((results) => {
          params.results = results.rows;
          params.total_count = results.count;
          params.results_count = results.rows.length;
          res.status(200).json(params);
        })
        .catch((err) => {
          params.error = true;
          params.status_code = 200;
          params.msg = errorMessages.err_0001;
          res.status(200).json(params);
        });
      break;

    case "vehicle-franchises":
      Franchise.findAndCountAll({
        limit: -1,
        where: where,
        include: ["files"],
      })
        .then((results) => {
          params.results = results.rows;
          params.total_count = results.count;
          params.results_count = results.rows.length;
          res.status(200).json(params);
        })
        .catch((err) => {
          params.error = true;
          params.status_code = 200;
          params.msg = errorMessages.err_0001;
          res.status(200).json(params);
        });
      break;

    case "accreditations":
      Accreditation.findAndCountAll({
        limit: -1,
        where: where,
        include: ["files"],
      })
        .then((results) => {
          params.results = results.rows;
          params.total_count = results.count;
          params.results_count = results.rows.length;
          res.status(200).json(params);
        })
        .catch((err) => {
          params.error = true;
          params.status_code = 200;
          params.msg = errorMessages.err_0001;
          res.status(200).json(params);
        });
      break;

    case "subdivisions":
      Subdivision.findAndCountAll({
        limit: -1,
        where: where,
        include: ["files"],
      })
        .then((results) => {
          params.results = results.rows;
          params.total_count = results.count;
          params.results_count = results.rows.length;
          res.status(200).json(params);
        })
        .catch((err) => {
          params.error = true;
          params.status_code = 200;
          params.msg = errorMessages.err_0001;
          res.status(200).json(params);
        });
      break;

    case "others":
      Other.findAndCountAll({
        limit: -1,
        where: where,
        include: ["files"],
      })
        .then((results) => {
          params.results = results.rows;
          params.total_count = results.count;
          params.results_count = results.rows.length;
          res.status(200).json(params);
        })
        .catch((err) => {
          params.error = true;
          params.status_code = 200;
          params.msg = errorMessages.err_0001;
          res.status(200).json(params);
        });
      break;

    case "references":
      References.findAndCountAll({
        limit: -1,
        where: where,
      })
        .then((results) => {
          params.results = results.rows;
          params.total_count = results.count;
          params.results_count = results.rows.length;
          res.status(200).json(params);
        })
        .catch((err) => {
          params.error = true;
          params.status_code = 200;
          params.msg = errorMessages.err_0001;
          res.status(200).json(params);
        });
      break;

    case "members":
      Member.findAndCountAll({
        limit: -1,
        where: where,
        include: [
          "experiences",
          "educations",
          "projects",
          "awards",
          "committees",
        ],
      })
        .then((results) => {
          params.results = results.rows;
          params.total_count = results.count;
          params.results_count = results.rows.length;
          res.status(200).json(params);
        })
        .catch((err) => {
          params.error = true;
          params.status_code = 200;
          params.msg = errorMessages.err_0001;
          res.status(200).json(params);
        });
      break;

    default:
      params.error = true;
      params.status_code = 200;
      params.msg = errorMessages.err_0001;
      res.status(200).json(params);
      break;
  }
});

module.exports = router;
