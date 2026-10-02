import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../database/db.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { aiService } from '../AI/aiService.js';

const router = express.Router();

// Generate New Quiz
router.post('/generate', authenticate, async (req, res) => {
  try {
    const { document_id, count = 10, difficulty = 'Medium', topic = 'Entire document' } = req.body;
    
    if (!document_id) {
      return res.status(400).json({ error: 'Document ID is required.' });
    }

    const doc = db.findOne('documents', d => d.id === document_id && d.user_id === req.user.id);
    if (!doc) {
      return res.status(404).json({ error: 'Document not found.' });
    }

    const questionCount = parseInt(count, 10) || 10;
    const generatedQuestions = await aiService.generateMCQs(
      doc.extracted_text,
      questionCount,
      difficulty,
      topic
    );

    const quizId = `quiz_${uuidv4().slice(0, 8)}`;
    const newQuiz = {
      id: quizId,
      user_id: req.user.id,
      document_id: doc.id,
      topic: topic === 'Entire document' ? doc.subject || doc.file_name : topic,
      difficulty,
      question_count: generatedQuestions.length,
      score: 0,
      percentage: 0,
      correct_count: 0,
      wrong_count: 0,
      skipped_count: generatedQuestions.length,
      time_taken_seconds: 0,
      status: 'in_progress',
      created_at: new Date().toISOString()
    };
    db.insert('quizzes', newQuiz);

    // Save individual questions
    const savedQuestions = [];
    for (const q of generatedQuestions) {
      const qRecord = {
        id: `q_${uuidv4().slice(0, 8)}`,
        quiz_id: quizId,
        question: q.question,
        option_a: q.option_a,
        option_b: q.option_b,
        option_c: q.option_c,
        option_d: q.option_d,
        correct_answer: q.correct_answer,
        explanation: q.explanation
      };
      db.insert('questions', qRecord);
      savedQuestions.push(qRecord);
    }

    res.status(201).json({
      message: 'MCQ Quiz generated successfully!',
      quiz: newQuiz,
      questions: savedQuestions
    });
  } catch (err) {
    console.error('Quiz generation error:', err);
    res.status(500).json({ error: 'Failed to generate MCQs.' });
  }
});

// Get Quiz by ID
router.get('/:id', authenticate, (req, res) => {
  const quiz = db.findOne('quizzes', q => q.id === req.params.id && q.user_id === req.user.id);
  if (!quiz) {
    return res.status(404).json({ error: 'Quiz not found.' });
  }

  const doc = db.findOne('documents', d => d.id === quiz.document_id);
  const questions = db.find('questions', q => q.quiz_id === quiz.id);
  const answers = db.find('quiz_answers', a => a.quiz_id === quiz.id);

  res.json({
    quiz,
    document_name: doc?.file_name || 'Study Material',
    questions,
    answers
  });
});

// Instant Answer Validation & Record
router.post('/:id/answer', authenticate, (req, res) => {
  try {
    const { question_id, selected_answer, is_marked_for_review } = req.body;
    const quizId = req.params.id;

    const quiz = db.findOne('quizzes', q => q.id === quizId && q.user_id === req.user.id);
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found.' });
    }

    const question = db.findOne('questions', q => q.id === question_id && q.quiz_id === quizId);
    if (!question) {
      return res.status(404).json({ error: 'Question not found in this quiz.' });
    }

    const isCorrect = selected_answer ? (selected_answer.toUpperCase() === question.correct_answer.toUpperCase()) : false;

    // Check if answer already exists
    const existing = db.findOne('quiz_answers', a => a.quiz_id === quizId && a.question_id === question_id);
    let recordedAnswer;

    if (existing) {
      recordedAnswer = db.update(
        'quiz_answers',
        a => a.id === existing.id,
        {
          selected_answer,
          is_correct: isCorrect,
          is_marked_for_review: Boolean(is_marked_for_review)
        }
      );
    } else {
      recordedAnswer = db.insert('quiz_answers', {
        id: `ans_${uuidv4().slice(0, 8)}`,
        quiz_id: quizId,
        question_id,
        selected_answer,
        is_correct: isCorrect,
        is_marked_for_review: Boolean(is_marked_for_review)
      });
    }

    res.json({
      answer: recordedAnswer,
      is_correct: isCorrect,
      correct_answer: question.correct_answer,
      explanation: question.explanation
    });
  } catch (err) {
    console.error('Answer recording error:', err);
    res.status(500).json({ error: 'Failed to record answer.' });
  }
});

// Submit Quiz and Finalize Results
router.post('/:id/submit', authenticate, (req, res) => {
  try {
    const quizId = req.params.id;
    const { time_taken_seconds } = req.body;

    const quiz = db.findOne('quizzes', q => q.id === quizId && q.user_id === req.user.id);
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found.' });
    }

    const questions = db.find('questions', q => q.quiz_id === quizId);
    const answers = db.find('quiz_answers', a => a.quiz_id === quizId);

    let correctCount = 0;
    let wrongCount = 0;
    let skippedCount = 0;

    for (const q of questions) {
      const userAns = answers.find(a => a.question_id === q.id);
      if (!userAns || !userAns.selected_answer) {
        skippedCount++;
      } else if (userAns.is_correct) {
        correctCount++;
      } else {
        wrongCount++;
      }
    }

    const total = questions.length || 1;
    const score = correctCount;
    const percentage = Math.round((correctCount / total) * 100);

    const updatedQuiz = db.update(
      'quizzes',
      q => q.id === quizId,
      {
        score,
        percentage,
        correct_count: correctCount,
        wrong_count: wrongCount,
        skipped_count: skippedCount,
        time_taken_seconds: time_taken_seconds || quiz.time_taken_seconds || 120,
        status: 'completed'
      }
    );

    // Full review payload
    const review = questions.map(q => {
      const userAns = answers.find(a => a.question_id === q.id);
      return {
        id: q.id,
        question: q.question,
        option_a: q.option_a,
        option_b: q.option_b,
        option_c: q.option_c,
        option_d: q.option_d,
        correct_answer: q.correct_answer,
        user_answer: userAns?.selected_answer || null,
        is_correct: userAns?.is_correct || false,
        is_skipped: !userAns?.selected_answer,
        explanation: q.explanation
      };
    });

    res.json({
      message: 'Quiz submitted successfully!',
      quiz: updatedQuiz,
      review
    });
  } catch (err) {
    console.error('Quiz submission error:', err);
    res.status(500).json({ error: 'Failed to submit quiz.' });
  }
});

// Retry Quiz (clone questions with fresh attempt)
router.post('/:id/retry', authenticate, (req, res) => {
  try {
    const originalQuiz = db.findOne('quizzes', q => q.id === req.params.id && q.user_id === req.user.id);
    if (!originalQuiz) {
      return res.status(404).json({ error: 'Original quiz not found.' });
    }

    const originalQuestions = db.find('questions', q => q.quiz_id === originalQuiz.id);

    const newQuizId = `quiz_${uuidv4().slice(0, 8)}`;
    const newQuiz = {
      id: newQuizId,
      user_id: req.user.id,
      document_id: originalQuiz.document_id,
      topic: originalQuiz.topic,
      difficulty: originalQuiz.difficulty,
      question_count: originalQuestions.length,
      score: 0,
      percentage: 0,
      correct_count: 0,
      wrong_count: 0,
      skipped_count: originalQuestions.length,
      time_taken_seconds: 0,
      status: 'in_progress',
      created_at: new Date().toISOString()
    };
    db.insert('quizzes', newQuiz);

    const clonedQuestions = [];
    for (const q of originalQuestions) {
      const clonedQ = {
        id: `q_${uuidv4().slice(0, 8)}`,
        quiz_id: newQuizId,
        question: q.question,
        option_a: q.option_a,
        option_b: q.option_b,
        option_c: q.option_c,
        option_d: q.option_d,
        correct_answer: q.correct_answer,
        explanation: q.explanation
      };
      db.insert('questions', clonedQ);
      clonedQuestions.push(clonedQ);
    }

    res.status(201).json({
      message: 'Quiz retry initialized!',
      quiz: newQuiz,
      questions: clonedQuestions
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retry quiz.' });
  }
});

// Get User Quiz History
router.get('/history/all', authenticate, (req, res) => {
  const userQuizzes = db.find('quizzes', q => q.user_id === req.user.id);
  userQuizzes.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const list = userQuizzes.map(q => {
    const doc = db.findOne('documents', d => d.id === q.document_id);
    return {
      ...q,
      document_name: doc?.file_name || 'Study Document',
      subject: doc?.subject || 'Computer Science'
    };
  });

  res.json({ quizzes: list });
});

export default router;
