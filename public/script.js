const socket = io();

const saved = localStorage.getItem('miscord-messages');
const messages = saved ? JSON.parse(saved) : {
  general: [],
  memes: []
};

let currentChannel = 'general';

const messageList = document.getElementById('messages');
const input = document.getElementById('input');
const form = document.getElementById('form');
const typingStatus = document.getElementById('typing-status');
const usernameInput = document.getElementById('name');
let typingTimeout;

const emojiMap = {
  ':smile:': '😄',
  ':laugh:': '😂',
  ':fire:': '🔥',
  ':heart:': '❤️',
  ':thumbsup:': '👍',
  ':sunglasses:': '😎',
  ':sob:': '😭',
  ':star:': '⭐',
  ':poop:': '💩',
  ':skull:': '💀'
};

function parseEmojis(text) {
  for (const shortcode in emojiMap) {
    text = text.split(shortcode).join(emojiMap[shortcode]);
  }
  return text;
}

usernameInput.value = localStorage.getItem('miscord-username') || '';

usernameInput.addEventListener('input', (e) => {
  const name = e.target.value;
  localStorage.setItem('miscord-username', name);
  socket.emit('set-username', name);
});

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const username = usernameInput.value || 'Anonymous';
  const text = input.value.trim();
  if (text !== '') {
    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const date = now.toISOString();
    const message = {
      user: username,
      time: time,
      date: date,
      text: text
    };
    messages[currentChannel].push(message);
    renderMessages();
    input.value = '';
    typingStatus.textContent = '';
    localStorage.setItem('miscord-messages', JSON.stringify(messages));
  }
});

function renderMessages() {
  messageList.innerHTML = '';

  messages[currentChannel].forEach(msg => {
    let displayTime = 'Unknown time';
    let dateLabel = 'Unknown date';

    if (msg.date) {
      const time = new Date(msg.date);
      const now = new Date();

      if (!isNaN(time.getTime())) {
        if (time.toDateString() === now.toDateString()) {
          dateLabel = 'Today';
        } else {
          const yesterday = new Date();
          yesterday.setDate(now.getDate() - 1);
          if (time.toDateString() === yesterday.toDateString()) {
            dateLabel = 'Yesterday';
          } else {
            dateLabel = time.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
          }
        }

        displayTime = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
    } else if (msg.time) {
      displayTime = msg.time; // legacy fallback
      dateLabel = 'Legacy';
    }

    const li = document.createElement('li');
    li.innerHTML = `<strong>${msg.user}</strong> <span style="color: #999; font-size: 0.8em;">${dateLabel} • ${displayTime}</span><br>${parseEmojis(msg.text)}`;
    messageList.appendChild(li);
  });
}

input.addEventListener('input', () => {
  showTyping();
  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    typingStatus.textContent = '';
  }, 1500);
});

function showTyping() {
  const username = usernameInput.value || 'Someone';
  typingStatus.textContent = `${username} is typing...`;
}

socket.on('system-message', (msg) => {
  const li = document.createElement('li');
  li.style.color = '#aaa';
  li.style.fontStyle = 'italic';
  li.textContent = msg;
  messageList.appendChild(li);
});

socket.on('user-list', (users) => {
  const userList = document.getElementById('user-list');
  if (userList) {
    userList.innerHTML = '';
    users.forEach(user => {
      const li = document.createElement('li');
      li.textContent = user.name;
      userList.appendChild(li);
    });
  }
});

// Emoji picker
const emojiToggle = document.getElementById('emoji-toggle');
const emojiPanel = document.getElementById('emoji-panel');

for (const shortcode in emojiMap) {
  const span = document.createElement('span');
  span.textContent = emojiMap[shortcode];
  span.title = shortcode;
  span.addEventListener('click', () => {
    input.value += ` ${shortcode} `;
    input.focus();
    emojiPanel.classList.add('hidden'); // hide after selection
  });
  emojiPanel.appendChild(span);
}

emojiToggle.addEventListener('click', () => {
  emojiPanel.classList.toggle('hidden');
});

renderMessages();
