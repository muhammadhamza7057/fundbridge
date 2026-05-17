const Chat = require('../models/Chat');
const User = require('../models/User');

// Map to store active users: { userId: { socketId, name, role } }
const activeUsers = new Map();
// Map to store active chat rooms: { chatId: Set of socketIds }
const chatRooms = new Map();
// Map to store typing users: { chatId: Set of userIds }
const typingUsers = new Map();

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // User joins (identifies themselves)
    socket.on('user:join', async (userId, userName, role) => {
      try {
        activeUsers.set(userId, {
          socketId: socket.id,
          name: userName,
          role,
        });
        socket.userId = userId;

        // Broadcast online users list to everyone
        const onlineUsers = Array.from(activeUsers.entries()).map(([id, data]) => ({
          userId: id,
          name: data.name,
          role: data.role,
        }));
        io.emit('users:online', onlineUsers);

        console.log(`User ${userId} joined. Active users: ${activeUsers.size}`);
      } catch (error) {
        console.error('Error on user:join', error);
      }
    });

    // Join a chat room
    socket.on('chat:join', async (chatId) => {
      const performJoin = async () => {
        try {
          socket.join(chatId);
          if (!chatRooms.has(chatId)) {
            chatRooms.set(chatId, new Set());
          }
          chatRooms.get(chatId).add(socket.id);

          // Load and send message history
          const chat = await Chat.findById(chatId)
            .populate('participants', 'name email role avatar')
            .populate('messages.sender', 'name role avatar');

          if (!chat) {
            socket.emit('chat:error', 'Chat not found');
            return;
          }

          socket.emit('chat:history', {
            chatId,
            participants: chat.participants,
            messages: chat.messages || [],
          });

          // Mark messages as read by this user (for unread counts)
          try {
            const userId = socket.userId;
            let updated = false;
            chat.messages.forEach((m) => {
              const mReadBy = m.readBy || [];
              if (String(m.sender) !== String(userId) && !mReadBy.some((id) => String(id) === String(userId))) {
                m.readBy = mReadBy.concat([userId]);
                updated = true;
              }
            });
            if (updated) {
              await chat.save();
              io.to(chatId).emit('chat:read', { chatId, userId });
            }
          } catch (err) {
            console.error('Error marking chat read on join', err);
          }

          console.log(`User ${socket.userId} joined chat room: ${chatId}`);
        } catch (error) {
          console.error('Error on chat:join', error);
          socket.emit('chat:error', error.message);
        }
      };

      // If socket has no userId yet, wait for identification to avoid 'undefined'
      if (!socket.userId) {
        console.log(`chat:join received for ${chatId} but user not identified yet, waiting for user:join`);
        socket.once('user:join', () => {
          performJoin();
        });
        return;
      }

      // Otherwise perform join immediately
      performJoin();
    });

    // Send message
    socket.on('message:send', async (data) => {
      try {
        const { chatId, content, senderId } = data;

        if (!chatId || !senderId) {
          socket.emit('chat:error', 'Missing required fields');
          return;
        }

        // allow messages that have either content or attachments
        const hasContent = typeof content === 'string' && content.trim().length > 0;
        const hasAttachments = Array.isArray(data.attachments) && data.attachments.length > 0;
        if (!hasContent && !hasAttachments) {
          socket.emit('chat:error', 'Message must have content or attachments');
          return;
        }

        // Get sender details
        const sender = await User.findById(senderId).select('name role avatar');

        // Save message to database
        const chat = await Chat.findById(chatId);
        if (!chat) {
          socket.emit('chat:error', 'Chat not found');
          return;
        }

        const newMessage = {
          sender: senderId,
          content,
          attachments: Array.isArray(data.attachments) ? data.attachments.map((a) => ({ url: a.url, filename: a.filename, mimetype: a.mimetype })) : [],
          readBy: [senderId],
        };

        chat.messages.push(newMessage);
        await chat.save();

        // Emit message to all users in the chat room
        const savedMsg = chat.messages[chat.messages.length - 1];
        const messageData = {
          _id: savedMsg._id,
          sender: { _id: senderId, name: sender.name, role: sender.role, avatar: sender.avatar },
          content: savedMsg.content,
          attachments: savedMsg.attachments || [],
          createdAt: savedMsg.createdAt || new Date(),
        };

        io.to(chatId).emit('message:received', { ...messageData, chatId });

        console.log(`Message sent in chat ${chatId}`);
      } catch (error) {
        console.error('Error on message:send', error);
        socket.emit('chat:error', error.message);
      }
    });

    // Typing indicator
    socket.on('typing:start', (chatId) => {
      try {
        if (!typingUsers.has(chatId)) {
          typingUsers.set(chatId, new Set());
        }
        typingUsers.get(chatId).add(socket.userId);

        socket.to(chatId).emit('typing:indicator', {
          userId: socket.userId,
          userName: activeUsers.get(socket.userId)?.name || 'Unknown',
          isTyping: true,
        });
      } catch (error) {
        console.error('Error on typing:start', error);
      }
    });

    // Stop typing
    socket.on('typing:stop', (chatId) => {
      try {
        if (typingUsers.has(chatId)) {
          typingUsers.get(chatId).delete(socket.userId);
        }

        socket.to(chatId).emit('typing:indicator', {
          userId: socket.userId,
          isTyping: false,
        });
      } catch (error) {
        console.error('Error on typing:stop', error);
      }
    });

    // Disconnect
    socket.on('disconnect', () => {
      try {
        const userId = socket.userId;
        if (userId) {
          activeUsers.delete(userId);

          // Remove user from all chat rooms
          chatRooms.forEach((sockets) => {
            sockets.delete(socket.id);
          });

          // Broadcast updated online users
          const onlineUsers = Array.from(activeUsers.entries()).map(([id, data]) => ({
            userId: id,
            name: data.name,
            role: data.role,
          }));
          io.emit('users:online', onlineUsers);

          console.log(`User ${userId} disconnected. Active users: ${activeUsers.size}`);
        }
      } catch (error) {
        console.error('Error on disconnect', error);
      }
    });
  });
};
