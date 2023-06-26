import http from "http";
import WebSocket from "ws";
import express from "express";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public/js"));
app.get("/", (_, res) => res.render("home"));
app.get("/*", (_, res) => res.redirect("/"));

const handleListen = () => console.log(`Listening on http://localhost:3000`);

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const sockets = [];

wss.on("connection", (socket) => {
  sockets.push(socket);
  socket["nickname"] = "Anonymous";
  console.log("WebSocket connected to Client");
  socket.on("close", () => console.log("WebSocket disconnected from Client"));
  socket.on("message", (message) => {
    const parsedMsg = JSON.parse(message.toString());
    switch (parsedMsg.type) {
      case "new_message":
        sockets.forEach((aSocket) =>
          aSocket.send(`${socket.nickname}: ${parsedMsg.payload}`)
        );
        break;
      case "nickname":
        socket["nickname"] = parsedMsg.payload;
        break;
      default:
        return;
    }
  });
});

server.listen(3000, handleListen);
