class RoomService {
  rooms = new Map();

  createRoom() {
    const roomId = Math.random().toString(36).substr(2, 5);

    const room = {
      id: roomId,
      players: [],
      isGameStarted: false,
      grid: Array(100).fill(Array(100).fill(null)),
      team: []
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

  createTeamInRoom(roomId, teamName) {
    const room = this.rooms.get(roomId);
    if (!room) return false;

    room.team.push({
      name: teamName,
      players: [],
    });
    return true;
  }

  addPlayerinRoom(roomId, player) {
    const room = this.rooms.get(roomId);
    if (!room) return false;

    room.players.push(player);
    return true;
  }

  addPlayerInTeam(roomId, player) {
    const room = this.rooms.get(roomId);
    if (!room) return false;

    const team = room.team.find((t) => t.id === player.teamId);
    if (!team) return false;

    team.players.push(player);
    // room.players.push(player);
    return true;
  }
  
  getRoom(roomId) {
    return this.rooms.get(roomId);
  }
}

export const roomService = new RoomService();
