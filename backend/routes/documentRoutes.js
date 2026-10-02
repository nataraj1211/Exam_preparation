import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../database/db.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { extractTextFromFile } from '../file-processing/extractor.js';
import { aiService } from '../AI/aiService.js';

const router = express.Router();

// Configure Multer storage
const uploadsDir = path.resolve('uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${Date.now()}-${uuidv4().slice(0, 6)}-${safeName}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = ['.pdf', '.docx', '.pptx', '.txt'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file type: ${ext}. Only .pdf, .docx, .pptx, and .txt files are allowed.`), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB max limit
  fileFilter
});

// Upload Study Material
router.post('/upload', authenticate, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please select a file to upload.' });
    }

    const { originalname, filename, size, path: filePath } = req.file;
    const ext = path.extname(originalname).toLowerCase().replace('.', '');
    const subject = req.body.subject || inferSubject(originalname);

    // 1. Text Extraction
    let extractedText = '';
    try {
      extractedText = await extractTextFromFile(filePath, originalname);
    } catch (err) {
      // Clean up failed file
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      return res.status(422).json({ error: err.message || 'Failed to extract text from document.' });
    }

    // 2. Create Document Record
    const docId = `doc_${uuidv4().slice(0, 8)}`;
    const newDoc = {
      id: docId,
      user_id: req.user.id,
      file_name: originalname,
      file_type: ext,
      file_size: size,
      file_url: `/uploads/${filename}`,
      subject,
      extracted_text: extractedText,
      status: 'completed',
      created_at: new Date().toISOString()
    };
    db.insert('documents', newDoc);

    // 3. AI Processing: Generate Summary, Flashcards, and Important Exam Questions
    const summaryData = await aiService.generateSummary(extractedText, originalname);
    const summaryRecord = {
      id: `sum_${uuidv4().slice(0, 8)}`,
      document_id: docId,
      quick_summary: summaryData.quick_summary,
      detailed_summary: summaryData.detailed_summary,
      important_topics: summaryData.important_topics,
      keywords: summaryData.keywords,
      definitions: summaryData.definitions || [],
      formulas: summaryData.formulas || [],
      exam_focus: summaryData.exam_focus || { two_marks: [], five_marks: [], ten_sixteen_marks: [] },
      created_at: new Date().toISOString()
    };
    db.insert('summaries', summaryRecord);

    // 4. Generate Flashcards
    const flashcardsData = await aiService.generateFlashcards(extractedText);
    for (const fc of flashcardsData) {
      db.insert('flashcards', {
        id: `fc_${uuidv4().slice(0, 8)}`,
        document_id: docId,
        front: fc.front,
        back: fc.back,
        topic: fc.topic || subject,
        difficulty: fc.difficulty || 'Medium'
      });
    }

    // 5. Generate Important Questions
    const examQuestionsData = await aiService.generateImportantQuestions(extractedText);
    for (const eq of examQuestionsData) {
      db.insert('exam_questions', {
        id: `eq_${uuidv4().slice(0, 8)}`,
        document_id: docId,
        mark_category: eq.mark_category,
        question: eq.question,
        answer_outline: eq.answer_outline,
        key_points: eq.key_points || []
      });
    }

    res.status(201).json({
      message: 'Document processed successfully!',
      document: newDoc,
      summary: summaryRecord
    });

  } catch (err) {
    console.error('Upload processing error:', err);
    res.status(500).json({ error: err.message || 'Server error while processing uploaded document.' });
  }
});

// Get User's Documents
router.get('/', authenticate, (req, res) => {
  const { q, subject } = req.query;
  let userDocs = db.find('documents', d => d.user_id === req.user.id);

  if (q) {
    const search = q.toLowerCase();
    userDocs = userDocs.filter(d => 
      d.file_name.toLowerCase().includes(search) || 
      d.subject.toLowerCase().includes(search)
    );
  }

  if (subject && subject !== 'all') {
    userDocs = userDocs.filter(d => d.subject.toLowerCase() === subject.toLowerCase());
  }

  // Sort latest first
  userDocs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  // Attach summaries summary stats
  const docsWithStats = userDocs.map(d => {
    const summary = db.findOne('summaries', s => s.document_id === d.id);
    const flashcardCount = db.find('flashcards', f => f.document_id === d.id).length;
    const quizCount = db.find('quizzes', q => q.document_id === d.id).length;
    return {
      ...d,
      extracted_text: undefined, // Don't return huge text in list view
      has_summary: Boolean(summary),
      quick_summary: summary?.quick_summary || '',
      topics_count: summary?.important_topics?.length || 0,
      flashcard_count: flashcardCount,
      quiz_count: quizCount
    };
  });

  res.json({ documents: docsWithStats });
});

// Get Single Document with all AI generated material
router.get('/:id', authenticate, (req, res) => {
  const doc = db.findOne('documents', d => d.id === req.params.id && d.user_id === req.user.id);
  if (!doc) {
    return res.status(404).json({ error: 'Document not found or unauthorized access.' });
  }

  const summary = db.findOne('summaries', s => s.document_id === doc.id);
  const flashcards = db.find('flashcards', f => f.document_id === doc.id);
  const examQuestions = db.find('exam_questions', e => e.document_id === doc.id);
  const quizzes = db.find('quizzes', q => q.document_id === doc.id);

  res.json({
    document: doc,
    summary,
    flashcards,
    exam_questions: examQuestions,
    recent_quizzes: quizzes
  });
});

// Delete Document
router.delete('/:id', authenticate, (req, res) => {
  const doc = db.findOne('documents', d => d.id === req.params.id && d.user_id === req.user.id);
  if (!doc) {
    return res.status(404).json({ error: 'Document not found or unauthorized access.' });
  }

  // Remove related data
  db.remove('documents', d => d.id === doc.id);
  db.remove('summaries', s => s.document_id === doc.id);
  db.remove('flashcards', f => f.document_id === doc.id);
  db.remove('exam_questions', e => e.document_id === doc.id);
  db.remove('chat_messages', c => c.document_id === doc.id);
  
  // Find quizzes to remove their questions & answers
  const userQuizzes = db.find('quizzes', q => q.document_id === doc.id);
  for (const q of userQuizzes) {
    db.remove('questions', item => item.quiz_id === q.id);
    db.remove('quiz_answers', item => item.quiz_id === q.id);
  }
  db.remove('quizzes', q => q.document_id === doc.id);

  res.json({ message: 'Document and all associated study materials deleted successfully.' });
});

function inferSubject(fileName) {
  const lower = fileName.toLowerCase();
  if (lower.includes('os') || lower.includes('operating')) return 'Operating Systems';
  if (lower.includes('dbms') || lower.includes('database') || lower.includes('sql')) return 'Database Systems';
  if (lower.includes('network') || lower.includes('cn') || lower.includes('tcp')) return 'Computer Networks';
  if (lower.includes('python') || lower.includes('py')) return 'Python Programming';
  if (lower.includes('java') || lower.includes('oops')) return 'Java & OOP';
  if (lower.includes('ai') || lower.includes('ml') || lower.includes('machine')) return 'Artificial Intelligence';
  if (lower.includes('algo') || lower.includes('dsa') || lower.includes('structure')) return 'Data Structures & Algorithms';
  return 'Computer Science';
}

export default router;
