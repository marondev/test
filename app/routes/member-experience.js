const express = require("express");
const router = express.Router();

const Op = require("sequelize").Op;
const MemberExperience = require("../models").member_experiences;
const Municipality = require("../models").municipality;
const Member = require("../models").members;

const errorMessages = require("../constants/error-messages");
const entity = "Experience";

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
  Member.count({ where: { id: req.params.id } }).then((count) => {
    if (count != 0) {
      next();
    } else {
      params.error = true;
      params.status_code = 400;
      params.msg = errorMessages.err_0004;
      res.status(200).json(params);
    }
  });
};

// Find All
router.get("/", function (req, res) {
  const limit = parseInt(req.query.limit) || -1;
  const offset = parseInt(req.query.offset) || 0;

  MemberExperience.findAndCountAll({
    limit: limit,
    offset: offset,
    where: { member_id: req.params.id },
  }).then((results) => {
    params.results = results.rows;
    params.total_count = results.count;
    params.results_count = results.rows.length;
    res.status(200).json(params);
  }, {});
});

// Find one
router.get("/:id", [checkIDInput], function (req, res) {
  MemberExperience.findByPk(req.params.id).then((result) => {
    params.results = result;
    params.results_count = 1;
    params.total_count = 1;
    res.status(200).json(params);
  });
});

// Create
router.post("/", function (req, res) {
  MemberExperience.create({
    member_id: req.body.id,
    title: req.body.title,
    company: req.body.company,
    location: req.body.location,
    description: req.body.description,
    start_date: req.body.start_date,
    end_date: req.body.end_date,
  })
    .then(async (result) => {
      const member = await Member.update(
        { version: req.body.version },
        {
          where: { id: req.body.id },
        }
      );

      if (member) {
        params.results = result;
        params.results_count = 1;
        params.msg = entity + " has successfully created.";
      }
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
router.put("/:id", [checkIDInput], function (req, res) {
  MemberExperience.update(
    {
      title: req.body.title,
      company: req.body.company,
      location: req.body.location,
      description: req.body.description,
      start_date: req.body.start_date,
      end_date: req.body.end_date,
    },
    {
      where: { id: req.params.id },
    }
  )
    .then(async (result) => {
      const member = await Member.update(
        { version: req.body.version },
        {
          where: { id: req.body.id },
        }
      );

      if (member) {
        params.results = result;
        params.results_count = 1;
        params.msg = entity + " has successfully updated.";
        res.status(200).json(params);
      }
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
router.delete("/:id", [checkIDInput], async function (req, res) {
  try {
    const award = await MemberExperience.findByPk(req.params.id);
    const memberId = award.dataValues.member_id;
    const member = await Member.findByPk(memberId);
    const municipality = await Municipality.findByPk(
      member.dataValues.place_id
    );
    const version = municipality.dataValues.version + 1;

    // Destroy
    await MemberExperience.destroy({
      where: { id: req.params.id },
    });

    // Update the member's version
    await Member.update({ version: version }, { where: { id: memberId } });

    params.msg = entity + " has successfully deleted.";
    res.status(200).json(params);
  } catch (err) {
    params.error = true;
    params.status_code = 404;
    params.msg = errorMessages.err_0001;
    params.form_errors = err.errors;
    res.status(200).json(params);
  }
});

module.exports = router;
