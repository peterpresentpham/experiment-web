import { createServer } from 'node:http';
import { attachSignalingServer } from './src/server/signaling.mjs';

const port = Number(process.env.SIGNAL_PORT || process.env.PORT) || 4001;
const hostname = process.env.HOSTNAME || '0.0.0.0';

const httpServer = createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Game signaling server is running.\n');
});

attachSignalingServer(httpServer);

httpServer.listen(port, hostname, () => {
  console.log(`> Game signaling server ready on http://${hostname}:${port}`);
});
