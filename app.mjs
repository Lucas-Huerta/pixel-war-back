import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { GameController } from "./src/controllers/GameController.js";
import cors from "cors";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());


app.get("/api/grid/:roomId", (req, res) => {
  const room = roomService.getRoom(req.params.roomId);
  if (!room) return res.status(404).json({ error: "Room not found" });
  res.json({ grid: room.grid });
});

// Configuration Socket.IO
const gameController = new GameController(io);
io.on("connection", (socket) => {
  gameController.handleConnection(socket);
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
