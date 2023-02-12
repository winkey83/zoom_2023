const socket = io();

const myFace = document.getElementById("myFace");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");
const camerasSelect = document.getElementById("cameras");
const call = document.getElementById("call");
const welcome = document.getElementById("welcome");
const welcomeForm = welcome.querySelector("form");
call.hidden = true;

async function initCall() {
  welcome.hidden = true;
  call.hidden = false;
  await getMedia();
  makeConnection();
}

let roomName;
async function handleWelcomeSubmit(event) {
  event.preventDefault();
  const input = welcomeForm.querySelector("input");
  await initCall();
  socket.emit("join_room", input.value);
  roomName = input.value;
  input.value = "";
}
welcomeForm.addEventListener("submit", handleWelcomeSubmit);

let myStream;
let muted = false;
let cameraOff = false;
let myPeerCon;
let myDataChannel;

async function getCameras() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const cameras = devices.filter((d) => d.kind === "videoinput");
    const currentCamera = myStream.getVideoTracks()[0];

    cameras.forEach((c) => {
      const opt = document.createElement("option");
      opt.value = c.deviceId;
      opt.innerText = c.label;
      if (currentCamera.label == c.label) {
        opt.selected = true;
      }
      camerasSelect.appendChild(opt);
    });
  } catch (error) {
    console.log(error);
  }
}

async function getMedia(deviceId) {
  const initialConstraints = {
    audio: true,
    video: { facingMode: "user" },
  };

  const cameraConstraints = {
    audio: true,
    video: { deviceId: { exact: deviceId } },
  };

  try {
    myStream = await navigator.mediaDevices.getUserMedia(
      deviceId ? cameraConstraints : initialConstraints
    );
    myFace.srcObject = myStream;
    if (!deviceId) {
      await getCameras();
    }
  } catch (error) {
    console.log(error);
  }
}

function handleMuteBtnClick() {
  myStream.getAudioTracks().forEach((track) => {
    track.enabled = !track.enabled;
  });
  if (!muted) {
    muteBtn.innerText = "Unmute";
    muted = true;
  } else {
    muteBtn.innerText = "Mute";
    muted = false;
  }
}

function handleCameraBtnClick() {
  myStream.getVideoTracks().forEach((track) => {
    track.enabled = !track.enabled;
  });
  if (!cameraOff) {
    cameraBtn.innerText = "Cam Off";
    cameraOff = true;
  } else {
    cameraBtn.innerText = "Cam On";
    cameraOff = false;
  }
}

async function handleCameraChange() {
  await getMedia(camerasSelect.value);
  if (myPeerCon) {
    const videoTrack = myStream.getVideoTracks()[0];
    const videoSender = myPeerCon
      .getSenders()
      .find((s) => s.track.kind === "video");
    videoSender.replaceTrack(videoTrack);
  }
}

muteBtn.addEventListener("click", handleMuteBtnClick);
cameraBtn.addEventListener("click", handleCameraBtnClick);
camerasSelect.addEventListener("input", handleCameraChange);

// Socket

socket.on("welcome", async () => {
  myDataChannel = myPeerCon.createDataChannel("chat");
  myDataChannel.addEventListener("message", console.log);
  console.log("datachannel created!");

  const offer = await myPeerCon.createOffer();
  myPeerCon.setLocalDescription(offer);
  console.log("sent the offer");
  socket.emit("offer", offer, roomName);
});

socket.on("offer", async (offer) => {
  myPeerCon.addEventListener("datachannel", (event)=>{
    myDataChannel = event.channel;
    myDataChannel.addEventListener("message", console.log);
  });
  console.log("received the offer");
  myPeerCon.setRemoteDescription(offer);
  const answer = await myPeerCon.createAnswer();
  myPeerCon.setLocalDescription(answer);
  socket.emit("answer", answer, roomName);
  console.log("sent the answer");
});

socket.on("answer", (answer) => {
  console.log("received the answer");
  myPeerCon.setRemoteDescription(answer);
});

socket.on("ice", (ice) => {
  console.log("received ice candidate");
  myPeerCon.addIceCandidate(ice);
});

function makeConnection() {
  myPeerCon = new RTCPeerConnection({
    iceServers: [
      {
        url: "stun:stun.l.google.com:19302"
      },
    ],
  });
  myPeerCon.addEventListener("icecandidate", handleIce);
  myPeerCon.addEventListener("addstream", handleAddStream);
  myStream.getTracks().forEach((track) => myPeerCon.addTrack(track, myStream));
}

function handleIce(data) {
  socket.emit("ice", data.candidate, roomName);
  console.log("sent ice candidate");
}

function handleAddStream(data) {
  const peerFace = document.getElementById("peerFace");
  peerFace.srcObject = data.stream;
}
