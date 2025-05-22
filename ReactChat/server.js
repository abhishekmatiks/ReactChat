const express = require('express'); // This thing will help me handle http requests
const http = require('http'); // Node module to create server
const cors = require('cors'); // To give access to all users from different ips
const { Server } = require('socket.io'); // Makes bidirectional communication

const app = express();
app.use(cors());

const server = http.createServer(app);

 const io = new Server(server, {
    cors: {
        origin: '*',  // Allow any domain to connect 
        methods: ['GET', 'POST'], // Allow only GET and POST HTTP methods
    },
    });

    io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('set_username', (username) => {
    socket.username = username;
    console.log(`${username} joined the chat`);
  });

  socket.on('send_message', (data) => {
    const messageData = {
      id: socket.id,
      username: socket.username || 'Anonymous',
      message: data.message,
    };
    io.emit('receive_message', messageData);
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

server.listen(3000, () => {
  console.log('Socket.IO server running');
});
// this should work fine