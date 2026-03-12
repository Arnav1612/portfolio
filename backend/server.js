const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// ── MIDDLEWARE ──
app.use(express.json());
app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || '*',
  methods: ['GET', 'POST'],
}));

// Rate limit: max 5 messages per IP per 15 minutes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { success: false, message: 'Too many requests. Please try again later.' }
});
app.use('/api/contact', limiter);

// ── MONGO CONNECTION ──
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Atlas connected'))
  .catch(err => { console.error('❌ MongoDB connection error:', err); process.exit(1); });

// ── SCHEMA ──
const messageSchema = new mongoose.Schema({
  name:      { type: String, required: true, trim: true, maxlength: 100 },
  email:     { type: String, required: true, trim: true, lowercase: true, maxlength: 200 },
  subject:   { type: String, trim: true, maxlength: 200, default: '' },
  message:   { type: String, required: true, trim: true, maxlength: 2000 },
  ip:        { type: String },
  createdAt: { type: Date, default: Date.now }
});

const Message = mongoose.model('Message', messageSchema);

// ── ROUTES ──

// POST /api/contact — save a message
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: 'Name, email, and message are required.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email address.' });
    }

    const newMsg = new Message({
      name:    name.trim().substring(0, 100),
      email:   email.trim().substring(0, 200),
      subject: (subject || '').trim().substring(0, 200),
      message: message.trim().substring(0, 2000),
      ip:      req.ip
    });

    await newMsg.save();

    console.log(`📨 New message from ${name} <${email}>`);
    return res.status(201).json({ success: true, message: 'Message received! I\'ll get back to you soon.' });

  } catch (err) {
    console.error('Error saving message:', err);
    return res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
});

// GET /api/messages — view all messages (protect with token in production)
app.get('/api/messages', async (req, res) => {
  const token = req.headers['x-admin-token'];
  if (!token || token !== process.env.ADMIN_TOKEN) {
    return res.status(401).json({ success: false, message: 'Unauthorized.' });
  }
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    return res.json({ success: true, count: messages.length, data: messages });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// DELETE /api/messages/:id — delete a message
app.delete('/api/messages/:id', async (req, res) => {
  const token = req.headers['x-admin-token'];
  if (!token || token !== process.env.ADMIN_TOKEN) {
    return res.status(401).json({ success: false, message: 'Unauthorized.' });
  }
  try {
    await Message.findByIdAndDelete(req.params.id);
    return res.json({ success: true, message: 'Deleted.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// ── START ──
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
