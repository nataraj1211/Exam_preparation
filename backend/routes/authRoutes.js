import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../database/db.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'studymate_super_secret_jwt_key_2026_exam_prep';

// Sign Up
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, target_exam, college_name, department, phone } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = db.findOne('users', u => u.email === cleanEmail);
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists. Please log in.' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);
    const now = new Date().toISOString();

    const newUser = {
      id: `usr_${uuidv4().slice(0, 8)}`,
      name: name.trim(),
      email: cleanEmail,
      password_hash,
      target_exam: target_exam ? target_exam.trim() : 'Semester Examination',
      college_name: college_name ? college_name.trim() : '',
      department: department ? department.trim() : '',
      phone: phone ? phone.trim() : '',
      login_count: 1,
      last_login_at: now,
      created_at: now
    };

    db.insert('users', newUser);

    // Save login log activity
    db.insert('login_logs', {
      id: `log_${uuidv4().slice(0, 8)}`,
      user_id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      type: 'registration_login',
      login_at: now,
      ip: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1',
      user_agent: req.headers['user-agent'] || 'Browser'
    });

    const token = jwt.sign({ id: newUser.id, email: newUser.email }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: 'Account created successfully! Student data stored.',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        target_exam: newUser.target_exam,
        college_name: newUser.college_name,
        department: newUser.department,
        phone: newUser.phone,
        login_count: newUser.login_count,
        last_login_at: newUser.last_login_at,
        created_at: newUser.created_at
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Server error during registration.' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = db.findOne('users', u => u.email === cleanEmail);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const now = new Date().toISOString();
    const loginCount = (user.login_count || 0) + 1;

    // Update user record with last login timestamp and count
    db.update('users', u => u.id === user.id, {
      last_login_at: now,
      login_count: loginCount
    });

    // Record login audit log
    db.insert('login_logs', {
      id: `log_${uuidv4().slice(0, 8)}`,
      user_id: user.id,
      email: user.email,
      name: user.name,
      type: 'user_login',
      login_at: now,
      ip: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1',
      user_agent: req.headers['user-agent'] || 'Browser'
    });

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      message: 'Login successful! Data saved.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        target_exam: user.target_exam,
        college_name: user.college_name || '',
        department: user.department || '',
        phone: user.phone || '',
        login_count: loginCount,
        last_login_at: now,
        created_at: user.created_at
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login.' });
  }
});

// One-click Demo Student Login
router.post('/demo', (req, res) => {
  try {
    const demoUser = db.findOne('users', u => u.email === 'student@studymate.ai');
    if (!demoUser) {
      return res.status(404).json({ error: 'Demo account not initialized.' });
    }

    const now = new Date().toISOString();
    const loginCount = (demoUser.login_count || 0) + 1;
    db.update('users', u => u.id === demoUser.id, {
      last_login_at: now,
      login_count: loginCount
    });

    db.insert('login_logs', {
      id: `log_${uuidv4().slice(0, 8)}`,
      user_id: demoUser.id,
      email: demoUser.email,
      name: demoUser.name,
      type: 'demo_login',
      login_at: now,
      ip: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1',
      user_agent: req.headers['user-agent'] || 'Browser'
    });

    const token = jwt.sign({ id: demoUser.id, email: demoUser.email }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      message: 'Logged in as Demo Student',
      token,
      user: {
        id: demoUser.id,
        name: demoUser.name,
        email: demoUser.email,
        target_exam: demoUser.target_exam,
        college_name: demoUser.college_name || 'Anna University / Tech Campus',
        department: demoUser.department || 'MCA (Computer Applications)',
        phone: demoUser.phone || '',
        login_count: loginCount,
        last_login_at: now,
        created_at: demoUser.created_at
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to authenticate demo user.' });
  }
});

// Current User Profile
router.get('/me', authenticate, (req, res) => {
  const user = db.findOne('users', u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      target_exam: user.target_exam || 'MCA / Semester Exams',
      college_name: user.college_name || '',
      department: user.department || '',
      phone: user.phone || '',
      login_count: user.login_count || 1,
      last_login_at: user.last_login_at || user.created_at,
      created_at: user.created_at
    }
  });
});

// Update User Profile (Stores data permanently in database)
router.put('/profile', authenticate, async (req, res) => {
  try {
    const { name, target_exam, college_name, department, phone } = req.body;
    const user = db.findOne('users', u => u.id === req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const updates = {};
    if (name !== undefined) updates.name = name.trim();
    if (target_exam !== undefined) updates.target_exam = target_exam.trim();
    if (college_name !== undefined) updates.college_name = college_name.trim();
    if (department !== undefined) updates.department = department.trim();
    if (phone !== undefined) updates.phone = phone.trim();
    updates.updated_at = new Date().toISOString();

    const updatedUser = db.update('users', u => u.id === req.user.id, updates);

    res.json({
      message: 'Student profile updated and saved to database successfully!',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        target_exam: updatedUser.target_exam,
        college_name: updatedUser.college_name || '',
        department: updatedUser.department || '',
        phone: updatedUser.phone || '',
        login_count: updatedUser.login_count || 1,
        last_login_at: updatedUser.last_login_at,
        created_at: updatedUser.created_at
      }
    });
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ error: 'Failed to update profile in database.' });
  }
});

// Get User Login Activity Logs
router.get('/logs', authenticate, (req, res) => {
  try {
    const logs = db.find('login_logs', l => l.user_id === req.user.id)
      .sort((a, b) => new Date(b.login_at) - new Date(a.login_at))
      .slice(0, 10);
    res.json({ logs });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve login activity.' });
  }
});

export default router;
