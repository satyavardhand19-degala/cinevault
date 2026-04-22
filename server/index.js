require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const connectDB = require('./config/db');

// Connect to Database
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: (origin, callback) => {
    const allowed = (process.env.CORS_ORIGIN || '').split(',').map(s => s.trim()).filter(Boolean);
    const isLocalhost = /^http:\/\/localhost:\d+$/.test(origin || '');
    const isAllowed = !origin || isLocalhost || allowed.includes(origin);
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      frameSrc: ["'self'", "https://www.youtube-nocookie.com", "https://www.youtube.com"],
      imgSrc: ["'self'", "data:", "blob:", "http://localhost:5000", "https://image.tmdb.org", "https://*.tmdb.org", "https://placehold.co", "https://*.placehold.co"],
      mediaSrc: ["'self'", "http://localhost:5000"],
      scriptSrc: ["'self'"]
    }
  }
}));
app.use(morgan('dev'));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.get('/', (req, res) => {
  res.send('CineVault API is running...');
});

// Import Routes
const movieRoutes = require('./routes/movieRoutes');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');

app.use('/api/movies', movieRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

// Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
