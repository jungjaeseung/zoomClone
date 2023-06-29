import {
  socket,
  myFace,
  muteBtn,
  cameraBtn,
  rotateYBtn,
  SpeakerSelect,
  cameraSelect,
  MicSelect,
} from "./app.js";

let myStream;
let muted = true;
let camOff = true;
let rotated = false;

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
    /*   const speakers = devices.filter((device) => device.kind === "audiooutput");
    const mics = devices.filter((device) => device.kind === "audioinput");
 */
    cameraSelect.innerText = cameras.filter(
      (camera) => camera.deviceId === "default"
    ).label;
    /*     SpeakerSelect.innerText = speakers.filter(
      (speaker) => speaker.deviceId === "default"
    ).label;
    MicSelect.innerText = mics.filter(
      (mic) => mic.deviceId === "default"
    ).label; */
    cameras.forEach((camera) => optionList(camera, cameraSelect));
    /*     speakers.forEach((speaker) => optionList(speaker, SpeakerSelect));
    mics.forEach((mic) => optionList(mic, MicSelect)); */
  } catch (e) {
    console.log(e);
  }
}

async function getMedia(deviceId) {
  const initialConstraints = {
    audio: false,
    video: { facingMode: "user" },
  };
  const cameraConstraints = {
    audio: false,
    video: { deviceId: { exact: deviceId } },
  };
  try {
    myStream = await navigator.mediaDevices.getUserMedia(
      deviceId ? cameraConstraints : initialConstraints
    );
    if (camOff) {
      myStream
        .getVideoTracks()
        .forEach((track) => (track.enabled = !track.enabled));
    }
    if (muted) {
      myStream
        .getAudioTracks()
        .forEach((track) => (track.enabled = !track.enabled));
    }
    if (!deviceId) {
      myStream.getAudioTracks().forEach((track) => (track.enabled = false));
      myStream.getVideoTracks().forEach((track) => (track.enabled = false));

      await getDevices();
    }
    myFace.srcObject = myStream;
  } catch (e) {
    console.log(e);
  }
}
getMedia();

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
  if (camOff) {
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
}

async function handleCameraChange(select) {
  await getMedia(select.value);
}

// function handleSelectChange(select) {}

muteBtn.addEventListener("click", handleMuteClick);
cameraBtn.addEventListener("click", handleCameraClick);
rotateYBtn.addEventListener("click", handleRotateYClick);
cameraSelect.addEventListener("input", () => handleCameraChange(cameraSelect));
/* SpeakerSelect.addEventListener("input", () =>
  handleSelectChange(SpeakerSelect)
);
MicSelect.addEventListener("input", () => handleSelectChange(MicSelect));
 */
