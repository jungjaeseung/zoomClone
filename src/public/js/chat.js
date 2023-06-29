import { socket, welcomeDiv, room, form } from "./app.js";
let roomName;

room.hidden = true;

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
  addMessage(`You changed name to ${input.value}`);
  socket.emit("nickname", input.value, roomName);
  input.value = "";
}

function showRoom(newCount) {
  welcomeDiv.hidden = true;
  room.hidden = false;
  const h3 = room.querySelector("h3");
  h3.innerText = `Room: ${roomName} (${newCount})`;
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

socket.on("welcome", (nickname, newCount) => {
  const h3 = room.querySelector("h3");
  h3.innerText = `Room: ${roomName} (${newCount})`;
  addMessage(`${nickname} joined!`);
});

socket.on("bye", (nickname, newCount) => {
  addMessage(`${nickname} left!`);
  const h3 = room.querySelector("h3");
  h3.innerText = `Room: ${roomName} (${newCount})`;
});

socket.on("new_message", addMessage);

socket.on("room_change", (rooms) => {
  const roomList = welcomeDiv.querySelector("ul");
  roomList.innerHTML = "";
  if (rooms.length === 0) {
    return;
  }
  rooms.forEach((room) => {
    const li = document.createElement("li");
    li.innerText = room;
    roomList.appendChild(li);
  });
});

socket.on("nickname", (previousNickname, nickname) => {
  addMessage(`${previousNickname} changed name to ${nickname}`);
});
