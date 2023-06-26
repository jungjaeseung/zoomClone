const socket = io();

const welcomeDiv = document.getElementById("welcome");
const room = document.getElementById("room");
const form = welcomeDiv.querySelector("form");

room.hidden = true;

let roomName;

function addMessage(message) {
  const ul = room.querySelector("ul");
  const li = document.createElement("li");
  li.innerText = message;
  ul.appendChild(li);
}

function handleMessageSubmit(e) {
  e.preventDefault();
  const input = room.querySelector("#msg input");
  const value = input.value;
  socket.emit("new_message", input.value, roomName, () => {
    addMessage(`You: ${value}`);
  });
  input.value = "";
}

function handleNicknameSubmit(e) {
  e.preventDefault();
  const input = room.querySelector("#name input");
  socket.emit("nickname", input.value);
  input.value = "";
}

function showRoom() {
  welcomeDiv.hidden = true;
  room.hidden = false;
  const h3 = room.querySelector("h3");
  h3.innerText = `Room [${roomName}]`;
  const msgForm = room.querySelector("#msg");
  const nameForm = room.querySelector("#name");
  msgForm.addEventListener("submit", handleMessageSubmit);
  nameForm.addEventListener("submit", handleNicknameSubmit);
}

function handleRoomSubmit(e) {
  e.preventDefault();
  const nameInput = form.querySelector("#nameInput");
  const roomInput = form.querySelector("#roomInput");
  socket.emit("enter_room", roomInput.value, nameInput.value, showRoom);
  roomName = roomInput.value;
}

form.addEventListener("submit", handleRoomSubmit);

socket.on("welcome", (nickname) => {
  addMessage(`${nickname} joined!`);
});

socket.on("bye", (nickname) => {
  addMessage(`${nickname} left!`);
});

socket.on("new_message", addMessage);
