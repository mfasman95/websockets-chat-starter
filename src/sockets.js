const socketio = require('socket.io');

let io;
const users = {};

const onJoined = (sock) => {
  const socket = sock;

  socket.on('join', (data) => {
    if (users[data.name]) {
      socket.emit('msg', {
        name: 'server',
        msg: `The name "${data.name}" is already in use. Please try a different name.`,
      });
      return;
    }
    users[data.name] = socket;

    socket.name = data.name;
    socket.emit('joined');
    socket.emit('msg', {
      name: 'server',
      msg: `There are ${Object.keys(users).length} users online`,
    });

    socket.join('room1');

    socket.broadcast.to('room1').emit('msg', {
      name: 'server',
      msg: `${data.name} has joined the room.`,
    });

    socket.emit('msg', { name: 'server', msg: 'You joined the room' });
  });
};
const onMsg = (sock) => {
  const socket = sock;

  socket.on('msgToServer', (data) => {
    if (data.msg.indexOf('/') === 0) {
      const command = data.msg.substring(data.msg.indexOf('/') + 1, data.msg.indexOf(' '));
      const postCommand = data.msg.substring(data.msg.indexOf(' ') + 1);
      switch (command) {
        case 'w': {
          const target = postCommand.substring(0, postCommand.indexOf(' '));
          const message = postCommand.substring(postCommand.indexOf(' ') + 1);
          if (!users[target]) {
            // Tell the socket that their whisper failed if the target does not exist
            socket.emit('msg', {
              name: 'server',
              msg: `[Your whisper cannot be sent because the user "${target}" does not exist.]`,
            });
          } else if (target === socket.name) {
            // Tell the socket that their whisper failed since they cannot whisper themself
            socket.emit('msg', {
              name: 'server',
              msg: '[You cannot send a whisper to yourself.]',
            });
          } else {
            // Store the last person who sent a whisper to the target socket
            users[target].lastWhisperFrom = socket.name;
            // Send the whipser to the specified target
            users[target].emit('whisperFrom', {
              name: socket.name,
              msg: message,
            });
            // Send a message to the socket that sent the whisper confirming it went through
            socket.emit('whisperTo', {
              name: target,
              msg: message,
            });
          }
          break;
        }
        case 'r': {
          const target = socket.lastWhisperFrom;
          if (!target) {
            // Tell the socket that their whisper failed if the target does not exist
            socket.emit('msg', {
              name: 'server',
              msg: '[Your reply cannot be sent because you have yet to receive a whisper to reply to.]',
            });
          } else if (!users[target]) {
            // Tell the socket that their whisper failed if the target is no longer connected
            socket.emit('msg', {
              name: 'server',
              msg: `[Your reply cannot be sent because ${target} is no longer connected to the server.]`,
            });
          } else {
            // Store the last person who sent a whisper to the target socket
            users[target].lastWhisperFrom = socket.name;
            // Send the reply to the last socket who whispered to this socket
            users[target].emit('whisperFrom', {
              name: socket.name,
              msg: postCommand,
            });
            // Send a message to the socket that sent the reply confirming it went through
            socket.emit('whisperTo', {
              name: target,
              msg: postCommand,
            });
          }
          break;
        }
        case 'me': {
          io.sockets.in('room1').emit('action', { action: `${socket.name} ${postCommand}` });
          break;
        }
        case 'roll': {
          switch (postCommand) {
            case 'd4': io.sockets.in('room1').emit('action', { action: `${socket.name} rolls a ${Math.ceil(Math.random() * 4)} on a ${postCommand}` }); break;
            case 'd6': io.sockets.in('room1').emit('action', { action: `${socket.name} rolls a ${Math.ceil(Math.random() * 6)} on a ${postCommand}` }); break;
            case 'd8': io.sockets.in('room1').emit('action', { action: `${socket.name} rolls a ${Math.ceil(Math.random() * 8)} on a ${postCommand}` }); break;
            case 'd10': io.sockets.in('room1').emit('action', { action: `${socket.name} rolls a ${Math.ceil(Math.random() * 10)} on a ${postCommand}` }); break;
            case 'd12': io.sockets.in('room1').emit('action', { action: `${socket.name} rolls a ${Math.ceil(Math.random() * 12)} on a ${postCommand}` }); break;
            case 'd20': io.sockets.in('room1').emit('action', { action: `${socket.name} rolls a ${Math.ceil(Math.random() * 20)} on a ${postCommand}` }); break;
            case 'd100': io.sockets.in('room1').emit('action', { action: `${socket.name} rolls a ${Math.ceil(Math.random() * 100)} on a ${postCommand}` }); break;
            default:
              socket.emit('msg', {
                name: 'server',
                msg: `[${postCommand} is not a valid type of die to roll]`,
              });
              break;
          }
          break;
        }
        default: {
          // Send a message back that the command was invalid
          socket.emit('msg', {
            name: 'server',
            msg: `[The command "${command}" is not recognized by the server]`,
          });
          break;
        }
      }
    } else io.sockets.in('room1').emit('msg', { name: socket.name, msg: data.msg });
  });
};
const onDisconnect = (sock) => {
  const socket = sock;

  socket.on('disconnect', () => {
    socket.broadcast.to('room1').emit('msg', {
      name: 'server',
      msg: `${socket.name} has left the room.`,
    });
    delete users[socket.name];
    socket.broadcast.to('room1').emit('msg', {
      name: 'server',
      msg: `There are ${Object.keys(users).length} users online`,
    });
  });
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
