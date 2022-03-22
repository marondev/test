const express = require("express");
const router = express.Router();

const Op = require("sequelize").Op;
const Log = require("../models").logs;

const errorMessages = require("../constants/error-messages");

router.use(function init(req, res, next) {
  params = require("../constants/params").get();
  if (!req.token) {
    params.msg = "No token provided.";
    return res.status(200).json(params);
  }
  params.token = req.token;
  next();
});

// Middleware
const checkIDInput = function (req, res, next) {
  if (isNaN(req.params.id)) {
    params.error = true;
    params.status_code = 200;
    params.msg = errorMessages.err_0001 + " - Invalid ID supplied";
    res.status(200).json(params);
  } else {
    next();
  }
};

const checkIDExist = function (req, res, next) {
  Log.count({ where: { id: req.params.id } }).then((count) => {
    if (count != 0) {
      next();
    } else {
      params.error = true;
      params.status_code = 200;
      params.msg = errorMessages.err_0004;
      res.status(200).json(params);
    }
  });
};

// Find All
router.get("/", function (req, res) {
  const limit = parseInt(req.query.take) || 20;
  const offset = parseInt(req.query.offset) || 0;
  const query = req.query.q || "";
  const fields = req.query.f ? req.query.f.split(",") : {};

  let where = {};

  if (query) {
    where[Op.or] = {
      action: { [Op.like]: "%" + query + "%" },
      entity: { [Op.like]: "%" + query + "%" },
      description: { [Op.like]: "%" + query + "%" },
    };
  }

  Log.findAndCountAll({
    limit: limit,
    offset: offset,
    where: where,
    attributes: fields,
    order: [["id", "DESC"]],
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
});

// Find all with version
router.get("/all", function (req, res) {
  let where = {
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
});

// Create
router.post("/", function (req, res) {
  Log.create({
    user_id: req.decoded.id,
    entity_id: req.body.entity_id,
    action: req.body.action,
    entity: req.body.entity,
    description: req.body.description,
  })
    .then((result) => {
      params.results = result;
      params.results_count = 1;
      params.msg = `Successfully ${req.body.action}.`;
      res.status(200).json(params);
    })
    .catch((err) => {
      params.error = true;
      params.status_code = 200;
      params.msg = errorMessages.err_0001;
      params.form_errors = err.errors;
      res.status(200).json(params);
    });
});

// Update
router.put("/:id", [checkIDInput, checkIDExist], function (req, res) {
  Log.update(req.body, {
    where: { id: req.params.id },
  })
    .then((result) => {
      params.results = result;
      params.msg = `Successfully ${action}.`;
      res.status(200).json(params);
    })
    .catch((err) => {
      params.error = true;
      params.status_code = 405;
      params.msg = errorMessages.err_0001;
      params.form_errors = err.errors;
      res.status(200).json(params);
    });
});

module.exports = router;
