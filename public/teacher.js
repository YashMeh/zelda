let Peer = require("simple-peer");
let socket = io();
const video = document.querySelector("video");
let client = {};

var name = prompt("Enter your name");
var courseName = prompt("Enter the name of the course");

const URL = "http://localhost:8080/api/course";

//Creating a room name
$.ajax({
  type: "POST",
  url: `${URL}/new`,
  data: { name: name, coursename: courseName }
})
  .then(response => {
    const room = response.courseID;
    console.log(room);
    //Creating a separate namespace for the teacher
    socket.emit("create-teacher-space", room);
    //Teacher will use nsocket to connect to its namespace
    var NSOCKET = io(`/${room}`);
    /**
     * Methods for streaming the teacher's video and
     * making the peer connection over the webRTC
     */
    //get stream
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then(stream => {
        //tell the client that a new user has connected
        NSOCKET.emit("NewClient");
        //start the video on the client
        video.srcObject = stream;
        video.play();
        //used to initialize a peer
        function InitPeer(type) {
          //initiator=>who is calling the signal function
          //trickle =>we are calling multiple signal functions or not
          let peer = new Peer({
            initiator: type == "init" ? true : false,
            stream: stream,
            trickle: false
          });
          //THIS METHOD WILL ACCESS THE STREAM OF THE PEER
          //CAN BE USED WHEN WE WANT TO ACCESS STUDENT'S FEED
          peer.on("stream", function(stream) {
            // CreateVideo(stream);
            //do something with the peer stream
          });
          //when the peer is close
          peer.on("close", function() {
            document.getElementById("peerVideo").remove();
            peer.destroy();
          });
          return peer;
        }

        //for peer of type init
        function MakePeer() {
          client.gotAnswer = false;
          let peer = InitPeer("init");
          //this function will execute automatically because of `init`
          peer.on("signal", function(data) {
            if (!client.gotAnswer) {
              NSOCKET.emit("Offer", data);
            }
            client.peer = peer;
          });
        }
        //for peer of type not init
        function FrontAnswer(offer) {
          let peer = InitPeer("not-init");
          //this signal function will not execute automatically
          peer.on("signal", function(data) {
            NSOCKET.emit("Answer", data);
          });
          peer.signal(offer);
        }
        function SignalAnswer(answer) {
          client.gotAnswer = true;
          let peer = client.peer;
          peer.signal(answer);
        }
        function CreateVideo(stream) {
          let video = document.createElement("video");
          video.id = "peerVideo";
          video.srcObject = stream;
          video.class = "embed-responsive-item";
          document.querySelector("#peerDiv").appendChild(video);
          video.play();
        }
        function SessionActive() {
          document.write("Session active.Come again later.");
        }
        function RemoveVideo() {
          document.getElementById("peerVideo").remove();
        }
        NSOCKET.on("BackOffer", FrontAnswer);
        NSOCKET.on("BackAnswer", SignalAnswer);
        NSOCKET.on("SessionActive", SessionActive);
        NSOCKET.on("CreatePeer", MakePeer);
        NSOCKET.on("RemoveVideo", RemoveVideo);
      })
      .catch(err => {
        document.write(err);
      });
  })
  .catch(err => {
    document.write(err);
  });
