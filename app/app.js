const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const port = 7777;
const cors = require("cors");
// const path = require("path");

const backup = require("./routes/backup");

// Models
const models = require("./models");

// Routes
const ordinances = require("./routes/ordinances");
const resolutions = require("./routes/resolutions");
const sessions = require("./routes/sessions");
const members = require("./routes/members");
const membersExperiences = require("./routes/member-experience");
const membersEducations = require("./routes/member-education");
const membersAwards = require("./routes/member-award");
const membersProject = require("./routes/member-project");
const committeeReports = require("./routes/committee-reports");
const privilegeSpeeches = require("./routes/privilege-speeches");
const memoranda = require("./routes/memoranda");
const vehicleFranchises = require("./routes/vehicle-franchises");
const accreditations = require("./routes/accreditations");
const subdivisions = require("./routes/subdivisions");
const others = require("./routes/others");
const users = require("./routes/users");
const committees = require("./routes/committees");
const auth = require("./routes/auth");
const uploads = require("./routes/uploads");
const references = require("./routes/references");
const municipality = require("./routes/municipality");
const logs = require("./routes/logs");
const sync = require("./routes/sync");

// Admin
// app.use("/", express.static(path.join(__dirname, "./admin")));

// Sync Database
models.sequelize
  .sync()
  // .sync({force: true})
  .then(function () {
    console.log("\033[32m", "Connected to database");
  })
  .catch(function (err) {
    console.log("\033[31m", err);
  });

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(bodyParser.json());

const allowedOrigins = [
  "http://localhost:4200",
  "http://localhost:4300",
  "http://localhost:7777",
  "file://",
];
app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin
      // (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg =
          "The CORS policy for this site does not " +
          "allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

// Auth
app.use("/auth", auth);
app.use("/municipality", municipality);
app.use("/uploads", uploads);

// Check Token
app.use(require("./constants/token"));

// Register routes
app.use("/users", users);
app.use("/ordinances", ordinances);
app.use("/resolutions", resolutions);
app.use("/sessions", sessions);
app.use("/members", members);
app.use("/members-experiences", membersExperiences);
app.use("/members-educations", membersEducations);
app.use("/members-awards", membersAwards);
app.use("/members-projects", membersProject);
app.use("/committee-reports", committeeReports);
app.use("/privilege-speeches", privilegeSpeeches);
app.use("/memoranda", memoranda);
app.use("/vehicle-franchises", vehicleFranchises);
app.use("/accreditations", accreditations);
app.use("/subdivisions", subdivisions);
app.use("/others", others);
app.use("/committees", committees);
app.use("/references", references);
app.use("/uploads", uploads);
app.use("/sync", sync);
app.use("/logs", logs);

app.get("/me", (req, res) => {
  const User = require("./models").users;
  const params = require("./constants/params").get();
  params.token = req.token;
  const id = req.decoded["id"];

  User.findByPk(id).then((result) => {
    result.password = "";
    params.results = result;
    params.results_count = 1;
    params.total_count = 1;
    res.status(200).json(params);
  });
});

const server = app.listen(port, _ =>
  console.log(`Server is listening on localhost:${port}`)
);

process.on('SIGINT', () => {
  server.close( _ => {
    console.log("\033[31m", "Server Terminated!");
    process.exit(0);
  });
});

module.exports = app;
