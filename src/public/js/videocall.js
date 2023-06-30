import {
  socket,
  myFace,
  muteBtn,
  cameraBtn,
  rotateYBtn,
  cameraSelect,
  callDiv,
} from "./app.js";
import { getRoomName } from "./chat.js";

let myStream;
let muted = false;
let camOff = false;
let rotated = false;
/**@type{RTCPeerConnection} */
let myPeerConnection;

function optionList(item, select) {
  const option = document.createElement("option");
  option.value = item.deviceId;
  option.innerText = item.label;
  select.appendChild(option);
}

async function getDevices() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const cameras = devices.filter((device) => device.kind === "videoinput");
    cameras.forEach((camera) => optionList(camera, cameraSelect));
  } catch (e) {
    console.log(e);
  }
}

export async function getMedia(deviceId) {
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
    if (!deviceId) {
      await getDevices();
    }
    myFace.srcObject = myStream;
  } catch (e) {
    console.log(e);
  }
}

function handleMuteClick() {
  myStream
    .getAudioTracks()
    .forEach((track) => (track.enabled = !track.enabled));
  if (!muted) {
    muteBtn.innerText = "Unmute";
  } else {
    muteBtn.innerText = "Mute";
  }
  muted = !muted;
}

function handleCameraClick() {
  myStream
    .getVideoTracks()
    .forEach((track) => (track.enabled = !track.enabled));
  if (!camOff) {
    cameraBtn.innerText = "Cam Off";
  } else {
    cameraBtn.innerText = "Cam On";
  }
  camOff = !camOff;
}

function handleRotateYClick() {
  if (rotated) {
    myFace.style.transform = "rotateY(0)";
  } else {
    myFace.style.transform = "rotateY(180deg)";
  }
  rotated = !rotated;
  socket.emit("rotate", getRoomName());
}

async function handleCameraChange(select) {
  await getMedia(select.value);
  if (myPeerConnection) {
    const videoTrack = myStream.getVideoTracks()[0];
    const videoSender = myPeerConnection
      .getSenders()
      .find((sender) => sender.track.kind === "video");
    videoSender.replaceTrack(videoTrack);
  }
}

muteBtn.addEventListener("click", handleMuteClick);
cameraBtn.addEventListener("click", handleCameraClick);
rotateYBtn.addEventListener("click", handleRotateYClick);
cameraSelect.addEventListener("input", () => handleCameraChange(cameraSelect));

callDiv.hidden = true;

export function makeConnection() {
  myPeerConnection = new RTCPeerConnection({
    iceServers: [
      {
        urls: [
          "stun:stun.imafex.sk:3478",
          "stun:stun.t-online.de:3478",
          "stun:stun.officinabit.com:3478",
        ],
      },
    ],
  });
  myPeerConnection.addEventListener("icecandidate", handleIce);
  myPeerConnection.addEventListener("track", handleTrack);
  myStream
    .getTracks()
    .forEach((track) => myPeerConnection.addTrack(track, myStream));
}

socket.on("camconnect", async () => {
  const offer = await myPeerConnection.createOffer();
  myPeerConnection.setLocalDescription(offer);
  socket.emit("offer", offer, getRoomName());
});

socket.on("offer", async (offer) => {
  myPeerConnection.setRemoteDescription(offer);
  const answer = await myPeerConnection.createAnswer();
  myPeerConnection.setLocalDescription(answer);
  socket.emit("answer", answer, getRoomName());
});

socket.on("answer", (answer) => {
  myPeerConnection.setRemoteDescription(answer);
});

function handleIce(data) {
  socket.emit("ice", data.candidate, getRoomName());
}

socket.on("ice", (ice) => {
  myPeerConnection.addIceCandidate(ice);
});

function handleTrack(data) {
  const peerFace = document.getElementById("peerFace");
  peerFace.srcObject = data.streams[0];
}
