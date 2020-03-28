const express = require("express"),
  mongoose = require("mongoose"),
  bodyParser = require("body-parser"),
  cors = require("cors"),
  helmet = require("helmet"),
  morgan = require("morgan"),
  config = require("config"),
  app = express(),
  port = process.env.PORT || 8080;
//Instanciating a peer server
var ExpressPeerServer = require("peer").ExpressPeerServer;
var options = {
  debug: true,
  allow_discovery: true
};
app.use(express.static(__dirname + "/public"));
app.get("/teacher", (req, res) => {
  res.sendFile(__dirname + "/public/teacher.html");
});
app.get("/student", (req, res) => {
  res.sendFile(__dirname + "/public/student.html");
});
//Use the database uri from the ./config directory
const dbURI = config.dbURI;
mongoose
  .connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(res => {
    console.log("Database connected successfully.");
  })
  .catch(err => {
    throw err;
  });
mongoose.set("useFindAndModify", false);
//Configuring the express instance
// Prevent misconfig headers
app.disable("x-powered-by");

// Prevent opening page in frame or iframe to protect from clickjacking
app.use(helmet.frameguard());

// Prevents browser from caching and storing page
app.use(helmet.noCache());

// use bodyParser to parse application/json content-type
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// enable all CORS requests
app.use(cors());

//If executing in test environment then prevent logging
if (config.util.getEnv("NODE_ENV") !== "test") {
  // log HTTP requests
  app.use(morgan("combined"));
}

//Requiring Routes
const readingRoutes = require("./routes/Courses");

//Using Routes
app.use("/api/course", readingRoutes);

//Starting the server
const server = app.listen(port, err => {
  if (err) throw err;
  console.log(`Server running at port ${port}`);
});
//Peer server

const peerServer = ExpressPeerServer(server, options);
app.use("/myapp", peerServer);

peerServer.on("connection", id => {
  console.log(id + "connected");
  //console.log(server._clients);
});

server.on("disconnect", id => {
  console.log(id + "deconnected");
});

module.exports = app; // for testing
