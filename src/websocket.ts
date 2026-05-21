import { WebSocketServer } from 'ws';

export function createWebSocketServer(server) {
  const wss = new WebSocketServer({ noServer: true });

  wss.on('connection', ws => {
    console.log('Client connected');
    ws.on('message', message => {
      console.log(`Received message => ${message}`);
    });
    ws.on('close', () => {
      console.log('Client disconnected');
    });
  });

  server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, socket => {
      wss.emit('connection', socket, request);
    });
  });

  return wss;
}
