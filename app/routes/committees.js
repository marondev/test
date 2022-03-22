const express = require("express");
const router = express.Router();

const Op = require("sequelize").Op;
const Committee = require("../models").committees;
const Log = require("../models").logs;
const errorMessages = require("../constants/error-messages");
const entity = "Committee";

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
    params.status_code = 400;
    params.msg = errorMessages.err_0001 + " - Invalid ID supplied";
    res.status(200).json(params);
  } else {
    next();
  }
};

const checkIDExist = function (req, res, next) {
  Committee.findByPk(req.params.id).then((e) => {
    if (e && e.length !== 0) {
      req.name = e.name;
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
  const limit = parseInt(req.query.limit) || -1;
  const offset = parseInt(req.query.offset) || 0;
  const query = req.query.q || "";
  const reference = req.query.ref ? [{ all: true }] : [];

  let where = "";

  if (query) {
    where = {
      [Op.or]: {
        name: { [Op.like]: "%" + query + "%" },
      },
    };
  }

  Committee.findAndCountAll({
    limit: limit,
    offset: offset,
    where: where,
    order: [["name", "ASC"]],
    include: reference,
  }).then((results) => {
    params.results = results.rows;
    params.total_count = results.count;
    params.results_count = results.rows.length;
    res.status(200).json(params);
  }, {});
});

// Create
router.post("/", function (req, res) {
  Committee.create({
    name: req.body.name.trim(),
  })
    .then((result) => {
      // Log
      Log.create({
        user_id: req.decoded.id,
        entity_id: result.id,
        action: "create",
        entity: "committees",
        description: `${req.body.name}`,
      });

      params.results = result;
      params.results_count = 1;
      params.msg = entity + " has successfully created.";
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

// Find one
router.get("/:id", [checkIDInput, checkIDExist], function (req, res) {
  Committee.findByPk(req.params.id).then((result) => {
    params.results = result;
    params.results_count = 1;
    params.total_count = 1;
    res.status(200).json(params);
  });
});

// Update
router.put("/:id", [checkIDInput, checkIDExist], function (req, res) {
  Committee.update(
    {
      name: req.body.name,
    },
    {
      where: { id: req.params.id },
    }
  )
    .then((result) => {
      // Log
      if (!req.body.sync_id) {
        Log.create({
          user_id: req.decoded.id,
          entity_id: req.params.id,
          entity: "committees",
          action: "update",
          description: `${req.name}`,
        });
      }

      params.results = result;
      params.msg = entity + " has successfully updated.";
      res.status(200).json(params);
    })
    .catch((err) => {
      params.error = true;
      params.status_code = 405;
      params.msg = errorMessages.err_0001;
      params.form_errors = err.errors;
      res.status(405).json(params);
    });
});

// Sync
router.post("/:id", [checkIDInput], function (req, res) {
  Promise.all(req.body.map((committee) => Committee.upsert(committee)))
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

  // Committee.destroy({
  //     where: {},
  //     truncate: true
  //   }).then(result => {

  //     Committee.bulkCreate( req.body )
  //         .then( result => {
  //             params.error = false;
  //             params.results = result;
  //             params.msg = entity + ' has successfully synced.';
  //             res.status(200).json( params );
  //         }).catch( err => {
  //             params.error = true;
  //             params.status_code = 200;
  //             params.msg = errorMessages.err_0001;
  //             params.form_errors = err.errors;
  //             res.status(200).json(params);
  //         });
  // });
});

// Delete
router.delete("/:id", [checkIDInput, checkIDExist], function (req, res) {
  Committee.destroy({
    where: { id: req.params.id },
  }).then((result) => {
    // Log
    Log.create({
      user_id: req.decoded.id,
      entity_id: req.id,
      entity: "committees",
      action: "delete",
      segment_id: req.segment_id,
      description: `${req.name}`,
    });

    params.results = result;
    params.msg = entity + " has successfully deleted.";
    res.status(200).json(params);
  });
});

module.exports = router;
