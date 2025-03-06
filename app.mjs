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
  console.log("User connected");

  // Gestion des rooms et des joueurs
  socket.on("joinRoom", (roomId) => {
    socket.join(roomId);
    socket.data.roomId = roomId; // Stocker l'ID de la room dans les données du socket
    
    const player = {
      id: socket.id,
      name: socket.data.username,
      position: { x: 400, y: 300 }, // Position initiale
      character: socket.data.character || 0,
      team: socket.data.team || null,
      color: socket.data.team === 1 ? 0xff0000 : 0x0000ff // Couleur selon l'équipe
    };

    // Notifier les autres joueurs
    socket.to(roomId).emit("player:joined", player);

    // Envoyer la mise à jour à tous les joueurs
    const roomPlayers = getRoomPlayers(roomId);
    io.to(roomId).emit("room:playersUpdate", roomPlayers);

    const roomData = roomService.getRoom(roomId);
    io.to(roomId).emit("room:update", roomData);
  });

  socket.on("joinTeam", (roomId, teamName) => {
    socket.data.team = parseInt(teamName.replace('team', '')); // Extraire le numéro d'équipe
    socket.data.color = socket.data.team === 1 ? 0xff0000 : 0x0000ff;
    
    io.to(roomId).emit("teamJoined", {
      playerId: socket.id,
      teamName,
      color: socket.data.color
    });
  });

  socket.on("startGame", (roomId) => {
    const room = roomService.startGame(roomId);
    const players = getRoomPlayers(roomId).map(player => ({
      ...player,
      position: { x: 400, y: 300 },
      color: player.team === 1 ? 0xff0000 : 0x0000ff
    }));

    io.to(roomId).emit("gameStarted", roomId);
    io.to(roomId).emit("players:update", players);
  });

  // Gestion des mouvements et des tuiles
  socket.on("player:move", ({ roomId, position, playerId }) => {
    // Mettre à jour la position du joueur
    roomService.updatePlayerPosition(roomId, playerId, position);
    
    // Émettre la position à tous les autres joueurs de la room
    socket.to(roomId).emit("player:moved", { 
      playerId,
      position,
      character: socket.data.character,
      color: socket.data.color
    });
  });

  socket.on("tile:update", ({ roomId, x, y, color, playerId }) => {
    // Stocker la mise à jour de la tuile
    roomService.updateTile(roomId, x, y, color, playerId);
    
    // Émettre la mise à jour aux autres joueurs
    socket.to(roomId).emit("tile:updated", {
      x,
      y,
      color,
      playerId
    });
  });

  // Helper pour récupérer les joueurs d'une room
  function getRoomPlayers(roomId) {
    const room = io.sockets.adapter.rooms.get(roomId);
    if (!room) return [];
    
    return Array.from(room).map(socketId => {
      const socket = io.sockets.sockets.get(socketId);
      return {
        id: socketId,
        name: socket.data.username,
        team: socket.data.team,
        character: socket.data.character,
        color: socket.data.team === 1 ? 0xff0000 : 0x0000ff,
        position: socket.data.position || { x: 400, y: 300 }
      };
    });
  }

  // Gestion de la déconnexion
  socket.on("disconnect", () => {
    const roomId = socket.data.roomId;
    if (roomId) {
      // Informer les autres joueurs
      socket.to(roomId).emit("player:left", socket.id);
      
      // Mettre à jour la liste des joueurs
      const remainingPlayers = getRoomPlayers(roomId);
      io.to(roomId).emit("room:playersUpdate", remainingPlayers);
    }
  });
});

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
