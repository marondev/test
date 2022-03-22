require("hazardous");
const express = require("express");
const router = express.Router();

const path = require("path");
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args)); (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const fs = require("fs");

const Op = require("sequelize").Op;
const Log = require("../models").logs;
const Member = require("../models").members;
const MemberCommittee = require("../models").member_committees;
const errorMessages = require("../constants/error-messages");

const uploadDir = path.join(__dirname, "..", "data", "uploads/");
const entity = "Member";

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
  Member.findByPk(req.params.id).then((e) => {
    if (e && e.length !== 0) {
      req.name =
        (e.firstname ? e.firstname + " " : "") +
        (e.middlename ? e.middlename + " " : "") +
        (e.lastname ? e.lastname + " " : "") +
        (e.suffix ? e.suffix : "");

      req.name.trim();
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

const resizeAvatar = function (req, res, next) {
  if (!req.body.avatar) {
    next();
    return;
  }

  const originalAvatar = uploadDir + req.body.avatar;
  const avatar = fs.readFileSync(originalAvatar);
  const Jimp = require("jimp");
  Jimp.read(avatar)
    .then((image) => {
      image.cover(
        300,
        300,
        Jimp.HORIZONTAL_ALIGN_CENTER,
        Jimp.VERTICAL_ALIGN_TOP
      );
      image.getBuffer(Jimp.AUTO, (err, buffer) => {
        if (!err) {
          req.body.avatar = buffer;
          next();
        } else {
          params.error = true;
          params.status_code = 200;
          params.msg = errorMessages.err_0001;
          res.status(200).json(params);
        }
      });
    })
    .catch((err) => {
      params.error = true;
      params.status_code = 200;
      params.msg = errorMessages.err_0001;
      res.status(200).json(params);
    });
};

// Find All
router.get("/", function (req, res) {
  const limit = parseInt(req.query.limit) || -1;
  const offset = parseInt(req.query.offset) || 0;
  const query = req.query.q || "";
  const fields = req.query.f ? req.query.f.split(",") : {};

  let where = "";

  if (query) {
    where = {
      [Op.or]: {
        firstname: { [Op.like]: "%" + query + "%" },
        middlename: { [Op.like]: "%" + query + "%" },
        lastname: { [Op.like]: "%" + query + "%" },
      },
    };
  }

  Member.findAndCountAll({
    limit: limit,
    offset: offset,
    where: where,
    attributes: fields,
    include: [
      {
        model: MemberCommittee,
        as: "committees",
        include: ["committee"],
      },
    ],
  }).then((results) => {
    params.results = results.rows;
    params.total_count = results.count;
    params.results_count = results.rows.length;
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

  Member.findAndCountAll({
    limit: -1,
    where: where,
    include: ["experiences", "educations", "projects", "awards", "committees"],
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
router.post("/", [resizeAvatar], function (req, res) {
  // Committees
  let committees = [];
  if (req.body.committees.length > 0) {
    committees = req.body.committees.map((id) => {
      return {
        committee_id: id,
        isHead: true,
      };
    });
  }

  Member.create(
    {
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      middlename: req.body.middlename,
      suffix: req.body.suffix,
      avatar: req.body.avatar || null,
      is_current: req.body.is_current,
      committees: committees,
      place_id: req.body.place_id,
    },
    {
      include: ["committees"],
    }
  )
    .then((result) => {
      // Log
      Log.create({
        user_id: req.decoded.id,
        entity_id: result.id,
        action: "create",
        entity: "members",
        description:
          (req.body.firstname + " " || "") +
          (req.body.middlename + " " || "") +
          (req.body.lastname + " " || "") +
          (req.body.suffix || ""),
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
  Member.findByPk(req.params.id, {
    include: [
      "experiences",
      "educations",
      "projects",
      "awards",
      "ordinances",
      "resolutions",
      "sessions",
      "committee_reports",
      {
        model: MemberCommittee,
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
router.put(
  "/:id",
  [checkIDInput, checkIDExist, resizeAvatar],
  function (req, res) {
    let data = req.body;

    if (!data.sync_id) {
      // Delete all committee
      MemberCommittee.destroy({
        where: { member_id: req.params.id },
      })
        .then((result) => {
          // Committees
          let committees = [];
          if (req.body.committees.length > 0) {
            committees = req.body.committees.map((id) => {
              return {
                member_id: req.params.id,
                committee_id: id,
                isHead: true,
              };
            });

            // Add all committees
            MemberCommittee.bulkCreate(committees)
              .then((result) => {})
              .catch((err) => {
                params.error = true;
                params.status_code = 405;
                params.msg = errorMessages.err_0001;
                params.form_errors = err.errors;
                return res.status(405).json(params);
              });
          }
        })
        .catch((err) => {
          params.error = true;
          params.status_code = 405;
          params.msg = errorMessages.err_0001;
          params.form_errors = err.errors;
          res.status(405).json(params);
        });

      data = {
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        middlename: req.body.middlename,
        suffix: req.body.suffix,
        avatar: req.body.avatar,
        is_current: req.body.is_current,
        place_id: req.body.place_id,
        version: req.body.version,
      };

      if (!req.body.avatar) delete data.avatar;
    }

    Member.update(data, {
      where: { id: req.params.id },
    })
      .then((result) => {
        if (!data.sync_id) {
          // Log
          Log.create({
            user_id: req.decoded.id,
            entity_id: req.params.id,
            entity: "members",
            action: "update",
            description: `${req.name}`,
          });
        }

        params.results = result;
        params.results_count = 1;
        params.msg = entity + " has successfully updated.";
        res.status(200).json(params);
      })
      .catch((err) => {
        params.error = true;
        params.status_code = 200;
        params.msg = errorMessages.err_0001;
        params.form_errors = err.errors;
        res.status(200).json(params);
      });
  }
);

// Sync
router.post("/:id", [checkIDInput], async function (req, res) {
  // Delete existing
  if (req.params.id) {
    await Member.destroy({
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

  // Avatar
  if (req.body.avatar) {
    if (req.body.avatar.startsWith("http")) {
      req.body.avatar = await fetch(req.body.avatar).then((res) =>
        res.buffer()
      );
    } else {
      req.body.avatar = fs.readFileSync(uploadDir + req.body.avatar);
    }
  }

  Member.create(req.body, {
    include: ["experiences", "educations", "projects", "awards", "committees"],
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
  Member.destroy({
    where: { id: req.params.id },
  })
    .then((result) => {
      // Log
      Log.create({
        user_id: req.decoded.id,
        entity_id: req.id,
        segment_id: req.segment_id,
        entity: "members",
        action: "delete",
        segment_id: req.segment_id,
        description: `${req.name}`,
      });

      params.results = result;
      params.msg = entity + " has successfully deleted.";
      res.status(200).json(params);
    })
    .catch((error) => {
      console.log(error);
    });
});

module.exports = router;
