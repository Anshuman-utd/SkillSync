const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST"],
    credentials: true
  }
});

const prisma = new PrismaClient();

// Middleware for authentication
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error("Authentication error: No token provided"));
  }

  jwt.verify(token, process.env.JWT_SECRET || 'secret', (err, decoded) => {
    if (err) {
      return next(new Error("Authentication error: Invalid token"));
    }
    socket.user = decoded;
    next();
  });
});

io.on('connection', (socket) => {
  console.log('User connected (socket.user):', socket.user);
  const currentUserId = socket.user.userId;

  if (!currentUserId) {
    console.error("CRITICAL: User ID not found in token payload!", socket.user);
  }

  // Join Chat Event (By Chat ID)
  socket.on('join-chat', async ({ chatId }) => {
    if (!chatId) return;

    try {
      // Fetch Chat to verify participants
      const chat = await prisma.chat.findUnique({
        where: { id: parseInt(chatId) },
        include: { student: true, mentor: true }
      });

      if (!chat) {
        socket.emit('error', 'Chat not found');
        return;
      }

      // Verify Eligibility
      const userId = currentUserId;
      let isEligible = false;

      // Check if user is the student
      if (chat.student.userId === userId) {
        isEligible = true;
      }

      // Check if user is the mentor
      if (!isEligible && chat.mentor.userId === userId) {
        isEligible = true;
      }

      if (!isEligible) {
        socket.emit('error', 'Unauthorized access to chat');
        return;
      }

      const roomName = `chat-${chat.id}`;
      socket.join(roomName);
      console.log(`User ${userId} joined room ${roomName}`);
      socket.emit('joined-chat', { chatId: chat.id });

    } catch (error) {
      console.error('Error joining chat:', error);
      socket.emit('error', 'Internal server error');
    }
  });

  // Send Message Event
  socket.on('send-message', async ({ chatId, content }) => {
    if (!chatId || !content) return;

    try {
      const chat = await prisma.chat.findUnique({
        where: { id: parseInt(chatId) }
      });

      if (!chat) {
        socket.emit('error', 'Chat not found');
        return;
      }

      // Save to DB
      const newMessage = await prisma.message.create({
        data: {
          content,
          chatId: chat.id,
          senderId: currentUserId
        },
        include: {
          sender: {
            select: { name: true, image: true, role: true }
          }
        }
      });

      // Broadcast to room
      const roomName = `chat-${chat.id}`;
      io.to(roomName).emit('receive-message', {
        id: newMessage.id,
        content: newMessage.content,
        senderId: newMessage.senderId,
        senderName: newMessage.sender.name,
        senderImage: newMessage.sender.image,
        createdAt: newMessage.createdAt,
        chatId: chat.id
      });

      // Update chat updatedAt
      await prisma.chat.update({
        where: { id: chat.id },
        data: { updatedAt: new Date() }
      });

    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('error', 'Failed to send message');
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', currentUserId);
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Socket.IO server running on port ${PORT}`);
});
