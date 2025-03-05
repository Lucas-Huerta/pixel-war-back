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
  console.log("Creating a new room");
  
  const roomId = roomService.createRoom();
  res.json({ roomId });
});

app.get("/api/room/:roomId", (req, res) => {
  const room = roomService.getRoom(req.params.roomId);
  if (!room) return res.status(404).json({ error: "Room not found" });
  res.json(room);
});

app.get("/", (req, res) => {
  res.send('Hello on API pixel war');
});

// Configuration Socket.IO
const gameController = new GameController(io);

io.on("connection", (socket) => {
  gameController.handleConnection(socket);
});

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
