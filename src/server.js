const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || process.env.NODE_PORT || 3000;
// const HOST = process.env.HOST || process.env.NODE_HOST || '127.0.0.1';

const index = fs.readFileSync(path.join(__dirname, './../client/client.html'));
const icon = fs.readFileSync(path.join(__dirname, './../client/favicon.ico'));

const onRequest = (req, res) => {
  switch (req.url) {
    case '/': {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.write(index);
      break;
    }
    case '/favicon.ico': {
      res.writeHead(200, { 'Content-Type': 'image/x-icon' });
      res.write(icon);
      break;
    }
    default: {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.write(`<h1>Invalid URL: ${req.url.substring(req.url.indexOf('/') + 1)}</h1>`);
      break;
    }
  }
  res.end();
};

require('./sockets')(http.createServer(onRequest).listen(PORT, () => {
  console.dir(`Server listening at 127.0.0.1:${PORT}`);
}));
