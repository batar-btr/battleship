import WebSocket, { WebSocketServer } from 'ws';
import DataBase from '../database/index.ts';
import { v4 as uuidv4 } from 'uuid';

const PORT = 3000;

const wss = new WebSocketServer({ port: PORT });

const DB = new DataBase();

wss.on('connection', function connection(ws) {
  
  ws.on('error', console.error);

  const id = uuidv4();

  ws.on('message', function message(rawData: WebSocket.RawData) {
    const {type, data} = JSON.parse(rawData.toString('utf-8'));
    switch(type) {
      case 'reg': 
        DB.addNewPlayer(data, id, ws);
        break;
      case 'create_room':
        DB.createRoom(id);
        break;
      case 'add_user_to_room': 
        DB.addUserToRoom(data, id);
        break;
      case 'add_ships':
        DB.startGame(data, id);
        break;
      case 'attack':
        DB.atack(data, id);
        break;
      case 'randomAttack':
        DB.randomAttack(data, id); 
    }
  });

  ws.on('close', () => {
    console.log(`Disconnect client ${id}`);
  })

});

wss.on('listening', () => {
  console.log(`Start websocket server on the ${PORT} port!`);
})


process.on('SIGINT', () => {
  console.log('Good bye!)')
  wss.close();
})