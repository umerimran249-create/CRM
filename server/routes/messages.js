const express = require('express');
const { auth, requirePermission } = require('../middleware/auth');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');

const router = express.Router();

async function ensureParticipant(conversationId, userId) {
  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    return { error: 'Conversation not found', status: 404 };
  }
  if (!conversation.participants?.includes(userId)) {
    return { error: 'Forbidden', status: 403 };
  }
  return { conversation };
}

router.get('/conversations', auth, requirePermission('messages.view'), async (req, res) => {
  try {
    const conversations = await Conversation.findByParticipant(req.user._id);
    const participantIds = new Set();
    conversations.forEach((conversation) => {
      conversation.participants?.forEach((id) => participantIds.add(id));
    });

    const participants = await Promise.all(
      Array.from(participantIds).map(async (id) => {
        const user = await User.findById(id);
        if (!user) return null;
        const { password, ...rest } = user;
        return { ...rest };
      })
    );

    const participantMap = {};
    participants
      .filter(Boolean)
      .forEach((participant) => {
        participantMap[participant._id] = {
          id: participant._id,
          name: participant.name,
          email: participant.email,
          role: participant.role,
        };
      });

    const formatted = conversations.map((conversation) => ({
      ...conversation,
      participants: conversation.participants.map((id) => participantMap[id] || { id }),
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/conversations', auth, requirePermission('messages.manage'), async (req, res) => {
  try {
    const { participants = [], name } = req.body;
    const uniqueParticipants = Array.from(new Set([...participants, req.user._id]));

    if (uniqueParticipants.length < 2) {
      return res.status(400).json({ message: 'A conversation needs at least two participants.' });
    }

    const conversation = await Conversation.create({
      name,
      participants: uniqueParticipants,
      createdBy: req.user._id,
    });

    res.status(201).json(conversation);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get(
  '/conversations/:id/messages',
  auth,
  requirePermission('messages.view'),
  async (req, res) => {
    try {
      const { conversation, error, status } = await ensureParticipant(
        req.params.id,
        req.user._id
      );
      if (error) {
        return res.status(status).json({ message: error });
      }

      const messages = await Message.list(conversation._id);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

router.post(
  '/conversations/:id/messages',
  auth,
  requirePermission('messages.manage'),
  async (req, res) => {
    try {
      const { content, attachments } = req.body;
      if (!content && (!attachments || !attachments.length)) {
        return res.status(400).json({ message: 'Message content is required.' });
      }

      const { conversation, error, status } = await ensureParticipant(
        req.params.id,
        req.user._id
      );
      if (error) {
        return res.status(status).json({ message: error });
      }

      const message = await Message.create(conversation._id, {
        content,
        attachments,
        sender: req.user._id,
      });

      await Conversation.updateLastMessage(conversation._id, {
        content,
        sender: req.user._id,
        timestamp: message.createdAt,
      });

      res.status(201).json(message);
    } catch (error) {
      console.error('Error creating message:', error);
      res.status(500).json({ message: error.message || 'Failed to create message' });
    }
  }
);

module.exports = router;

