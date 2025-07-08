const socket = io();

const form = document.getElementById('form');
const input = document.getElementById('input');
const nameInput = document.getElementById('name');
const statusSelect = document.getElementById('status');
const messages = document.getElementById('messages');
const userList = document.getElementById('user-list');

let username = '';
let userStatus = 'online';

function sendUserInfo() {
  username = nameInput.value.trim();
  userStatus = statusSelect.value;
  if (username) {
    socket.emit('set username', { name: username, status: userStatus });
  }
}

nameInput.addEventListener('input', sendUserInfo);
statusSelect.addEventListener('change', sendUserInfo);

form.addEventListener('submit', (e) => {
  e.preventDefault();
  if (input.value && username) {
    socket.emit('chat message', input.value);
    input.value = '';
  }
});

socket.on('chat message', (data) => {
  if (!data || !data.name || !data.message) return;

  const colorMap = {
    online: '#43b581',
    idle: '#faa61a',
    dnd: '#f04747'
  };

  const dotColor = colorMap[data.status] || '#7289da';

  let time = '';
  try {
    time = new Date(data.timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch (err) {
    time = '??:??';
  }

  const item = document.createElement('li');
  item.innerHTML = `
    <span style="
      display: inline-block;
      width: 10px;
      height: 10px;
      background-color: ${dotColor};
      border-radius: 50%;
      margin-right: 6px;
    "></span>
    <strong>${data.name}</strong>
    <span style="color: #aaa; font-size: 12px;">[${time}]</span>: ${data.message}
  `;
  messages.appendChild(item);
  messages.scrollTop = messages.scrollHeight;
});

socket.on('user list', (users) => {
  userList.innerHTML = '';
  users.forEach(user => {
    const colorMap = {
      online: '#43b581',
      idle: '#faa61a',
      dnd: '#f04747'
    };
    const dotColor = colorMap[user.status] || '#7289da';

    const li = document.createElement('li');
    li.innerHTML = `
      <span style="
        display: inline-block;
        width: 10px;
        height: 10px;
        background-color: ${dotColor};
        border-radius: 50%;
        margin-right: 8px;
      "></span>${user.name}`;
    userList.appendChild(li);
  });
});
