const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files
app.use(express.static(__dirname + '/public'));

// Set up a route
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});


const users = {};

// Socket.io ka connection
io.on('connection', (socket) => {
    console.log('A user connected');

    // Listen for a new user joining
    socket.on('new user', (username) => {
        users[socket.id] = username; // Store the username associated with the socket
        socket.broadcast.emit('user-joined', username);
    });

    // Listen for chat messages
    socket.on('chat message', (msg) => {
        const username = users[socket.id];
        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); // Get the current timestampv
        socket.broadcast.emit('chat message', { username, message: msg, timestamp }); // Broadcast the message to all connected clients
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        socket.broadcast.emit('left', users[socket.id]);
        console.log('A user disconnected');
        delete users[socket.id];
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
