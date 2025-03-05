import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { GameController } from "./src/controllers/GameController.js";
import { roomService } from "./src/services/RoomService.js";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Create a new room
app.post("/api/room", (req, res) => {
  const newRoom = roomService.createRoom();
  res.json(newRoom);
});

app.get("/api/room/:roomId", (req, res) => {
  const room = roomService.getRoom(req.params.roomId);
  if (!room) return res.status(404).json({ error: "Room not found" });
  res.json(room);
});

app.post("/api/room/:roomId/team", (req, res) => {
  const success = roomService.createTeamInRoom(req.params.roomId, req.body.name);
  if (!success) return res.status(404).json({ error: "Room not found" });
  res.json({ success });
});

app.post("/api/room/:roomId/player", (req, res) => {
  const player = req.body;
  const success = roomService.addPlayerinRoom(req.params.roomId, player);
  if (!success) return res.status(404).json({ error: "Room not found" });
  res.json({ success });
});

// Add a player to a team
app.post("/api/room/:roomId/player", (req, res) => {
  const player = req.body;
  const success = roomService.addPlayerInTeam(req.params.roomId, player);
  if (!success) return res.status(404).json({ error: "Room not found" });
  res.json({ success });
});

// Start the game
app.post("/api/room/:roomId/start", (req, res) => {
  const success = roomService.startGame(req.params.roomId);
  if (!success) return res.status(404).json({ error: "Room not found" });
  res.json({ success });
});

app.get("/", (req, res) => {
  res.send('Hello on API pixel war');
});

// Configuration Socket.IO
const gameController = new GameController(io);

io.on("connection", (socket) => {
  gameController.handleConnection(socket);
});

io.on("connection", (socket) => {
  socket.on("joinRoom", (roomId) => {
    socket.join(roomId);
    console.log(`User joined room: ${roomId}`);
  });

  socket.on("leaveRoom", (roomId) => {
    socket.leave(roomId);
    console.log(`User left room: ${roomId}`);
  });

  // WIP test
  socket.on("getRoomUsers", (roomId) => {
    const users = io.sockets.adapter.rooms.get(roomId);
    const userCount = users ? users.size : 0;
    socket.emit("roomUsers", { roomId, userCount });
  });

  socket.on("startGame", (roomId) => {
    io.to(roomId).emit("gameStarted");
  });

  socket.on("endGame", (roomId) => {
    io.to(roomId).emit("gameEnded");
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
