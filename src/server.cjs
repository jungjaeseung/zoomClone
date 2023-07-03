import http from "http";
import { Server } from "socket.io";
import express from "express";
import { instrument } from "@socket.io/admin-ui";
import cors from "cors";
import * as dotenv from "dotenv";

dotenv.config();

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (_, res) => res.render("home"));
app.get("/*", (_, res) => res.redirect("/"));

const handleListen = () => console.log(`Listening on http://localhost:3000`);

const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: ["https://admin.socket.io", process.env.MY_LOCAL_IP],
    credentials: true,
  },
});

app.use(cors());

instrument(io, {
  auth: false,
});

function getPublicRooms() {
  const {
    sockets: {
      adapter: { sids, rooms },
    },
  } = io;
  const publicRooms = [];
  rooms.forEach((_, key) => {
    if (sids.get(key) === undefined) {
      publicRooms.push(key);
    }
  });
  return publicRooms;
}

function countRoomMember(roomName) {
  return io.sockets.adapter.rooms.get(roomName)?.size;
}

io.on("connection", (socket) => {
  socket["nickname"] = "Anonymous";
  io.sockets.emit("room_change", getPublicRooms());
  socket.onAny((event) => {
    console.log(`Socket Event:${event}`);
  });
  socket.on("disconnecting", () => {
    socket.rooms.forEach((room) =>
      socket.to(room).emit("bye", socket.nickname, countRoomMember(room) - 1)
    );
  });
  socket.on("disconnect", () => {
    io.sockets.emit("room_change", getPublicRooms());
  });
  socket.on("enter_room", (roomName, nickname, done) => {
    if (nickname !== "") {
      socket["nickname"] = nickname;
    }
    socket.join(roomName);

    socket
      .to(roomName)
      .emit("welcome", socket.nickname, countRoomMember(roomName));
    socket.to(roomName).emit("camconnect");
    io.sockets.emit("room_change", getPublicRooms());
    done(countRoomMember(roomName));
  });
  socket.on("new_message", (message, room, done) => {
    socket.to(room).emit("new_message", `${socket.nickname}: ${message}`);
    done();
  });
  socket.on("nickname", (nickname, roomName) => {
    const previousNickname = socket["nickname"];
    socket["nickname"] = nickname;
    socket.to(roomName).emit("nickname", previousNickname, nickname);
  });
  socket.on("offer", (offer, roomName) => {
    socket.to(roomName).emit("offer", offer);
  });
  socket.on("answer", (answer, roomName) => {
    socket.to(roomName).emit("answer", answer);
  });
  socket.on("ice", (ice, roomName) => {
    socket.to(roomName).emit("ice", ice);
  });
  socket.on("rotate", (roomName) => {
    socket.to(roomName).emit("rotate");
  });
});

httpServer.listen(3000, handleListen);
