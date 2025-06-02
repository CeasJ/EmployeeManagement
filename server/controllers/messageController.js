const db = require('../config/firebase');
const { v4: uuidv4 } = require('uuid');

const getConversations = async (req, res) => {
  const userId = req.user.id;

  try {
    const snapshot = await db.collection('Conversations')
      .where('participants', 'array-contains', userId)
      .orderBy('updatedAt', 'desc')
      .get();

    const conversations = await Promise.all(snapshot.docs.map(async (doc) => {
      const data = doc.data();
      const participants = await Promise.all(data.participants.map(async (id) => {
        const userDoc = await db.collection('Users').doc(id).get();
        return userDoc.exists ? { id, name: userDoc.data().name } : null;
      }));

      const messagesSnapshot = await db.collection('Conversations')
        .doc(doc.id)
        .collection('Messages')
        .orderBy('timestamp', 'asc')
        .get();

      const messages = messagesSnapshot.docs.map(msgDoc => msgDoc.data());

      return {
        id: doc.id,
        participants: participants.filter(p => p),
        lastMessage: data.lastMessage,
        messages
      };
    }));

    res.json({ conversations });
  } catch (error) {
    console.error('Error in getConversations:', error.message);
    res.status(500).json({ error: 'Failed to fetch conversations: ' + error.message });
  }
};

const createConversation = async (req, res) => {
  const { receiverId } = req.body;
  const userId = req.user.id;

  if (!receiverId) {
    return res.status(400).json({ error: 'receiverId is required' });
  }

  try {
    const receiverDoc = await db.collection('Users').doc(receiverId).get();
    if (!receiverDoc.exists || receiverDoc.data().status !== 'Active') {
      return res.status(404).json({ error: 'Receiver not found or not active' });
    }

    const existingConversation = await db.collection('Conversations')
      .where('participants', 'array-contains', userId)
      .get();

    const conversation = existingConversation.docs.find(doc => {
      const participants = doc.data().participants;
      return participants.includes(userId) && participants.includes(receiverId) && participants.length === 2;
    });

    if (conversation) {
      return res.json({ conversationId: conversation.id });
    }

    const conversationId = uuidv4();
    const conversationData = {
      conversationId,
      participants: [userId, receiverId],
      lastMessage: '',
      updatedAt: new Date().toISOString()
    };

    await db.collection('Conversations').doc(conversationId).set(conversationData);
    res.json({ conversationId });
  } catch (error) {
    console.error('Error in createConversation:', error.message);
    res.status(500).json({ error: 'Failed to create conversation: ' + error.message });
  }
};

module.exports = { getConversations, createConversation };