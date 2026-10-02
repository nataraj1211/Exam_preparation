import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../database/db.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { aiService } from '../AI/aiService.js';

const router = express.Router();

// Get Chat History for a Document
router.get('/:documentId', authenticate, (req, res) => {
  const { documentId } = req.params;
  
  const doc = db.findOne('documents', d => d.id === documentId && d.user_id === req.user.id);
  if (!doc) {
    return res.status(404).json({ error: 'Document not found.' });
  }

  const messages = db.find('chat_messages', m => m.document_id === documentId && m.user_id === req.user.id);
  messages.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

  res.json({
    document_name: doc.file_name,
    messages,
    suggested_questions: [
      'Explain this topic simply',
      'Give an example',
      'Explain for 2 marks',
      'Explain for 16 marks',
      'What are the important points for exams?'
    ]
  });
});

// Send Doubt / Message to Chatbot
router.post('/:documentId', authenticate, async (req, res) => {
  try {
    const { documentId } = req.params;
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Question message cannot be empty.' });
    }

    const doc = db.findOne('documents', d => d.id === documentId && d.user_id === req.user.id);
    if (!doc) {
      return res.status(404).json({ error: 'Document not found.' });
    }

    // 1. Record User Message
    const userMsg = {
      id: `msg_${uuidv4().slice(0, 8)}`,
      document_id: documentId,
      user_id: req.user.id,
      role: 'user',
      message: message.trim(),
      citations: [],
      created_at: new Date().toISOString()
    };
    db.insert('chat_messages', userMsg);

    // 2. Fetch recent conversation context
    const previousMessages = db.find('chat_messages', m => m.document_id === documentId && m.user_id === req.user.id)
      .slice(-6);

    // 3. AI RAG processing
    const aiResponse = await aiService.askDoubt(
      doc.extracted_text,
      previousMessages,
      message.trim()
    );

    // 4. Record AI Message
    const botMsg = {
      id: `msg_${uuidv4().slice(0, 8)}`,
      document_id: documentId,
      user_id: req.user.id,
      role: 'assistant',
      message: aiResponse.message,
      citations: aiResponse.citations || [],
      created_at: new Date().toISOString()
    };
    db.insert('chat_messages', botMsg);

    res.status(201).json({
      user_message: userMsg,
      ai_message: botMsg
    });
  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({ error: 'Failed to process doubt with AI.' });
  }
});

// Clear Chat for a Document
router.delete('/:documentId/clear', authenticate, (req, res) => {
  const { documentId } = req.params;
  
  db.remove('chat_messages', m => m.document_id === documentId && m.user_id === req.user.id);

  res.json({ message: 'Chat history cleared successfully.' });
});

export default router;
