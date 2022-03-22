const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");

const Op = require("sequelize").Op;
const User = require("../models").users;
const Log = require("../models").logs;
const errorMessages = require("../constants/error-messages");

require("hazardous");
const uploadDir = path.join(__dirname, "..", "data", "uploads/");

const entity = "User";

router.use(function init(req, res, next) {
  params = require("../constants/params").get();
  params.token = req.token;
  next();
});

// Middleware
const checkIDInput = function (req, res, next) {
  if (isNaN(req.params.id)) {
    params.error = true;
    params.status_code = 400;
    params.msg = errorMessages.err_0001 + " - Invalid ID supplied";
    res.status(400).json(params);
  } else {
    next();
  }
};

const checkIDExist = function (req, res, next) {
  User.findByPk(req.params.id).then((e) => {
    if (e && e.length !== 0) {
      req.fullname = e.fullname;
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
        200,
        200,
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
  const limit = parseInt(req.query.take) || 20;
  const offset = parseInt(req.query.offset) || 0;
  const query = req.query.q || "";

  let where = {
    role: "editor",
  };

  if (query) {
    where[Op.or] = {
      fullname: { [Op.like]: "%" + query + "%" },
      username: { [Op.like]: "%" + query + "%" },
    };
  }

  User.findAndCountAll({
    limit: limit,
    offset: offset,
    where: where,
    attributes: { exclude: ["password"] },
  }).then((results) => {
    params.results = results.rows;
    params.total_count = results.count;
    params.results_count = results.rows.length;
    res.status(200).json(params);
  }, {});
});

// Create
router.post("/", [resizeAvatar], function (req, res) {
  // Password
  const password = req.body.password;
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(password, salt);

  User.create({
    fullname: req.body.fullname,
    role: req.body.role,
    avatar: req.body.avatar || null,
    username: req.body.username,
    password: hash,
    // email: req.body.email,
    place_id: 1,
  })
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
        entity: "users",
        description: `${req.body.fullname}`,
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

// Find all with version
router.get("/all", function (req, res) {
  let where = {
    [Op.or]: {
      version: { [Op.gt]: +req.query.version },
      sync_id: null,
    },
  };

  User.findAndCountAll({
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

// Find one
router.get("/:id", [checkIDInput, checkIDExist], function (req, res) {
  User.findByPk(req.params.id).then((result) => {
    result.password = undefined;
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
    if (!req.body.avatar) delete req.body.avatar;

    const password = req.body.password;

    // Password
    if (password) {
      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync(password, salt);
      req.body.password = hash;
    } else {
      delete req.body.password;
    }

    User.update(req.body, {
      where: { id: req.params.id },
    })
      .then((result) => {
        // Log
        if (!req.body.sync_id) {
          Log.create({
            user_id: req.decoded.id,
            entity_id: req.params.id,
            entity: "users",
            action: "update",
            description: `${req.fullname}`,
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
  }
);

// Delete
router.delete("/:id", [checkIDInput, checkIDExist], function (req, res) {
  User.destroy({
    where: { id: req.params.id },
  }).then((result) => {
    // Log
    Log.create({
      user_id: req.decoded.id,
      entity_id: req.id,
      entity: "users",
      action: "delete",
      segment_id: req.segment_id,
      description: `${req.fullname}`,
    });

    params.results = result;
    params.msg = entity + " has successfully deleted.";
    res.status(200).json(params);
  });
});

module.exports = router;
