const video = document.querySelector("video");

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
    document.write("Access Code :", room);
    var peer = new Peer(room, {
      host: "localhost",
      port: 8080,
      path: "/myapp"
    });
    console.log("idar");
    peer.on("call", call => {
      console.log("Student called the teacher !!");
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: true })
        .then(stream => {
          console.log("Teacher Streaming successfully.");
          call.answer(stream);
        })
        .catch(err => {
          console.log("Streaming error", err);
        });
    });
  })
  .catch(err => {
    document.write(err);
  });
