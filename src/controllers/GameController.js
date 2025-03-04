import { roomService } from "../services/RoomService.js";

export class GameController {
  constructor(io) {
    this.io = io;
  }

  handleConnection(socket) {
    socket.on("join:room", (data) => {
      const player = {
        id: socket.id,
        username: data.username,
        socketId: socket.id,
      };

      const success = roomService.addPlayer(data.roomId, player);
      if (success) {
        socket.join(data.roomId);
        this.io.to(data.roomId).emit("player:joined", {
          players: roomService.getRoom(data.roomId)?.players,
        });
      }
    });

    socket.on("disconnect", () => {
      // Gérer la déconnexion
    });
  }
}
