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
    if (!roomId) {
      console.log("No roomId provided");
      return;
    }
    const room = io.sockets.adapter.rooms.get(roomId);

    
    const users = room ? Array.from(room) : [];
    
    const roomData = {
      roomId: roomId,
      users: users,
      totalUsers: users.length
    };
    
    socket.emit("roomUsers", roomData);
  });

  socket.on("joinRoom", (roomId) => {
    socket.join(roomId);
    const player = {
      id: socket.id,
      name: socket.data.username, // Assurez-vous d'avoir stocké le username quelque part
      teamId: null
    };
    
    // Notifier tous les autres joueurs dans la room
    socket.to(roomId).emit("player:joined", player);
    
    // Envoyer la mise à jour complète à tous les joueurs
    const roomPlayers = getRoomPlayers(roomId); // Créez cette fonction pour récupérer tous les joueurs
    io.to(roomId).emit("room:playersUpdate", roomPlayers);
  });
  
  // Fonction helper pour récupérer tous les joueurs d'une room
  function getRoomPlayers(roomId) {
    const room = io.sockets.adapter.rooms.get(roomId);
    if (!room) return [];
    
    return Array.from(room).map(socketId => {
      const socket = io.sockets.sockets.get(socketId);
      return {
        id: socketId,
        name: socket.data.username,
        teamId: socket.data.teamId || null
      };
    });
  }

  socket.on("getRooms", () => {
    const rooms = io.sockets.adapter.rooms;
    
    socket.emit("allRooms", rooms);
  });

  socket.on("joinTeam", (roomId, teamName) => {
    console.log("joinTeam", roomId, teamName);
    
    io.to(roomId).emit("teamJoined", teamName);
    console.log(`User joined team: ${teamName}`);
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
