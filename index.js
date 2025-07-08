const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static('public'));

const users = {};

io.on('connection', (socket) => {
  socket.on('set username', ({ name, status }) => {
    users[socket.id] = { name, status };
    io.emit('user list', Object.values(users));
  });

  socket.on('chat message', (msgText) => {
    const user = users[socket.id];
    if (!user) return;

    io.emit('chat message', {
      name: user.name,
      status: user.status,
      message: msgText,
      timestamp: Date.now()
    });
  });

  socket.on('disconnect', () => {
    delete users[socket.id];
    io.emit('user list', Object.values(users));
  });
});

http.listen(3000, () => {
  console.log('✅ Miscord server running on http://localhost:3000');
});
