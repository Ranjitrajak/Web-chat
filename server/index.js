const express = require('express');
require('dotenv').config();
const cors = require('cors');
const socketIo = require('socket.io');
const http = require('http');
const routes = require('./routes/routes');
const socketHandler = require('./sockets/socketHandler');
const connectDB = require('./config/database');


const PORT = process.env.PORT || 4000 ;
const app = express();
connectDB();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Middleware
app.use(express.json());
app.use(cors());
 
app.get('/', (req, res) => {
    res.send('Web Chat Server is running');
});
app.use('/api', routes);
socketHandler(io);

server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});