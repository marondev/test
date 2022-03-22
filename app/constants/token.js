"use strict";

var jwt = require("jsonwebtoken");
var newToken;

var config = {
  secret: "legisled!@#$%^&*()_+",
  life: "24h",
};

module.exports = (req, res, next) => {
  const params = require("./params").get();

  const token =
    req.body.token || req.query.token || req.headers["x-access-token"];
  req.token = token;

  if (!token) {
    params.error = true;
    params.forced_login = true;
    params.msg = "No token provided.";

    return res.send(params);
  }

  jwt.verify(token, config.secret, function (err, decoded) {
    if (err) {
      params.msg = "Unauthorized Access.";
      params.error = true;
      params.forced_login = true;
      return res.send(params);
    }

    newToken = jwt.sign({ id: decoded.id, role: decoded.role }, config.secret, {
      expiresIn: config.life,
    });
    req.token = newToken;
    req.decoded = decoded;
    next();
  });
};

module.exports.getNew = function () {
  return newToken;
};

module.exports.config = config;
