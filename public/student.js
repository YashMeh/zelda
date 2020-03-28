var courseId = prompt("Enter the access code");
const video = document.querySelector("video");
var peer = new Peer(null, {
  host: "localhost",
  port: 8080,
  path: "/myapp"
});
navigator.mediaDevices
  .getUserMedia({ video: true, audio: true })
  .then(stream => {
    var call = peer.call(courseId, stream);
    call.on("stream", remoteStream => {
      CreateVideo(remoteStream);
    });
  })
  .catch(err => {
    console.log("Error while streaming student's stream.", err);
  });
function CreateVideo(stream) {
  let video = document.createElement("video");
  video.id = "peerVideo";
  video.srcObject = stream;
  video.class = "embed-responsive-item";
  document.querySelector("#peerDiv").appendChild(video);
  video.play();
}
