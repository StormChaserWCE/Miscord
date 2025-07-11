const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');

const users = {};

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
  users[socket.id] = { name: 'Anonymous', pfp: '' };

socket.on('set-pfp', (url) => {
  users[socket.id].pfp = url;
  sendUserList();
});


  const sendUserList = () => {
  io.emit('user-list', Object.values(users));
};


  socket.on('set-username', (name) => {
    users[socket.id].name = name;
    sendUserList();
  });

  socket.on('disconnect', () => {
    delete users[socket.id];
    sendUserList();
  });

  sendUserList();
});

http.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
