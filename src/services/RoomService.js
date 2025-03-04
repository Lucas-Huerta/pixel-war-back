class RoomService {
  rooms = new Map();

  createRoom(roomId) {
    const room = {
      id: roomId,
      players: [],
      isGameStarted: false,
      grid: Array(100).fill(Array(100).fill(null)),
    };
    this.rooms.set(roomId, room);
    return room;
  }

  startGame(roomId) {
    const room = this.rooms.get(roomId);
    if (!room || room.players.length === 0) return false;

    room.isGameStarted = true;
    return true;
  }
  
  getRoom(roomId) {
    return this.rooms.get(roomId);
  }
}

export const roomService = new RoomService();
