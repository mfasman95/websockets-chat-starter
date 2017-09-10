const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || process.env.NODE_PORT || 3000;
const HOST = process.env.HOST || process.env.NODE_HOST || '127.0.0.1';

const index = fs.readFileSync(path.join(__dirname, './../client/client.html'));

const onRequest = (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.write(index);
  res.end();
};

const app = http.createServer(onRequest).listen(PORT, HOST, () => {
  console.dir(`Server listening at ${HOST}:${PORT}`);
});
