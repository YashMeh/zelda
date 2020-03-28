const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const port = process.env.PORT || 3000;

app.use(express.static(__dirname + "/public"));
app.get("/teacher", (req, res) => {
  res.sendFile(__dirname + "/public/teacher.html");
});
app.get("/student", (req, res) => {
  res.sendFile(__dirname + "/public/student.html");
});
io.on("connection", function(socket) {
  /*
  When a teacher connects,
  then we should create a new namespace

  */
  console.log("External io on connection triggered");
  socket.on("create-teacher-space", rname => {
    let nsp = io.of(`/${rname}`);
    //Number of concurrent participants
    let clients = 0;
    nsp.on("connection", function(NSOCKET) {
      /*
        All the student side peering will be handled here
        */
      NSOCKET.on("NewClient", function() {
        if (clients < 20) {
          if (clients >= 1) {
            NSOCKET.emit("CreatePeer");
          }
        } else {
          NSOCKET.emit("SessionActive");
        }
        clients++;
      });
      NSOCKET.on("disconnect", Disconnect);
      NSOCKET.on("Offer", SendOffer);
      NSOCKET.on("Answer", SendAnswer);
      function Disconnect() {
        if (clients > 0) {
          clients--;
          NSOCKET.broadcast.emit("RemoveVideo");
        }
      }

      function SendOffer(offer) {
        NSOCKET.broadcast.emit("BackOffer", offer);
      }

      function SendAnswer(data) {
        NSOCKET.broadcast.emit("BackAnswer", data);
      }
    });
  });
});
http.listen(port, () => {
  console.log(`Active on port ${port}`);
});
