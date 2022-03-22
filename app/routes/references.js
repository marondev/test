require("hazardous");
const express = require("express");
const router = express.Router();
const fs = require("fs");
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args)); (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const path = require("path");

const Op = require("sequelize").Op;
const Model = require("../models");
const Log = require("../models").logs;
const Reference = require("../models").references;
const errorMessages = require("../constants/error-messages");

const uploadDir = path.join(__dirname, "..", "data", "uploads/");
const entity = "Reference";

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
  Reference.findByPk(req.params.id).then((e) => {
    if (e && e.length !== 0) {
      req.title = e.title;
      req.id = e.id;
      req.segment_id = e.sync_id;
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
      title: { [Op.like]: "%" + query + "%" },
    };
  }

  Reference.findAndCountAll({
    limit: limit,
    offset: offset,
    where: where,
    attributes: fields,
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
    [Op.or]: {
      version: { [Op.gt]: +req.query.version },
      sync_id: null,
    },
  };

  Reference.findAndCountAll({
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
  // Files
  const originalFiles = req.body.files;
  let data = [];

  if (originalFiles.length > 0) {
    data = req.body.files.map((file) => {
      file.file = fs.readFileSync(uploadDir + file.file);
      file.place_id = 1;

      if (!file.title) {
        file.title = file.filename;
      }

      return file;
    });
  }

  Reference.bulkCreate(data)
    .then(function (result) {
      for (let i = 0; result.length > i; i++) {
        // Log
        Log.create({
          user_id: req.decoded.id,
          entity_id: result[i].id,
          action: "create",
          entity: "references",
          description: result[i].title,
        });
      }

      params.results = result;
      params.results_count = result.count;
      params.msg = entity + " has successfully created.";
      res.status(200).json(params);
    })
    .catch(function (error) {
      params.error = true;
      params.status_code = 200;
      params.msg = errorMessages.err_0001;
      params.form_errors = err.errors;
      res.status(200).json(params);
    });
});

// Find one
router.get("/:id", [checkIDInput, checkIDExist], function (req, res) {
  Reference.findByPk(req.params.id).then((result) => {
    params.results = result;
    params.result_count = 1;
    params.total_count = 1;
    res.status(200).json(params);
  });
});

// Update
router.put("/:id", [checkIDInput, checkIDExist], function (req, res) {
  Reference.update(req.body, {
    where: { id: req.params.id },
  })
    .then((result) => {
      params.results = result;
      params.msg = entity + " has successfully updated.";
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

// Delete
router.delete("/:id", [checkIDInput, checkIDExist], function (req, res) {
  Reference.destroy({
    where: { id: req.params.id },
  }).then((result) => {
    // Log
    Log.create({
      user_id: req.decoded.id,
      entity_id: req.id,
      action: "delete",
      segment_id: req.segment_id,
      entity: "references",
      description: req.title,
    });

    params.results = result;
    params.msg = entity + " has successfully deleted.";
    res.status(200).json(params);
  });
});

// Sync
router.post("/:id", [checkIDInput], async function (req, res) {
  // Delete existing
  if (req.params.id) {
    await Reference.destroy({
      where: { id: req.params.id },
    });
  }

  if (req.body.is_deleted) {
    params.error = false;
    params.results_count = 1;
    params.msg = entity + " has successfully deleted.";
    res.status(200).json(params);
    return;
  }

  // File
  if (req.body.file) {
    if (req.body.file.startsWith("http")) {
      req.body.file = await fetch(req.body.file).then((res) => res.buffer());
    } else {
      req.body.file = fs.readFileSync(uploadDir + req.body.file);
    }
  }

  Reference.create(req.body)
    .then((result) => {
      params.error = false;
      params.results = result;
      params.msg = entity + " has successfully synced.";
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

module.exports = router;
