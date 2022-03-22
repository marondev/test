const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const errorMessages = require("../constants/error-messages");
const User = require("../models").users;
const Log = require("../models").logs;

router.use(function init(req, res, next) {
  params = require("../constants/params").get();
  next();
});

// Middleware
const checkInput = function (req, res, next) {
  if (!req.body.username && !req.body.password) {
    params.error = true;
    params.status_code = 400;
    params.msg = errorMessages.err_0001;
    res.status(400).json(params);
  } else {
    next();
  }
};

const checkUserExist = function (req, res, next) {
  User.findOne({
    where: {
      username: req.body.username,
    },
  })
    .then((result) => {
      if (result) {
        const password = req.body.password;
        const isMatch = bcrypt.compareSync(password, result.password);

        if (isMatch) {
          params.error = false;
          params.status_code = 200;

          req.id = result.id;
          req.fullname = result.fullname;
          req.role = result.role;
          req.place_id = result.place_id;

          result.password = undefined;

          params.results = result;
          params.results_count = 1;
          next();
        } else {
          params.error = true;
          params.forced_login = true;
          params.msg = errorMessages.err_0004;
          res.status(200).json(params);
        }
      } else {
        params.error = true;
        params.msg = errorMessages.err_0004;
        res.status(200).json(params);
      }
    })
    .catch((err) => {
      params.error = true;
      params.status_code = 200;
      params.msg = errorMessages.err_0001;
      params.form_errors = err.errors;
      res.status(400).json(params);
    });
};

router.post("/login", [checkInput, checkUserExist], function (req, res) {
  const config = require("../constants/token").config;
  params.token = jwt.sign(
    { id: req.id, role: req.role, place_id: req.place_id },
    config.secret,
    { expiresIn: config.life }
  );
  params.msg = "Successfully login.";

  // Log
  Log.create({
    user_id: req.id,
    entity_id: "",
    action: "login",
    entity: "auth",
    description: req.fullname,
  });
  res.status(200).json(params);
});

module.exports = router;
