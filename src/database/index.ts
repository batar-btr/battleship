import { WebSocket } from 'ws';
import { v4 as uuidv4 } from 'uuid';
import personalResponse from '../responses/personal-response.ts';

export interface Player {
  name: string;
  password: string;
  id: string;
}

interface Connection {
  [key: string]: WebSocket;
}

interface Room {
  roomId: string;
  roomUsers: { name: string, index: string }[]
};

interface Game {
  gameId: string,
  players: string[]
}

const isPlayerExist = (name: string, arr: Player[]) => arr.some(player => player.name === name);

export default class DataBase {

  players: Player[];
  connections: Connection;
  rooms: Room[];
  games: Game[];

  constructor() {
    this.players = [];
    this.connections = {};
    this.rooms = [];
    this.games = []
  }

  addNewPlayer(data: string, id: string, ws: WebSocket) {
    const { name, password } = JSON.parse(data);
    if (isPlayerExist(name, this.players)) {
      ws.send(JSON.stringify(personalResponse(name, -1, true, 'User Exist!!!')))
    } else {
      const newPlayer = { id, name, password };
      this.players.push(newPlayer);
      this.connections[id] = ws;
      ws.send(JSON.stringify(personalResponse(name, id, false, '')))
    }
  }

  updateRoom() {
    Object.keys(this.connections).forEach(key => {
      const client = this.connections[key];
      client.send(JSON.stringify({
        type: "update_room",
        data: JSON.stringify(this.rooms.filter(room => room.roomUsers.length === 1)),
        id: 0
      }))
    })
  }

  addUserToRoom(data: string, id: string) {
    const { name } = this.getPlayer(id)!;
    const { indexRoom } = JSON.parse(data);
    const idx = this.rooms.findIndex(room => room.roomId === indexRoom);
    if (this.rooms[idx].roomUsers.some(user => user.index === id)) {
      return;
    } else {
      this.rooms[idx].roomUsers.push({ name, index: id });
    }
    this.updateRoom();
    this.createGame(indexRoom);
  }

  getPlayer = (id: string): Player | undefined => this.players.find(player => player.id === id);

  createRoom(id: string) {
    const player = this.getPlayer(id);
    const newRoom = {
      roomId: uuidv4(),
      roomUsers: [
        {
          name: player?.name!,
          index: id
        }
      ]
    }
    this.rooms.push(newRoom)
    this.updateRoom();
  }

  createGame(indexRoom: string) {
    const room = this.rooms.find(room => room.roomId === indexRoom);
    const gameId = uuidv4();
    const newGame: Game = {
      gameId,
      players: []
    };
    room?.roomUsers.forEach(({ index }) => {
      newGame.players.push(index);
      this.connections[index].send(JSON.stringify({
        type: "create_game",
        data: JSON.stringify({
          idGame: gameId,
          idPlayer: index
        }),
        id: 0,
      }));
    })
  }

}