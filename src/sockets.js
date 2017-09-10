const socketio = require('socket.io');

let io;
const users = {};

const onJoined = (sock) => {
  const socket = sock;

  socket.on('join', (data) => {
    const joinMsg = {
      name: 'server',
      msg: `There are ${Object.keys(users).length} users online`,
    };

    socket.name = data.name;
    socket.emit('msg', joinMsg);

    socket.join('room1');

    const res = {
      name: 'server',
      msg: `${data.name} has joined the room.`,
    };
    socket.broadcast.to('room1').emit('msg', res);

    console.log(`${data.name} joined`);
    socket.emit('msg', { name: 'server', msg: 'You joined the room' });
  });
};
const onMsg = (sock) => {
  const socket = sock;

  socket.on('msgToServer', (data) => {
    io.sockets.in('room1').emit('msg', { name: socket.name, msg: data.msg });
  });
};
const onDisconnect = (sock) => {
  const socket = sock;
};

module.exports = (app) => {
  io = socketio(app);
  module.io = io;

  module.io.sockets.on('connection', (socket) => {
    onJoined(socket);
    onMsg(socket);
    onDisconnect(socket);
  });
};
