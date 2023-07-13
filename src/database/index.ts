import { WebSocket } from 'ws';
import { v4 as uuidv4 } from 'uuid';
import personalResponse from '../responses/personal-response.ts';
import Board from '../board/index.ts';
import attackResponse from '../responses/attack-response.ts';

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
  gameId: string;
  players: string[];
  boards: {
    [key: string]: Board
  };
  currentPlayerTurn: 1 | 0;
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
      players: [],
      boards: {},
      currentPlayerTurn: 0
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
    this.games.push(newGame);
  }

  turn(gameId: string, shotStatus?: string) {
    const currentGame = this.games.find(game => game.gameId === gameId)!;
    const { currentPlayerTurn } = currentGame;

    if (shotStatus === 'miss') {
      currentPlayerTurn === 0 ? currentGame.currentPlayerTurn = 1 : currentGame.currentPlayerTurn = 0
    }
    // console.log('CUR-IDX:', currentPlayerTurn, shotStatus)
    // console.log(currentGame);
    currentGame.players.forEach(playerIndex => {
      this.connections[playerIndex].send(JSON.stringify({
        type: "turn",
        data: JSON.stringify({
          currentPlayer: currentGame.players[currentGame.currentPlayerTurn],
        }),
        id: 0,
      }))
    })
  }

  startGame(data: string, id: string) {
    const { gameId, ships, indexPlayer } = JSON.parse(data);
    const currentGame = this.games.find(game => game.gameId === gameId)!;
    currentGame.boards[id] = new Board(ships);

    // const oppositePlayerId = currentGame?.players.filter(id => id !== indexPlayer)[0];
    if (Object.keys(currentGame.boards).length === 2) {
      currentGame.players.forEach(playerId => {
        this.connections[playerId].send(JSON.stringify({
          type: 'start_game',
          data: JSON.stringify({
            ships: currentGame.boards[playerId].ships,
            // currentPlayerIndex: oppositePlayerId
            currentPlayerIndex: id
          }),
          id: 0
        }))
      })
      this.turn(gameId);
    }
  }

  randomAttack(data: string, id: string) {
    const { gameId, indexPlayer } = JSON.parse(data);
    const currentGame = this.games.find(game => game.gameId === gameId)!;
    const oppositePlayerId = currentGame?.players.filter(id => id !== indexPlayer)[0];
    const board = currentGame.boards[oppositePlayerId].board;

    let x = Math.floor(Math.random()*10);
    let y = Math.floor(Math.random()*10);

    while(!board[x][y].shotPossibility) {
      x = Math.floor(Math.random()*10);
      y = Math.floor(Math.random()*10);
    }

    this.atack(JSON.stringify({
      gameId,
      x,
      y,
      indexPlayer: id
    }),id);

  }

  atack(data: string, id: string) {
    const { gameId, x, y, indexPlayer } = JSON.parse(data);
    const currentGame = this.games.find(game => game.gameId === gameId)!;

    const currentTurnId = currentGame.players[currentGame.currentPlayerTurn];
    if (currentTurnId !== indexPlayer) {
      return;
    }


    const oppositePlayerId = currentGame?.players.filter(id => id !== indexPlayer)[0];
    const board = currentGame.boards[oppositePlayerId];

    if (!board.board[x][y].shotPossibility) {
      return;
    }

    const { status, cellsAround } = board.checkAttack(x, y);

    if (status === 'killed') {
      this.connections[id].send(attackResponse(status, x, y, id));
      this.connections[oppositePlayerId].send(attackResponse(status, x, y, id));
      cellsAround?.forEach(([x, y]) => {
        this.connections[id].send(attackResponse('miss', x, y, id));
        this.connections[oppositePlayerId].send(attackResponse('miss', x, y, id));
      })
      if(board.isEndGame(id, board.board)) {
        console.log('END GAME!!!')
      }
    } else {
      this.connections[id].send(attackResponse(status, x, y, id));
      this.connections[oppositePlayerId].send(attackResponse(status, x, y, id));
    }
    

    this.turn(gameId, status);
  }
}