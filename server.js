const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http, {
    cors: {
        origin: "*", // Essential for bypassing some proxy blocks
        methods: ["GET", "POST"]
    }
});

// Serve static files from the 'public' directory
app.use(express.static("public"));

let users = {};

io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    socket.on("join", (username) => {
        if (username) {
            socket.username = username;
            users[socket.id] = username;
            // Update everyone's member list
            io.emit("userList", Object.values(users));
            console.log(`${username} joined the chat`);
        }
    });

    socket.on("message", (msg) => {
        io.emit("message", {
            user: socket.username || "Anonymous",
            text: msg,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
    });

    socket.on("disconnect", () => {
        if (socket.username) {
            delete users[socket.id];
            io.emit("userList", Object.values(users));
            console.log(`${socket.username} left the chat`);
        }
    });
});

// Render provides the PORT environment variable automatically
const PORT = process.env.PORT || 3000;
http.listen(PORT, '0.0.0.0', () => {
    console.log(`Miscord is running on port ${PORT}`);
});