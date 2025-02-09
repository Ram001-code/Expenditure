// backend/server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const path = require('path');
const sequelize = require('./config/database');
const authRoutes = require('./routes/auth');

const app = express();

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Use CORS middleware to allow cross-origin requests
app.use(cors());

// Middleware to parse JSON bodies
app.use(express.json());

// Test database connection and sync models without data loss
sequelize
  .authenticate()
  .then(() => console.log('✅ MySQL connection established successfully.'))
  .catch((err) => console.error('❌ Unable to connect to the database:', err));

sequelize.sync({ alter: true }).then(() => {
  console.log('✅ Database schema updated (without data loss).');
});

// Mount the authentication routes (all under /api/auth)
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server started on port ${PORT}`);
});
