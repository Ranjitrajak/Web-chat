const {User} = require('../models/userModel');
const { Message } = require('../models/messageModel');

const onlineUsers = new Map();

const socketHandler = (io) => {
  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    socket.on('login', async (userId) => {
      try {
        await User.findByIdAndUpdate(userId, { isOnline: true });
        onlineUsers.set(userId, socket.id);
        socket.broadcast.emit('userStatus', { userId, isOnline: true });
      } catch (err) {
        console.error('Login error:', err);
      }
    });

    socket.on('sendMessage', async (data) => {
      try {
        const { senderId, receiverId, content } = data;
        const newMessage = new Message({ sender: senderId, receiver: receiverId, content, timestamp: new Date() });
        await newMessage.save();

        const receiverSocketId = onlineUsers.get(receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('receiveMessage', {
            _id: newMessage._id,
            sender: senderId,
            content,
            timestamp: newMessage.timestamp
          });
        }
      } catch (err) {
        console.error('Message sending error:', err);
      }
    });

    socket.on('typing', ({ userId, receiverId, isTyping }) => {
      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('userTyping', { userId, isTyping });
      }
    });

    socket.on('disconnect', async () => {
      let disconnectedUserId = null;
      for (const [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          disconnectedUserId = userId;
          break;
        }
      }

      if (disconnectedUserId) {
        await User.findByIdAndUpdate(disconnectedUserId, { isOnline: false });
        onlineUsers.delete(disconnectedUserId);
        socket.broadcast.emit('userStatus', { userId: disconnectedUserId, isOnline: false });
      }
    });
  });
};

module.exports = socketHandler;
