const express = require('express');
const MessageRoutes = express.Router();
const Message = require('../models/MessageSchema');
const auth = require('../middleware/auth');

// Get conversation history between two users
MessageRoutes.get('/conversations/:userId', auth, async (req : any, res : any,) => {
  try {
    const currentUserId = req.user.id;
    const otherUserId = req.params.userId;
    
    // Get messages where current user is either sender or receiver
    const messages = await Message.find({
      $or: [
        { sender: currentUserId, receiver: otherUserId },
        { sender: otherUserId, receiver: currentUserId }
      ]
    }).sort({ createdAt: 1 });
    
    // Mark messages as read
    await Message.updateMany(
      { sender: otherUserId, receiver: currentUserId, read: false },
      { $set: { read: true } }
    );
    
    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Get all conversations for current user
MessageRoutes.get('/conversations', auth, async (req: any, res : any,) => {
  try {
    const userId = req.user.id;
    
    // Find all unique conversations
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [{ sender: userId }, { receiver: userId }]
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ["$sender", userId] },
              "$receiver",
              "$sender"
            ]
          },
          lastMessage: { $first: "$$ROOT" }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userDetails'
        }
      }
    ]);
    
    res.json(conversations);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

export default MessageRoutes;