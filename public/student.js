var courseId = prompt("Enter the access code");
let Peer = require("simple-peer");
let socket = io(`/${courseId}`);
const video = document.querySelector("video");
let client = {};
//get stream
navigator.mediaDevices
  .getUserMedia({ video: true, audio: true })
  .then(stream => {
    //tell the client that a new user has connected
    socket.emit("NewClient");
    //start the video on the client
    // video.srcObject = stream;
    // video.play();
    //used to initialize a peer
    function InitPeer(type) {
      //initiator=>who is calling the signal function
      //trickle =>we are calling multiple signal functions or not
      let peer = new Peer({
        initiator: type == "init" ? true : false,
        stream: stream,
        trickle: false
      });
      //when we get the stream from the other user we want to create the video
      peer.on("stream", function(stream) {
        console.log("REached streaming ");
        CreateVideo(stream);
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
      console.log("Make peer called");
      client.gotAnswer = false;
      let peer = InitPeer("init");
      //this function will execute automatically because of `init`
      peer.on("signal", function(data) {
        if (!client.gotAnswer) {
          socket.emit("Offer", data);
        }
        client.peer = peer;
      });
    }
    //for peer of type not init
    function FrontAnswer(offer) {
      let peer = InitPeer("not-init");
      //this signal function will not execute automatically
      peer.on("signal", function(data) {
        socket.emit("Answer", data);
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
    socket.on("BackOffer", FrontAnswer);
    socket.on("BackAnswer", SignalAnswer);
    socket.on("SessionActive", SessionActive);
    socket.on("CreatePeer", MakePeer);
    socket.on("RemoveVideo", RemoveVideo);
  })
  .catch(err => {
    document.write(err);
  });
