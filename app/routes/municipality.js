require("hazardous");
const express = require("express");
const router = express.Router();
const path = require("path");
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args)); (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const fs = require("fs");

const Op = require("sequelize").Op;
const Municipality = require("../models").municipality;
const errorMessages = require("../constants/error-messages");

const uploadDir = path.join(__dirname, "..", "data", "uploads/");
const entity = "Municipality";

router.use(function init(req, res, next) {
  params = require("../constants/params").get();
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
  Municipality.count({ where: { server_id: req.params.id } }).then((count) => {
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

const resizeLogo = function (req, res, next) {
  if (!req.body.logo) {
    next();
    return;
  }

  const originalLogo = uploadDir + req.body.logo;
  const logo = fs.readFileSync(originalLogo);
  const Jimp = require("jimp");
  
  Jimp.read(logo)
    .then((image) => {
      image.cover(400, 400);
      image.getBuffer(Jimp.AUTO, (err, buffer) => {
        if (!err) {
          req.body.logo = buffer;
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

// Find one
router.get("/:id", [checkIDInput, checkIDExist], function (req, res) {
  Municipality.findOne({ where: { server_id: req.params.id } })
    .then((result) => {
      params.results = result;
      params.results_count = 1;
      params.total_count = 1;
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

// Create
router.post("/", [resizeLogo], function (req, res) {
  Municipality.create({
    name: req.body.name,
    logo: re.body.logo,
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

// Update
router.put(
  "/:id",
  [checkIDInput, checkIDExist, resizeLogo],
  function (req, res) {
    Municipality.update(req.body, {
      where: { server_id: req.params.id },
    })
      .then((result) => {
        params.results = result;
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
  // Avatar
  if (req.body.logo) {
    if (req.body.logo.startsWith("http")) {
      req.body.logo = await fetch(req.body.logo).then((res) => res.buffer());
    } else {
      req.body.logo = fs.readFileSync(uploadDir + req.body.logo);
    }
  }

  Municipality.update(req.body, {
    where: { server_id: req.body.server_id },
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

module.exports = router;
