import jwt from 'jsonwebtoken';
import { db } from '../database/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'studymate_super_secret_jwt_key_2026_exam_prep';

export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Authentication token is required.' });
  }

  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;

  // Check demo token bypass
  if (token === 'demo-token-studymate') {
    const demoUser = db.findOne('users', u => u.email === 'student@studymate.ai');
    if (demoUser) {
      req.user = { id: demoUser.id, email: demoUser.email, name: demoUser.name };
      return next();
    }
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = db.findOne('users', u => u.id === decoded.id);
    if (!user) {
      return res.status(401).json({ error: 'User associated with token no longer exists.' });
    }
    req.user = { id: user.id, email: user.email, name: user.name };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired authentication session.' });
  }
}
