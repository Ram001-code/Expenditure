// backend/routes/auth.js
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const validator = require('validator');
const nodemailer = require('nodemailer');
const multer = require('multer');
const path = require('path');
const User = require('../models/User'); // Ensure your User model includes a "verified" field (and optionally "profilePic" and "name")
require('dotenv').config();

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET; 
const EMAIL_SECRET = process.env.EMAIL_SECRET || 'emailSecretKey';
const APP_BASE_URL = process.env.APP_BASE_URL || 'http://localhost:6969';

// ----------------------------
// Multer Setup for File Uploads
// ----------------------------
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    // Use the user's id from req.user (set by the authenticateToken middleware)
    cb(null, `profile-${req.user.id}${path.extname(file.originalname)}`);
  },
});
const upload = multer({ storage });

// ----------------------------
// Configure Nodemailer for Zoho Mail
// ----------------------------
const transporter = nodemailer.createTransport({
  host: 'smtppro.zoho.in',
  port: 587, // Use 465 for SSL or 587 for TLS
  secure: false, // false for TLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  tls: {
    ciphers: 'SSLv3',
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.error('SMTP configuration error:', error);
  } else {
    console.log('✅ SMTP is ready to send emails.');
  }
});

// ----------------------------
// Middleware to Authenticate JWT
// ----------------------------
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader)
    return res.status(401).json({ message: 'Unauthorized - Missing Token' });

  const token = authHeader.split(' ')[1];
  if (!token)
    return res.status(401).json({ message: 'Unauthorized - Token Missing' });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error('Token verification failed:', err);
      return res.status(403).json({ message: 'Forbidden - Invalid Token' });
    }
    req.user = decoded;
    console.log('Token verified successfully:', decoded);
    next();
  });
};

// ----------------------------
// Signup with Email Verification
// ----------------------------
router.post('/signup', async (req, res) => {
  const { email, password } = req.body;
  if (!validator.isEmail(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }

  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      email,
      password: hashedPassword,
      verified: false,
      expenditurePlanner: {},
    });

    // Generate a verification token (expires in 1 day)
    const emailToken = jwt.sign({ email: newUser.email }, EMAIL_SECRET, { expiresIn: '1d' });
    // Use backend verification route (returns HTML)
    const url = `${APP_BASE_URL}/api/auth/verify?token=${emailToken}`;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: newUser.email,
      subject: 'Verify your email address',
      html: `<p>Thank you for signing up. Click <a href="${url}">here</a> to verify your email.</p>`,
    });

    res.status(201).json({ message: 'User created. Check your email to verify your account.' });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ----------------------------
// Email Verification (Returns HTML with auto-redirect)
// ----------------------------
router.get('/verify', async (req, res) => {
  const { token } = req.query;
  if (!token)
    return res.status(400).send('<h3>Missing token</h3>');

  try {
    const decoded = jwt.verify(token, EMAIL_SECRET);
    const user = await User.findOne({ where: { email: decoded.email } });
    if (!user)
      return res.status(400).send('<h3>Invalid verification link</h3>');

    if (user.verified) {
      return res.send(`
        <html>
          <head>
            <meta http-equiv="refresh" content="3;url=/login">
            <title>Email Already Verified</title>
            <style>
              body { font-family: Arial, sans-serif; text-align: center; margin: 50px; }
              .container { max-width: 400px; margin: auto; padding: 20px; border-radius: 10px; box-shadow: 0px 0px 10px #ccc; }
              h2 { color: #2ecc71; }
              p { font-size: 18px; }
            </style>
          </head>
          <body>
            <div class="container">
              <h2>Email Already Verified ✅</h2>
              <p>Redirecting you to the Sign In page in 3 seconds...</p>
            </div>
          </body>
        </html>
      `);
    }

    user.verified = true;
    await user.save();

    res.send(`
      <html>
        <head>
          <meta http-equiv="refresh" content="3;url=/login">
          <title>Email Verified</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; margin: 50px; }
            .container { max-width: 400px; margin: auto; padding: 20px; border-radius: 10px; box-shadow: 0px 0px 10px #ccc; }
            h2 { color: #2ecc71; }
            p { font-size: 18px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>Email Verified Successfully ✅</h2>
            <p>Your email has been successfully verified.</p>
            <p>Redirecting you to the Sign In page in 3 seconds...</p>
          </div>
        </body>
      </html>
    `);
  } catch (err) {
    console.error('Verification error:', err);
    res.status(400).send('<h3>Invalid or expired token</h3>');
  }
});

// ----------------------------
// Signin (Checks if Email is Verified)
// ----------------------------
router.post('/signin', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (!user)
      return res.status(400).json({ message: 'User does not exist' });

    if (!user.verified)
      return res.status(400).json({ message: 'Verify your email before signing in.' });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      return res.status(400).json({ message: 'Invalid credentials' });

    const authToken = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token: authToken, message: 'Sign in successful' });
  } catch (err) {
    console.error('Signin error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ----------------------------
// GET User Planner (Authenticated)
// ----------------------------
router.get('/planner', authenticateToken, async (req, res) => {
  try {
    console.log('GET /planner request received');
    const user = await User.findOne({ where: { id: req.user.id } });
    if (!user)
      return res.status(404).json({ message: 'User not found' });

    console.log('Returning user planner data:', user.expenditurePlanner);
    res.json({ expenditurePlanner: user.expenditurePlanner || {} });
  } catch (error) {
    console.error('Error fetching planner data:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ----------------------------
// Update Planner Data (Authenticated)
// ----------------------------
router.put('/planner', authenticateToken, async (req, res) => {
  try {
    console.log('Received planner update request:', req.body);
    const user = await User.findOne({ where: { id: req.user.id } });
    if (!user)
      return res.status(404).json({ message: 'User not found' });

    if (!req.body.expenditurePlanner) {
      return res.status(400).json({ message: 'Missing expenditurePlanner data' });
    }

    console.log('Updating user planner with:', req.body.expenditurePlanner);
    user.expenditurePlanner = req.body.expenditurePlanner;
    await user.save();

    res.status(200).json({ message: 'Planner updated successfully', expenditurePlanner: user.expenditurePlanner });
  } catch (error) {
    console.error('Error updating planner:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ----------------------------
// Update Settings (Profile Info)
// ----------------------------
router.put('/settings', authenticateToken, async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const user = await User.findOne({ where: { id: req.user.id } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (email) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser && existingUser.id !== user.id) {
        return res.status(400).json({ message: 'Email is already in use' });
      }
      user.email = email;
    }

    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    if (name) {
      user.name = name;
    }

    await user.save();
    res.status(200).json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ----------------------------
// Upload Profile Photo (Authenticated)
// ----------------------------
router.post('/uploadProfilePhoto', authenticateToken, upload.single('profilePhoto'), async (req, res) => {
  try {
    if (!req.file) {
      console.error('No file received in request.');
      return res.status(400).json({ message: 'No file uploaded' });
    }
    const user = await User.findOne({ where: { id: req.user.id } });
    if (!user)
      return res.status(404).json({ message: 'User not found' });

    user.profilePic = `/uploads/${req.file.filename}`;
    await user.save();

    console.log('Profile photo updated for user:', req.user.id);
    res.status(200).json({ message: 'Profile photo updated successfully', photoUrl: user.profilePic });
  } catch (error) {
    console.error('Error uploading profile photo:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ----------------------------
// Resend Verification Email
// ----------------------------
router.post('/resend-verification', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.verified) return res.status(400).json({ message: 'User is already verified.' });

    const emailToken = jwt.sign({ email: user.email }, EMAIL_SECRET, { expiresIn: '1d' });
    const url = `${APP_BASE_URL}/api/auth/verify?token=${emailToken}`;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Verify your email address',
      html: `<p>Please click <a href="${url}">here</a> to verify your email address.</p>`,
    });

    res.status(200).json({ message: 'Verification email resent.' });
  } catch (err) {
    console.error('Resend error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
