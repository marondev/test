require("hazardous");
const express = require("express");
const router = express.Router();
const moment = require("moment");
const path = require("path");
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args)); (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const fs = require("fs");

const Op = require("sequelize").Op;
const Model = require("../models");
const Log = require("../models").logs;
const CommitteeReport = require("../models").committee_reports;
const errorMessages = require("../constants/error-messages");

const uploadDir = path.join(__dirname, "..", "data", "uploads/");
const entity = "Committee Report";

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
  if (!req.params.id) {
    params.error = true;
    params.status_code = 200;
    params.msg = errorMessages.err_0001 + " - Invalid ID supplied";
    res.status(200).json(params);
  } else {
    next();
  }
};

const checkIDExist = function (req, res, next) {
  CommitteeReport.findByPk(req.params.id).then((e) => {
    if (e && e.length !== 0) {
      req.description = e.description;
      req.id = e.number;
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
  const filter = req.query.filter || "";
  const fields = req.query.f ? req.query.f.split(",") : {};
  const order_field = req.query.order_field || "delivery_date";
  const order_by = req.query.order_by || "DESC";

  let where = {};

  if (query) {
    where[Op.or] = {
      number: { [Op.like]: "%" + query + "%" },
      remarks: { [Op.like]: "%" + query + "%" },
      description: { [Op.like]: "%" + query + "%" },
    };
  }

  if (filter) {
    where.type = filter;
  }

  CommitteeReport.findAndCountAll({
    limit: limit,
    offset: offset,
    where: where,
    attributes: fields,
    include: [
      {
        model: Model.committee_report_committees,
        as: "committees",
        include: ["committee"],
      },
      {
        model: Model.members,
        as: "author",
        attributes: ["firstname", "lastname"],
      },
    ],
    order: [[order_field, order_by]],
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
      params.err = err;
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
});

// Create
router.post("/", function (req, res) {
  // Files
  const originalFiles = req.body.files;
  let files = [];

  if (originalFiles && originalFiles.length > 0) {
    files = req.body.files.map((file) => {
      file.file = fs.readFileSync(uploadDir + file.file);

      if (!file.title) {
        file.title = file.filename;
      }
      return file;
    });
  }

  // Committees
  let committees = [];

  // if (req.body.committees) {
  //   if (!req.body.is_committee && req.body.committees.length > 0) {
  //     committees = req.body.committees.map((id) => {
  //       return { committee_id: id };
  //     });
  //   } else {
  //     committees.push({ committee_id: req.body.committees });
  //   }
  // }
  if (req.body.committees && req.body.committees.length > 0) {
    committees = req.body.committees.map((id) => {
      return { committee_id: id };
    });
  }

  CommitteeReport.create(
    {
      place_id: req.body.place_id,
      number: req.body.number,
      author_id: req.body.author_id,
      committee_id: req.body.committee_id,
      type: req.body.type,
      delivery_date: parseInt(
        moment(req.body.delivery_date).format("YYYYMMDD")
      ),
      is_committee: req.body.is_committee,
      remarks: req.body.remarks,
      description: req.body.description,
      files: files,
      committees: committees,
    },
    {
      include: ["files", "committees"],
    }
  )
    .then((result) => {
      // Clear the upload directory
      fs.readdir(uploadDir, (err, files) => {
        if (err) throw err;

        for (const file of files) {
          if ("index.html" != file) {
            fs.unlink(path.join(uploadDir, file), (err) => {
              if (err) throw err;
            });
          }
        }
      });

      // Log
      Log.create({
        user_id: req.decoded.id,
        entity_id: result.id,
        action: "create",
        entity: "committee-reports",
        description: req.body.description,
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
  CommitteeReport.findByPk(req.params.id, {
    include: [
      "files",
      "ordinances",
      "resolutions",
      "author",
      {
        model: Model.committee_report_committees,
        as: "committees",
        include: ["committee"],
      },
    ],
  }).then((result) => {
    params.results = result;
    params.results_count = 1;
    params.total_count = 1;
    res.status(200).json(params);
  });
});

// Update
router.put("/:id", [checkIDInput, checkIDExist], function (req, res) {
  CommitteeReport.update(req.body, {
    where: { number: req.params.id },
  })
    .then((result) => {
      // Log
      if (!req.body.sync_id) {
        Log.create({
          user_id: req.decoded.id,
          entity_id: req.params.id,
          entity: "committee-reports",
          action: "update",
          description: `${req.description}`,
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
      res.status(200).json(params);
    });
});

// Sync
router.post("/:id", [checkIDInput], async function (req, res) {
  // Delete existing
  if (req.params.id) {
    await CommitteeReport.destroy({
      where: { number: req.params.id },
    });
  }

  if (req.body.is_deleted) {
    params.error = false;
    params.results_count = 1;
    params.msg = entity + " has successfully deleted.";
    res.status(200).json(params);
    return;
  }

  // Files
  if (req.body.files.length > 0) {
    try {
      await Promise.all(
        req.body.files.map(async (file) => {
          if (file.file.startsWith("http")) {
            try {
              file.file = await fetch(file.file).then((res) => res.buffer());
            } catch (error) {
              file = null;
            }
          } else {
            try {
              file.file = fs.readFileSync(uploadDir + file.file);
            } catch (error) {
              file = null;
            }
          }

          if (!file.title) {
            file.title = file.filename;
          }

          return file;
        })
      );
    } catch (err) {
      params.error = true;
      params.status_code = 200;
      params.msg = errorMessages.err_0001;
      params.form_errors = err.errors;
      res.status(200).json(params);
      return;
    }
  }

  CommitteeReport.create(req.body, {
    include: ["files", "committees"],
  })
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

// Delete
router.delete("/:id", [checkIDInput, checkIDExist], function (req, res) {
  CommitteeReport.destroy({
    where: { number: req.params.id },
  }).then(
    (result) => {
      // Log
      Log.create({
        user_id: req.decoded.id,
        entity_id: req.params.id,
        entity: "committee-reports",
        action: "delete",
        segment_id: req.segment_id,
        description: `${req.description}`,
      });

      params.results = result;
      params.msg = entity + " has successfully deleted.";
      res.status(200).json(params);
    },
    (error) => {
      params.error = true;
      params.status_code = 200;
      params.msg = errorMessages.err_0001;
      res.status(200).json(params);
    }
  );
});

module.exports = router;
