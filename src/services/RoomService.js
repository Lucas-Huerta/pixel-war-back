class RoomService {
  rooms = new Map();

  createRoom() {
    const roomId = Math.random().toString(36).substr(2, 5);

    const room = {
      id: roomId,
      players: [],
      isGameStarted: false,
      grid: Array(100).fill(Array(100).fill(null)),
      teams: [
        { id: "team1", name: "Team 1", players: [], color: 0xff0000 },
        { id: "team2", name: "Team 2", players: [], color: 0x0000ff }
      ],
      tiles: new Map(), // Stockage des tuiles colorées
      scores: { team1: 0, team2: 0 } // Scores des équipes
    };
    this.rooms.set(roomId, room);
    return room;
  }

  updateTile(roomId, x, y, color, playerId) {
    const room = this.rooms.get(roomId);
    if (!room) return false;

    const tileKey = `${x},${y}`;
    room.tiles.set(tileKey, {
      color,
      playerId,
      teamId: this.getPlayerTeam(roomId, playerId)
    });

    // Mettre à jour les scores
    this.updateTeamScores(roomId);
    return true;
  }

  getPlayerTeam(roomId, playerId) {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    for (const team of room.teams) {
      if (team.players.find(p => p.id === playerId)) {
        return team.id;
      }
    }
    return null;
  }

  updateTeamScores(roomId) {
    const room = this.rooms.get(roomId);
    if (!room) return;

    const scores = { team1: 0, team2: 0 };
    room.tiles.forEach(tile => {
      if (tile.teamId === 'team1') scores.team1++;
      if (tile.teamId === 'team2') scores.team2++;
    });

    room.scores = scores;
  }

  updatePlayerPosition(roomId, playerId, position) {
    const room = this.rooms.get(roomId);
    if (!room) return false;

    const player = room.players.find(p => p.id === playerId);
    if (!player) return false;

    player.position = position;
    
    // Mettre à jour automatiquement la tuile à la nouvelle position
    const tileX = Math.floor(position.x / 32) * 32; // 32 est la taille de la grille
    const tileY = Math.floor(position.y / 32) * 32;
    const teamId = this.getPlayerTeam(roomId, playerId);
    const color = teamId === 'team1' ? 0xff0000 : 0x0000ff;
    
    this.updateTile(roomId, tileX, tileY, color, playerId);
    return true;
  }

  addPlayerinRoom(roomId, player) {
    const room = this.rooms.get(roomId);
    if (!room) return false;

    // Ajouter des propriétés par défaut au joueur
    const enhancedPlayer = {
      ...player,
      position: { x: 400, y: 300 }, // Position initiale
      // character: player.character || 0,
      team: null
    };

    room.players.push(enhancedPlayer);
    return true;
  }

  addPlayerToTeam(roomId, playerId, teamId) {
    const room = this.rooms.get(roomId);
    if (!room) return false;

    const team = room.teams.find(t => t.id === teamId);
    const player = room.players.find(p => p.id === playerId);
    
    if (!team || !player) return false;

    // Retirer le joueur de son équipe actuelle si nécessaire
    room.teams.forEach(t => {
      t.players = t.players.filter(p => p.id !== playerId);
    });

    // Ajouter le joueur à la nouvelle équipe
    team.players.push(player);
    player.team = teamId;
    player.color = team.color;

    return true;
  }

  startGame(roomId) {
    const room = this.rooms.get(roomId);
    if (!room || room.players.length < 2) return false;

    room.isGameStarted = true;
    room.tiles.clear(); // Réinitialiser la grille
    room.scores = { team1: 0, team2: 0 }; // Réinitialiser les scores

    // Positionner les joueurs à leurs positions initiales
    room.players.forEach(player => {
      player.position = { x: 400, y: 300 };
    });

    return true;
  }

  getRoom(roomId) {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    // Convertir la Map des tuiles en objet pour la sérialisation
    return {
      ...room,
      tiles: Array.from(room.tiles.entries()).map(([key, value]) => ({
        position: key,
        ...value
      }))
    };
  }

  getAllRooms() {
    return Array.from(this.rooms.values()).map(room => ({
      ...room,
      tiles: Array.from(room.tiles.entries()).map(([key, value]) => ({
        position: key,
        ...value
      }))
    }));
  }
}

export const roomService = new RoomService();
