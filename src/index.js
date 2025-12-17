require('dotenv').config();

// Core Modules
const path = require('path');

// NPM Packages
const express = require('express');

// Local Modules: Config
const connectDatabase = require('./config/database');

// Local Modules: Middleware
const sessionMiddleware = require('./middleware/session');
const { createGetCurrentUserMiddleware } = require('./middleware/auth');
const createImageAccessMiddleware = require('./middleware/imageAccess');
const { upload, generalUpload, uploadsDir } = require('./middleware/upload');

// Local Modules: Routes
const createMainRoutes = require('./routes/main');
const createAuthRoutes = require('./routes/auth');
const createMessageRoutes = require('./routes/messages');
const createCommentRoutes = require('./routes/comments');
const createUploadRoutes = require('./routes/upload');


// ==================== Initialization ====================
const app = express();
const port = 1989;
const db = connectDatabase(uploadsDir);


// ==================== App Configuration ====================
// Set server timeout for large file uploads
app.use((req, res, next) => {
  req.setTimeout(300000); // 5 minutes
  res.setTimeout(300000); // 5 minutes
  next();
});

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'views'));


// ==================== Middleware ====================
// Static assets
app.use(express.static(path.join(__dirname, '..', 'public')));


// Parsers
app.use(express.json());

// Session and Auth
app.use(sessionMiddleware);
app.use(createGetCurrentUserMiddleware(db));

// Custom Middleware
app.use('/uploads/:filename', createImageAccessMiddleware(db));
// Static file serving for uploads (after permission check)
app.use('/uploads', express.static(uploadsDir));


// ==================== Routes ====================
// Main route
app.use('/', createMainRoutes(db));

// API routes
const authRoutes = createAuthRoutes(db);
const messageRoutes = createMessageRoutes(db, uploadsDir);
const commentRoutes = createCommentRoutes(db);
const uploadRoutes = createUploadRoutes(upload, generalUpload, uploadsDir);

app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api', uploadRoutes); // Must be after other /api routes


// ==================== Server Start ====================
const server = app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

server.setTimeout(300000); // 5 minutes