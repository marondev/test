require("hazardous");
const express = require("express");
const router = express.Router();
const fs = require("fs");
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args)); (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const path = require("path");
const moment = require("moment");

const Op = require("sequelize").Op;
const Log = require("../models").logs;
const Session = require("../models").sessions;
const SessionMember = require("../models").session_members;
const SessionNotes = require("../models").session_notes;
const SessionFiles = require("../models").session_files;
const errorMessages = require("../constants/error-messages");

const uploadDir = path.join(__dirname, "..", "data", "uploads/");
const entity = "Session";

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
  Session.findByPk(req.params.id).then((e) => {
    if (e && e.length !== 0) {
      req.description = e.description;
      req.id = e.date;
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
  const take = parseInt(req.query.take) || -1;
  const offset = parseInt(req.query.offset) || 0;
  const query = req.query.q || "";
  const filter = req.query.filter || "";
  const fields = req.query.f ? req.query.f.split(",") : {};
  const references = req.query.ref ? req.query.ref.split(",") : [];
  const date = req.query.date || null;
  const order_field = req.query.order_field || "date";
  const order_by = req.query.order_by || "DESC";

  let where = {};

  if (query) {
    where[Op.or] = {
      number: { [Op.like]: "%" + query + "%" },
      description: { [Op.like]: "%" + query + "%" },
    };
  }

  if (date) {
    where.date = {
      [Op.gte]: date,
    };
  }

  if (filter) {
    where.type = filter;
  }

  Session.findAndCountAll({
    limit: take,
    offset: offset,
    where: where,
    attributes: fields,
    include: references,
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
});

// Create
router.post("/", async (req, res) => {
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

  // Members
  let members = [];
  if (req.body.members && req.body.members.length > 0) {
    members = req.body.members.map((id) => {
      return {
        member_id: id,
      };
    });
  }

  Session.create(
    {
      place_id: req.body.place_id,
      number: req.body.number.trim(),
      type: req.body.type,
      date: parseInt(moment(req.body.date).format("YYYYMMDD")),
      description: req.body.description,
      files: files,
      members: members,
      notes: [
        {
          user_id: req.decoded.id,
          note: req.body.note,
        },
      ],
    },
    {
      include: ["notes", "files", "members"],
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
        entity_id: parseInt(moment(req.body.date).format("YYYYMMDD")),
        action: "create",
        entity: "sessions",
        description: `${req.body.description}`,
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
  Session.findByPk(req.params.id, {
    include: [
      "notes",
      "files",
      "first_reading_ordinances",
      "second_reading_ordinances",
      "committee_hearing_ordinances",
      "third_reading_ordinances",
      "ammended_ordinances",
      "repealed_ordinances",
      "resolutions",
      "committee_reports",
      "privilege_speeches",
      {
        model: SessionMember,
        as: "members",
        include: ["info"],
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
router.put("/:id", [checkIDInput, checkIDExist], async (req, res) => {
  
  if( req.body.sync_id ) {
    Session.update(
      req.body,
      {
        where: { date: req.params.id },
      }
    ).then((result) => {
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
  } else {
    await SessionMember.destroy({
      where: {
        session_date: req.body.date,
      },
    });

    // Members
    if (req.body.members && req.body.members.length > 0) {
      const members = req.body.members.map((id) => {
        return {
          session_date: req.body.date,
          member_id: id,
        };
      });

      await SessionMember.bulkCreate(members, {
        fields: ["member_id", "session_date"],
      })
        .then((_) => {
          // Log
          // Log.create({
          //   user_id: req.decoded.id,
          //   entity_id: req.params.id,
          //   entity: "sessions_members",
          //   description: `${req.description}`,
          // });
        })
        .catch((err) => {
          params.error = true;
          params.status_code = 405;
          params.msg = errorMessages.err_0001;
          params.form_errors = err.errors;
          res.status(200).json(params);
        });
    }

    // Session Notes
    await SessionNotes.destroy({
      where: {
        session_date: req.body.date,
      },
    });

    if (req.body.note) {
      await SessionNotes.create({
        note: req.body.note,
        user_id: req.decoded.id,
        session_date: req.body.date,
      })
        .then((_) => {
          // // Log
          // Log.create({
          //   user_id: req.decoded.id,
          //   entity_id: req.params.id,
          //   entity: "session_notes",
          //   description: `${req.body.note}`,
          // });
        })
        .catch((err) => {
          params.error = true;
          params.status_code = 405;
          params.msg = errorMessages.err_0001;
          params.form_errors = err.errors;
          res.status(200).json(params);
        });
    }

    // Session Files
    if (req.body.files.length > 0) {
      try {
        await Promise.all(
          req.body.files.map(async (file) => {
            if (!file.id) {
              try {
                file.file = fs.readFileSync(uploadDir + file.file);
              } catch (error) {
                file = null;
              }
            }
            if (!file.title) {
              file.title = file.filename;
            }

            file.session_date = req.body.date
            return file;
          })
        );
      } catch (err) {
        params.error = true;
        params.status_code = 400;
        params.msg = errorMessages.err_0001;
        params.form_errors = err.errors;
        res.status(200).json(params);
        return;
      }

      await SessionFiles.bulkCreate(req.body.files).then((_) => {
        
      })
      .catch((err) => {
        params.error = true;
        params.status_code = 405;
        params.msg = errorMessages.err_0001;
        params.form_errors = err.errors;
        res.status(200).json(params);
      });
    }

    Session.update(req.body, {
      where: { date: req.params.id },
    })
      .then((result) => {
        // Log
        if (!req.body.sync_id) {
          Log.create({
            user_id: req.decoded.id,
            entity_id: req.params.id,
            action: "update",
            entity: "sessions",
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
  }
});

// Sync
router.post("/:id", [checkIDInput], async function (req, res) {
  // Delete existing
  if (req.params.id) {
    await Session.destroy({
      where: { date: req.params.id },
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

  Session.create(req.body, {
    include: ["files", "members"],
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
  Session.destroy({
    where: { date: req.params.id },
  }).then((result) => {
    // Log
    Log.create({
      user_id: req.decoded.id,
      entity_id: req.id,
      action: "delete",
      segment_id: req.id,
      entity: "session_files",
      description: `${req.description}`,
    });

    params.results = result;
    params.msg = entity + " has successfully deleted.";
    res.status(200).json(params);
  });
});

// Session File Delete
router.delete("/:id/file/:fileId",[checkIDInput, checkIDExist], function (req, res) {
  SessionFiles.destroy({
    where: {
      id: req.params.fileId,
    },
  }).then((result) => {
    // Log
    Log.create({
      user_id: req.decoded.id,
      entity_id: req.id,
      action: "update",
      segment_id: req.id,
      entity: "sessions",
      description: req.params.fileId,
    });

    params.results = result;
    params.msg = entity + " file has successfully deleted.";
    res.status(200).json(params);
  });
});

module.exports = router;
