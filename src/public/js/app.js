const messageList = document.querySelector("ul");
const messageForm = document.querySelector("form");

const socket = new WebSocket(`ws://${window.location.host}`);
socket.addEventListener("open", () =>
  console.log("WebSocket connected to Server")
);

socket.addEventListener("message", (message) =>
  console.log("New Message from WS :", message.data)
);

socket.addEventListener("close", () =>
  console.log("WebSocket disconnected to Server")
);

function onSubmit(e) {
  e.preventDefault();
  const input = messageForm.querySelector("input");
  socket.send(input.value);
  input.value = "";
}

messageForm.addEventListener("submit", onSubmit);
