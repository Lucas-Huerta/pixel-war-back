interface Player {
  id: string;
  username: string;
  socketId: string;
}

interface Room {
  id: string;
  players: Player[];
  isGameStarted: boolean;
  grid: string[][];
}

export { Player, Room };
