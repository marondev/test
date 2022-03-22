
require("hazardous");
const express = require("express");
const router = express.Router();
const fs = require("fs");
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args)); (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const path = require("path");
const moment = require("moment");

const Op = require("sequelize").Op; 
const Model = require("../models");
const Log = require("../models").logs;
const Resolution = require("../models").resolutions;
const errorMessages = require("../constants/error-messages");

const uploadDir = path.join(__dirname, "..", "data", "uploads/");
const entity = "Resolution";

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
  Resolution.findByPk(req.params.id).then((e) => {
    if (e && e.length !== 0) {
      req.title = e.title;
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

// Count all records
router.get("/count", function (req, res) {
  Resolution.count()
    .then((count) => {
      params.results = count;
      params.total_count = count;
      res.status(200).json(params);
    })
    .catch((err) => {
      params.error = true;
      params.status_code = 200;
      params.msg = errorMessages.err_0001;
      res.status(200).json(params);
    });
});

// Find All
router.get("/", function (req, res) {
  const limit = parseInt(req.query.take) || 20;
  const offset = parseInt(req.query.offset) || 0;
  const query = req.query.q || "";
  const filter = req.query.filter || "";
  const fields = req.query.f ? req.query.f.split(",") : {};
  const authorID = req.query.author_id || null;
  const order_field = req.query.order_field || "approved_date";
  const order_by = req.query.order_by || "DESC";

  let where = {};

  if (query) {
    where[Op.or] = {
      number: { [Op.like]: "%" + query + "%" },
      remarks: { [Op.like]: "%" + query + "%" },
      title: { [Op.like]: "%" + query + "%" },
    };
  }

  if (authorID) {
    where.author_id = authorID;
  }

  if (filter) {
    where.approved_date = null;
    if (filter == "approved") {
      where.approved_date = {
        [Op.ne]: null,
      };
    }
  }

  Resolution.findAndCountAll({
    limit: limit,
    offset: offset,
    where: where,
    attributes: fields,
    include: [
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
      params.error = err;
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

  Resolution.findAndCountAll({
    limit: -1,
    where: where,
    include: ["files", "committees", "co_authors", "co_sponsors"],
  })
    .then((results) => {
      params.results = results.rows;
      params.total_count = results.rows.length;
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
  if (req.body.committees && req.body.committees.length > 0) {
    committees = req.body.committees.map((id) => {
      return { committee_id: id };
    });
  }

  // Co Authors
  let co_authors = [];
  if (req.body.co_authors && req.body.co_authors.length > 0) {
    co_authors = req.body.co_authors.map((id) => {
      return {
        member_id: id,
        type: "author",
      };
    });
  }

  // Co Sponsors
  let co_sponsors = [];
  if (req.body.co_sponsors && req.body.co_sponsors.length > 0) {
    co_sponsors = req.body.co_sponsors.map((id) => {
      return {
        member_id: id,
        type: "sponsor",
      };
    });
  }

  Resolution.create(
    {
      place_id: req.body.place_id,
      number: req.body.number.trim(),
      author_id: req.body.author_id ? parseInt(req.body.author_id) : null,
      title: req.body.title,
      session_date: parseInt(moment(req.body.session_date).format("YYYYMMDD")),
      committee_report_number: req.body.committee_report_number,
      approved_date: req.body.approved_date || null,
      remarks: req.body.remarks,
      files: files,
      committees: committees,
      co_authors: co_authors,
      co_sponsors: co_sponsors,
    },
    {
      include: ["files", "committees", "co_authors", "co_sponsors"],
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
        entity: "resolutions",
        description: `${req.body.title}`,
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
  Resolution.findByPk(req.params.id, {
    include: [
      "files",
      "author",
      {
        model: Model.resolution_committees,
        as: "committees",
        include: ["committee"],
      },
      {
        model: Model.resolution_authors,
        as: "co_authors",
        include: [
          {
            model: Model.members,
            as: "info",
            scope: { role: "author" },
          },
        ],
      },
      {
        model: Model.resolution_authors,
        as: "co_sponsors",
        include: [
          {
            model: Model.members,
            as: "info",
            scope: { role: "sponsor" },
          },
        ],
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
  Resolution.update(req.body, {
    where: { number: req.params.id },
  })
    .then((result) => {
      // Log

      if (!req.body.sync_id) {
        Log.create({
          user_id: req.decoded.id,
          entity_id: req.params.id,
          action: "update",
          entity: "resolutions",
          description: `${req.title}`,
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
    await Resolution.destroy({
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

  Resolution.create(req.body, {
    include: ["files", "committees", "co_authors", "co_sponsors"],
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
  Resolution.destroy({
    where: { number: req.params.id },
  }).then((result) => {
    // Log
    Log.create({
      user_id: req.decoded.id,
      entity_id: req.id,
      action: "delete",
      segment_id: req.segment_id,
      entity: "resolutions",
      description: `${req.title}`,
    });

    params.results = result;
    params.msg = entity + " has successfully deleted.";
    res.status(200).json(params);
  });
});

module.exports = router;
