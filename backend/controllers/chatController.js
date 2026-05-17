const Chat = require('../models/Chat');
const User = require('../models/User');
const path = require('path');
const fs = require('fs');

// Get user's chats
exports.getUserChats = async (req, res) => {
  try {
    const userId = req.user._id.toString();

    const chats = await Chat.find({ participants: userId })
      .populate('participants', 'name email role')
      .populate('messages.sender', 'name role avatar')
      .sort({ updatedAt: -1 });

    // compute unread counts per chat for this user
    const mapped = chats.map((c) => {
      const obj = c.toObject();
      const unreadCount = (c.messages || []).reduce((acc, m) => {
        const senderId = String(m.sender);
        const readBy = (m.readBy || []).map((id) => String(id));
        if (senderId !== userId && !readBy.includes(userId)) return acc + 1;
        return acc;
      }, 0);
      obj.unreadCount = unreadCount;
      return obj;
    });

    res.json(mapped);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a specific chat
exports.getChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user._id.toString();

    const chat = await Chat.findById(chatId)
      .populate('participants', 'name email role')
      .populate('messages.sender', 'name role avatar');

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Check if user is a participant
    if (!chat.participants.some((p) => p._id.toString() === userId)) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // compute unread count for this chat
    const unreadCount = (chat.messages || []).reduce((acc, m) => {
      const senderId = String(m.sender);
      const readBy = (m.readBy || []).map((id) => String(id));
      if (senderId !== userId && !readBy.includes(userId)) return acc + 1;
      return acc;
    }, 0);

    const obj = chat.toObject();
    obj.unreadCount = unreadCount;
    res.json(obj);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create or get chat between two users
exports.getOrCreateChat = async (req, res) => {
  try {
    const { otherUserId } = req.body;
    const userId = req.user._id.toString();

    if (!otherUserId) {
      return res.status(400).json({ message: 'otherUserId is required' });
    }

      // Atomically find or create a chat between the two users to avoid duplicates
      const query = { participants: { $all: [userId, otherUserId] } };
      const update = { $setOnInsert: { participants: [userId, otherUserId], messages: [] } };
      const options = { new: true, upsert: true };

      let chat = await Chat.findOneAndUpdate(query, update, options)
        .populate('participants', 'name email role')
        .populate('messages.sender', 'name role avatar');

      const obj = chat.toObject();
      const unreadCount = (chat.messages || []).reduce((acc, m) => {
        const senderId = String(m.sender);
        const readBy = (m.readBy || []).map((id) => String(id));
        if (senderId !== userId && !readBy.includes(userId)) return acc + 1;
        return acc;
      }, 0);
      obj.unreadCount = unreadCount;
      res.json(obj);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get unread counts mapped by other participant id: { otherUserId: count }
exports.getUnreadMap = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const chats = await Chat.find({ participants: userId }).populate('participants', 'name');
    const map = {};
    chats.forEach((c) => {
      const other = c.participants.find((p) => String(p._id) !== userId);
      if (!other) return;
      const count = (c.messages || []).reduce((acc, m) => {
        const senderId = String(m.sender);
        const readBy = (m.readBy || []).map((id) => String(id));
        if (senderId !== userId && !readBy.includes(userId)) return acc + 1;
        return acc;
      }, 0);
      map[String(other._id)] = count;
    });
    res.json(map);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Upload an attachment file and return its URL
exports.uploadAttachment = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user._id.toString();

    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    // ensure chat exists and user is participant
    const chat = await Chat.findById(chatId).populate('participants', '_id');
    if (!chat) return res.status(404).json({ message: 'Chat not found' });
    if (!chat.participants.some((p) => String(p._id) === userId)) return res.status(403).json({ message: 'Unauthorized' });

    // return file URL relative to server
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({ url: fileUrl, filename: req.file.originalname, mimetype: req.file.mimetype });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
