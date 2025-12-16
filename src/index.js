const express = require('express');
const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const bcrypt = require('bcrypt');
const multer = require('multer');

const app = express();
const port = 1989;

// Increase timeout for large file uploads
app.use((req, res, next) => {
  req.setTimeout(300000); // 5 minutes
  res.setTimeout(300000); // 5 minutes
  next();
});

// Password utility functions
const hashPassword = async (password) => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

// File upload configuration
const uploadsDir = path.resolve(__dirname, '..', 'data', 'uploads');

// Ensure uploads directory exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: timestamp_random_originalname
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    const originalName = file.originalname.replace(/[^a-zA-Z0-9.]/g, '_');
    const filename = `${timestamp}_${random}_${originalName}`;
    cb(null, filename);
  }
});

// File filter for any type of files (with size and extension checks elsewhere if needed)
const fileFilter = (req, file, cb) => {
  // Accept all files for now - we'll handle validation in the actual upload endpoint
  cb(null, true);
};

// Multer upload instance
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
    files: 1, // Only one file per request
    fieldSize: 50 * 1024 * 1024 // Increase field size limit for large files
  }
});

// Additional multer instance for files without filtering for the new general upload endpoint
const generalUpload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
    files: 1, // Only one file per request
    fieldSize: 50 * 1024 * 1024 // Increase field size limit for large files
  }
});

// The database file will be created in the /app/data directory inside the container
const dbPath = path.resolve(__dirname, '..', 'data', 'messages.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to the SQLite database.');

    // 初始化数据库表结构
    initializeDatabase();
  }
});

// 初始化数据库表结构和索引
function initializeDatabase() {
  // 创建 messages 表
  db.run(`CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_private INTEGER DEFAULT 0,
    private_key TEXT DEFAULT NULL,
    user_id INTEGER DEFAULT NULL,
    has_image INTEGER DEFAULT 0,
    image_filename TEXT DEFAULT NULL,
    image_mime_type TEXT DEFAULT NULL,
    image_size INTEGER DEFAULT NULL
  )`, (err) => {
    if (err) {
      console.error('Error creating messages table:', err.message);
    } else {
      console.log('Messages table created or already exists.');

      // 确保现有表也有新字段（如果表已存在但缺少字段）
      addMissingColumns();
    }
  });
}

// 添加缺失的列
function addMissingColumns() {
  const alterColumns = [
    { sql: `ALTER TABLE messages ADD COLUMN is_private INTEGER DEFAULT 0`, name: 'is_private' },
    { sql: `ALTER TABLE messages ADD COLUMN private_key TEXT DEFAULT NULL`, name: 'private_key' },
    { sql: `ALTER TABLE messages ADD COLUMN user_id INTEGER DEFAULT NULL`, name: 'user_id' },
    { sql: `ALTER TABLE messages ADD COLUMN has_image INTEGER DEFAULT 0`, name: 'has_image' },
    { sql: `ALTER TABLE messages ADD COLUMN image_filename TEXT DEFAULT NULL`, name: 'image_filename' },
    { sql: `ALTER TABLE messages ADD COLUMN image_mime_type TEXT DEFAULT NULL`, name: 'image_mime_type' },
    { sql: `ALTER TABLE messages ADD COLUMN image_size INTEGER DEFAULT NULL`, name: 'image_size' }
  ];

  let completed = 0;

  alterColumns.forEach((column) => {
    db.run(column.sql, (err) => {
      if (err && !err.message.includes('duplicate column name')) {
        console.error(`Error adding ${column.name} column:`, err.message);
      } else if (!err || err.message.includes('duplicate column name')) {
        console.log(`${column.name} column added or already exists.`);
      }

      completed++;
      if (completed === alterColumns.length) {
        // 所有列添加完成后，创建 users 表
        createUsersTable();
      }
    });
  });
}

// 创建 users 表
function createUsersTable() {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) {
      console.error('Error creating users table:', err.message);
    } else {
      console.log('Users table created or already exists.');

      // 创建 comments 表
      createCommentsTable();
    }
  });
}

// 创建 comments 表
function createCommentsTable() {
  db.run(`CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pid INTEGER DEFAULT NULL,  -- 父评论ID，用于回复
    user_id INTEGER DEFAULT NULL,  -- 用户ID，NULL表示匿名用户
    username TEXT NOT NULL,  -- 用户名，即使是匿名用户也会有名称
    text TEXT NOT NULL,  -- 评论内容
    score INTEGER DEFAULT 0,  -- 评论分数（赞/踩）
    votes TEXT DEFAULT '{}',  -- 存储投票信息，格式为JSON字符串
    time DATETIME DEFAULT CURRENT_TIMESTAMP,  -- 评论时间
    is_deleted INTEGER DEFAULT 0,  -- 是否删除
    is_editable INTEGER DEFAULT 1,  -- 是否可编辑
    message_id INTEGER,  -- 关联的消息ID
    upvotes INTEGER DEFAULT 0,  -- 赞同票数
    downvotes INTEGER DEFAULT 0,  -- 反对票数
    FOREIGN KEY(message_id) REFERENCES messages(id)
  )`, (err) => {
    if (err) {
      console.error('Error creating comments table:', err.message);
    } else {
      console.log('Comments table created or already exists.');

      // 创建数据库索引
      createDatabaseIndexes();
    }
  });
}

// 创建数据库索引
function createDatabaseIndexes() {
  console.log('Creating database indexes for performance optimization...');

  const indexes = [
    { sql: `CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp DESC)`, name: 'idx_messages_timestamp' },
    { sql: `CREATE INDEX IF NOT EXISTS idx_messages_is_private ON messages(is_private)`, name: 'idx_messages_is_private' },
    { sql: `CREATE INDEX IF NOT EXISTS idx_messages_user_id ON messages(user_id)`, name: 'idx_messages_user_id' },
    { sql: `CREATE INDEX IF NOT EXISTS idx_messages_private_key ON messages(private_key)`, name: 'idx_messages_private_key' },
    { sql: `CREATE INDEX IF NOT EXISTS idx_messages_has_image ON messages(has_image)`, name: 'idx_messages_has_image' },
    { sql: `CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)`, name: 'idx_users_username' },
    { sql: `CREATE INDEX IF NOT EXISTS idx_comments_time ON comments(time DESC)`, name: 'idx_comments_time' },
    { sql: `CREATE INDEX IF NOT EXISTS idx_comments_pid ON comments(pid)`, name: 'idx_comments_pid' },
    { sql: `CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id)`, name: 'idx_comments_user_id' },
    { sql: `CREATE INDEX IF NOT EXISTS idx_comments_message_id ON comments(message_id)`, name: 'idx_comments_message_id' }
  ];

  let completed = 0;

  indexes.forEach((index) => {
    db.run(index.sql, (err) => {
      if (err) {
        console.error(`Error creating ${index.name} index:`, err.message);
      } else {
        console.log(`Index ${index.name} created or already exists.`);
      }

      completed++;
      if (completed === indexes.length) {
        console.log('Database indexes creation completed.');

        // 数据库初始化完成后，清理孤儿图片文件
        cleanupOrphanedImages();

        // 每小时清理一次孤儿图片文件
        setInterval(cleanupOrphanedImages, 60 * 60 * 1000);
      }
    });
  });
}

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'views'));

app.use(express.static(path.join(__dirname, '..', 'public')));
app.use(express.json());

// Session middleware
app.use(session({
  store: new SQLiteStore({
    dir: path.resolve(__dirname, '..', 'data'),
    db: 'sessions.db',
    table: 'sessions'
  }),
  secret: 'anonymous-message-board-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
  }
}));

// Authentication middleware
const requireAuth = (req, res, next) => {
  if (req.session && req.session.userId) {
    next();
  } else {
    res.status(401).json({ error: 'Authentication required' });
  }
};

// Get current user middleware
const getCurrentUser = (req, res, next) => {
  if (req.session && req.session.userId) {
    req.userId = req.session.userId;
    req.username = req.session.username;
  }
  next();
};

// Apply getCurrentUser middleware to all routes
app.use(getCurrentUser);

// Middleware to check image access permissions
app.use('/uploads/:filename', (req, res, next) => {
  const filename = req.params.filename;

  // Find message associated with this image
  db.get(`SELECT * FROM messages WHERE image_filename = ?`, [filename], (err, message) => {
    if (err) {
      console.error('Database error checking image access:', err);
      return res.status(500).send('Internal server error');
    }

    if (!message) {
      // Image not associated with any message - allow access (could be orphaned file)
      return next();
    }

    // Check if user can access this message
    const canAccess =
      // Public message
      message.is_private === 0 ||
      // User is logged in and owns the private message
      (message.is_private === 1 && req.userId && message.user_id === req.userId) ||
      // Private key provided matches
      (message.is_private === 1 && req.query.privateKey && req.query.privateKey === message.private_key);

    if (canAccess) {
      next();
    } else {
      res.status(403).send('Access denied');
    }
  });
});

// Static file serving for uploads (after permission check)
app.use('/uploads', express.static(uploadsDir));

// Render main page
app.get('/', (req, res) => {
  // Pass user info to template if logged in
  const userInfo = req.userId ? { id: req.userId, username: req.username } : null;
  db.all("SELECT * FROM messages WHERE is_private = 0 ORDER BY timestamp DESC", [], (err, rows) => {
    if (err) {
      res.status(500).send("Error fetching messages");
      return;
    }
    res.render('index', { messages: rows, user: userInfo });
  });
});

// ==================== Authentication API ====================

// Register new user
app.post('/api/auth/register', async (req, res) => {
  const { username, password } = req.body;

  // Input validation
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  if (username.length < 3 || username.length > 20) {
    return res.status(400).json({ error: 'Username must be between 3 and 20 characters' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  try {
    // Check if username already exists
    db.get('SELECT id FROM users WHERE username = ?', [username], async (err, row) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (row) {
        return res.status(400).json({ error: 'Username already exists' });
      }

      // Hash password and create user
      const passwordHash = await hashPassword(password);
      db.run('INSERT INTO users (username, password_hash) VALUES (?, ?)',
        [username, passwordHash], function(err) {
          if (err) {
            return res.status(500).json({ error: 'Failed to create user' });
          }

          // Set session
          req.session.userId = this.lastID;
          req.session.username = username;

          res.status(201).json({
            message: 'User registered successfully',
            user: { id: this.lastID, username }
          });
        });
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login user
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    db.get('SELECT id, username, password_hash FROM users WHERE username = ?', [username], async (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (!user) {
        return res.status(401).json({ error: 'Invalid username or password' });
      }

      // Verify password
      const isValidPassword = await comparePassword(password, user.password_hash);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid username or password' });
      }

      // Set session
      req.session.userId = user.id;
      req.session.username = user.username;

      res.json({
        message: 'Login successful',
        user: { id: user.id, username: user.username }
      });
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Logout user
app.post('/api/auth/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to logout' });
    }
    res.json({ message: 'Logout successful' });
  });
});

// Get current user info
app.get('/api/auth/me', (req, res) => {
  if (req.userId) {
    res.json({ user: { id: req.userId, username: req.username } });
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});

// ==================== Image Upload API ====================

// API: Upload image/file (keeping this endpoint for backward compatibility, but now supports all file types)
app.post('/api/upload', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    // Return success response with file info
    res.status(201).json({
      success: true,
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      url: `/uploads/${req.file.filename}`
    });
  } catch (error) {
    console.error('File upload error:', error);

    // Clean up file if there was an error
    if (req.file && req.file.filename) {
      try {
        fs.unlinkSync(path.join(uploadsDir, req.file.filename));
      } catch (unlinkError) {
        console.error('Failed to delete file:', unlinkError);
      }
    }

    res.status(500).json({ error: error.message || 'Failed to upload file' });
  }
});

// API: Upload any type of file
app.post('/api/upload-file', generalUpload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    // Additional validation for large files
    // Check if file size is within limits (redundant with multer but good to double-check)
    if (req.file.size > 50 * 1024 * 1024) { // 50MB
      // Clean up the uploaded file
      fs.unlinkSync(path.join(uploadsDir, req.file.filename));
      return res.status(400).json({ error: 'File too large. Maximum size is 50MB.' });
    }

    // Return success response with file info
    res.status(201).json({
      success: true,
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      url: `/uploads/${req.file.filename}`
    });
  } catch (error) {
    console.error('File upload error:', error);

    // Clean up file if there was an error
    if (req.file && req.file.filename) {
      try {
        fs.unlinkSync(path.join(uploadsDir, req.file.filename));
      } catch (unlinkError) {
        console.error('Failed to delete file:', unlinkError);
      }
    }

    res.status(500).json({ error: error.message || 'Failed to upload file' });
  }
});

// ==================== Messages API ====================

// API: Get all messages
app.get('/api/messages', (req, res) => {
  const { privateKey, page = 1, limit = 5 } = req.query;
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const offset = (pageNum - 1) * limitNum;

  // 构建基础查询条件
  let baseSql = "FROM messages WHERE is_private = 0";
  let params = [];

  // 如果用户已登录，显示用户的私有消息
  if (req.userId) {
    baseSql = "FROM messages WHERE is_private = 0 OR (is_private = 1 AND user_id = ?)";
    params = [req.userId];
  }

  // 如果提供了 privateKey，则返回 public 消息 + 匹配 KEY 的 private 消息（覆盖用户登录逻辑）
  if (privateKey && privateKey.trim() !== '') {
    baseSql = "FROM messages WHERE is_private = 0 OR (is_private = 1 AND private_key = ?)";
    params = [privateKey.trim()];
  }

  // 查询总数
  const countSql = `SELECT COUNT(*) as total ${baseSql}`;

  // 查询分页数据
  const dataSql = `SELECT * ${baseSql} ORDER BY is_private DESC, timestamp DESC LIMIT ? OFFSET ?`;

  // 执行总数查询
  db.get(countSql, params, (err, countResult) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    const total = countResult.total;
    const totalPages = Math.ceil(total / limitNum);

    // 执行分页查询
    db.all(dataSql, [...params, limitNum, offset], (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }

      // 检查是否有匹配的 private 消息
      const hasPrivateMessages = rows.some(row => row.is_private === 1);

      // 返回分页结果
      res.json({
        messages: rows,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1
        },
        hasPrivateMessages: hasPrivateMessages,
        privateKeyProvided: !!privateKey,
        userId: req.userId || null
      });
    });
  });
});

// API: Post a new message
app.post('/api/messages', (req, res) => {
  const { content, isPrivate, privateKey, hasImage, imageFilename, imageMimeType, imageSize } = req.body;

  // Validate: message must have either content or a file
  if ((!content || content.trim() === '') && !hasImage) {
    return res.status(400).json({ error: 'Message must have either text content or a file' });
  }

  // Validate file parameters if hasImage is true (has_image field is used for all files, not just images)
  if (hasImage) {
    if (!imageFilename || !imageMimeType || !imageSize) {
      return res.status(400).json({ error: 'Missing file information' });
    }

    // Check if file exists
    const imagePath = path.join(uploadsDir, imageFilename);
    if (!fs.existsSync(imagePath)) {
      return res.status(400).json({ error: 'File not found' });
    }

    // Additional file validation
    try {
      const stats = fs.statSync(imagePath);
      if (stats.size !== parseInt(imageSize)) {
        // Clean up the potentially corrupted file
        fs.unlinkSync(imagePath);
        return res.status(400).json({ error: 'File size mismatch' });
      }
    } catch (statError) {
      console.error('Error checking file stats:', statError);
      return res.status(400).json({ error: 'File access error' });
    }
  }

  // 验证 private 消息的 KEY（如果用户未登录）
  if (isPrivate && !req.userId && (!privateKey || privateKey.trim() === '')) {
    return res.status(400).json({ error: 'Private message must have a KEY when not logged in' });
  }

  const isPrivateInt = isPrivate ? 1 : 0;
  const userId = req.userId || null;

  // 为私有消息生成或使用提供的KEY
  let finalPrivateKey = null;
  if (isPrivate) {
    if (privateKey && privateKey.trim() !== '') {
      // 使用用户提供的KEY
      finalPrivateKey = privateKey.trim();
    } else if (req.userId) {
      // 登录用户创建私有消息但没有提供KEY，生成一个基于用户ID和时间的KEY
      const timestamp = Date.now();
      finalPrivateKey = `user_${req.userId}_${timestamp}`;
    } else {
      // 匿名用户创建私有消息但没有提供KEY，返回错误
      return res.status(400).json({ error: 'Private message must have a KEY when not logged in' });
    }
  }

  const hasImageInt = hasImage ? 1 : 0;
  const finalContent = content ? content.trim() : '';

  db.run(`INSERT INTO messages (content, is_private, private_key, user_id, has_image, image_filename, image_mime_type, image_size) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [finalContent, isPrivateInt, finalPrivateKey, userId, hasImageInt, imageFilename, imageMimeType, imageSize], function(err) {
    if (err) {
      // If there was an error inserting to DB, clean up the uploaded file
      if (hasImage && imageFilename) {
        const imagePath = path.join(uploadsDir, imageFilename);
        try {
          fs.unlinkSync(imagePath);
          console.log(`Cleaned up file due to DB error: ${imageFilename}`);
        } catch (unlinkError) {
          console.error(`Failed to clean up file ${imageFilename}:`, unlinkError);
        }
      }
      return res.status(500).json({ error: err.message });
    }
    // 获取插入的完整消息对象
    db.get(`SELECT * FROM messages WHERE id = ?`, [this.lastID], (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json(row);
    });
  });
});

// API: Delete a message
app.delete('/api/messages/:id', (req, res) => {
  const { id } = req.params;

  // 首先检查消息是否存在以及用户是否有权限删除
  db.get(`SELECT * FROM messages WHERE id = ?`, [id], (err, message) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // 检查权限：私有消息用户只能删除自己的消息，公开消息任何人可删
    if (message.is_private === 1 && message.user_id && message.user_id !== req.userId) {
      return res.status(403).json({ error: 'You can only delete your own private messages' });
    }

    // Delete file if message has one
    if (message.has_image === 1 && message.image_filename) {
      const imagePath = path.join(uploadsDir, message.image_filename);
      try {
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
          console.log(`Deleted file: ${message.image_filename}`);
        }
      } catch (unlinkError) {
        console.error(`Failed to delete file ${message.image_filename}:`, unlinkError);
        // Continue with message deletion even if file deletion fails
      }
    }

    db.run(`DELETE FROM messages WHERE id = ?`, id, function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Message not found' });
      }
      res.status(204).send(); // No content
    });
  });
});

// API: Update a message
app.put('/api/messages/:id', (req, res) => {
  const { id } = req.params;
  const { content } = req.body;

  if (!content || content.trim() === '') {
    return res.status(400).json({ error: 'Message content cannot be empty' });
  }

  // 首先检查消息是否存在以及用户是否有权限更新
  db.get(`SELECT * FROM messages WHERE id = ?`, [id], (err, message) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // 检查权限：用户只能更新自己的消息
    if (message.user_id && message.user_id !== req.userId) {
      return res.status(403).json({ error: 'You can only update your own messages' });
    }

    db.run(`UPDATE messages SET content = ? WHERE id = ?`, [content, id], function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Message not found' });
      }
      // 获取更新后的完整消息对象
      db.get(`SELECT * FROM messages WHERE id = ?`, [id], (err, row) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        if (!row) {
          return res.status(404).json({ error: 'Message not found' });
        }
        res.status(200).json(row);
      });
    });
  });
});

// ==================== Comments API ====================

// API: Get comments for a specific message
app.get('/api/comments', (req, res) => {
  const { messageId, sort = '-time', page = 1, limit = 50 } = req.query;
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const offset = (pageNum - 1) * limitNum;

  if (!messageId) {
    return res.status(400).json({ error: 'messageId parameter is required' });
  }

  // 构建基础查询 - 只获取未删除的评论（不包括回复，回复会单独查询）
  let baseSql = `SELECT c.*, u.username as user_username
                 FROM comments c
                 LEFT JOIN users u ON c.user_id = u.id
                 WHERE c.message_id = ? AND c.is_deleted = 0 AND c.pid IS NULL`;  // 只查询顶级评论
  let params = [messageId];

  // 根据排序参数添加ORDER BY子句
  let orderBy = '';
  switch(sort) {
    case '-time':
      orderBy = 'ORDER BY c.time DESC';
      break;
    case '+time':
      orderBy = 'ORDER BY c.time ASC';
      break;
    case '-score':
      orderBy = 'ORDER BY c.score DESC, c.time DESC';
      break;
    case '+score':
      orderBy = 'ORDER BY c.score ASC, c.time ASC';
      break;
    default:
      orderBy = 'ORDER BY c.time DESC';
  }

  // 查询总数（只统计顶级评论）
  const countSql = `SELECT COUNT(*) as total FROM comments WHERE message_id = ? AND is_deleted = 0 AND pid IS NULL`;

  // 查询分页数据，并包含用户信息
  const dataSql = `${baseSql} ${orderBy} LIMIT ? OFFSET ?`;

  // 执行总数查询
  db.get(countSql, [messageId], (err, countResult) => {
    if (err) {
      console.error('Error counting comments:', err);
      return res.status(500).json({ error: err.message });
    }

    const total = countResult.total || 0;
    const totalPages = Math.ceil(total / limitNum);

    // 执行分页查询
    db.all(dataSql, [...params, limitNum, offset], (err, rows) => {
      if (err) {
        console.error('Error fetching comments:', err);
        return res.status(500).json({ error: err.message });
      }

      // 处理返回数据格式，使其与Remark42兼容
      const comments = rows.map(row => ({
        id: row.id.toString(),  // Remark42使用字符串ID
        pid: row.pid ? row.pid.toString() : null,
        text: row.text,
        user: {
          id: row.user_id ? `user_${row.user_id}` : `anonymous_${row.username}`,
          name: row.user_username || row.username,
          picture: '',  // 可以添加头像URL
          profile: '',  // 可以添加用户资料链接
          verified: false  // 可以添加验证状态
        },
        score: row.score || 0,
        time: new Date(row.time).toISOString(),
        edit: row.is_editable ? {
          edited: false,  // 当前是否已编辑
          reason: '',     // 编辑原因
          time: null      // 编辑时间
        } : null,
        vote: 0,  // 当前用户投票状态，需要根据当前用户确定
        controversy: 0,  // 争议度，可计算
        deletable: row.user_id === req.userId || req.userId,  // 是否可删除
        editable: row.user_id === req.userId && row.is_editable === 1,  // 是否可编辑
        replies: []  // 子回复，将在后续查询中填充
      }));

      // 递归函数：获取指定评论ID的所有子回复（包括嵌套的回复）
      function fetchNestedReplies(parentIds) {
        if (!parentIds || parentIds.length === 0) {
          return Promise.resolve([]);
        }

        const placeholders = parentIds.map(() => '?').join(',');
        const nestedRepliesSql = `SELECT c.*, u.username as user_username
                                 FROM comments c
                                 LEFT JOIN users u ON c.user_id = u.id
                                 WHERE c.pid IN (${placeholders}) AND c.is_deleted = 0
                                 ORDER BY c.time ASC`;

        return new Promise((resolve, reject) => {
          db.all(nestedRepliesSql, parentIds, (err, replies) => {
            if (err) {
              console.error('Error fetching nested comment replies:', err);
              reject(err);
              return;
            }

            if (replies.length === 0) {
              resolve([]);
              return;
            }

            // 创建回复对象
            const replyObjects = replies.map(reply => ({
              id: reply.id.toString(),
              pid: reply.pid ? reply.pid.toString() : null,
              text: reply.text,
              user: {
                id: reply.user_id ? `user_${reply.user_id}` : `anonymous_${reply.username}`,
                name: reply.user_username || reply.username,
                picture: '',
                profile: '',
                verified: false
              },
              score: reply.score || 0,
              time: new Date(reply.time).toISOString(),
              edit: reply.is_editable ? {
                edited: false,
                reason: '',
                time: null
              } : null,
              vote: 0,
              controversy: 0,
              deletable: reply.user_id === req.userId || req.userId,
              editable: reply.user_id === req.userId && reply.is_editable === 1,
              replies: []  // 为嵌套回复准备的数组
            }));

            // 获取这些回复的嵌套回复
            const replyIds = replies.map(r => parseInt(r.id));
            fetchNestedReplies(replyIds)
              .then(nestedReplies => {
                // 将嵌套回复分配给它们的父回复
                replyObjects.forEach(replyObj => {
                  const nested = nestedReplies.filter(nr => nr.pid === replyObj.id);
                  replyObj.replies = nested;
                });
                resolve(replyObjects);
              })
              .catch(reject);
          });
        });
      }

      // 对于每个顶级评论，获取其所有嵌套回复
      if (comments.length > 0) {
        const topCommentIds = comments.map(c => parseInt(c.id));

        fetchNestedReplies(topCommentIds)
          .then(nestedReplies => {
            // 将嵌套回复分配给顶级评论
            comments.forEach(comment => {
              const repliesToThisComment = nestedReplies.filter(reply => reply.pid === comment.id);
              comment.replies = repliesToThisComment;
            });

            // 返回分页结果
            res.json({
              comments: comments,
              info: {
                messageId: messageId,
                count: total,
                first_time: comments.length > 0 ? comments[comments.length - 1].time : null,
                last_time: comments.length > 0 ? comments[0].time : null,
                sort: sort
              },
              pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                totalPages,
                hasNextPage: pageNum < totalPages,
                hasPrevPage: pageNum > 1
              }
            });
          })
          .catch(err => {
            console.error('Error in nested replies:', err);
            res.status(500).json({ error: err.message });
          });
      } else {
        // 没有主评论，直接返回结果
        res.json({
          comments: comments,
          info: {
            messageId: messageId,
            count: total,
            first_time: null,
            last_time: null,
            sort: sort
          },
          pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            totalPages,
            hasNextPage: pageNum < totalPages,
            hasPrevPage: pageNum > 1
          }
        });
      }
    });
  });
});

// API: Post a new comment
app.post('/api/comments', (req, res) => {
  const { pid = null, text, messageId } = req.body;

  // 验证必需参数
  if (!text || text.trim() === '') {
    return res.status(400).json({ error: 'Comment text is required' });
  }

  if (!messageId) {
    return res.status(400).json({ error: 'messageId is required' });
  }

  // 检查父评论是否存在（如果提供了pid）
  if (pid) {
    db.get('SELECT id FROM comments WHERE id = ?', [pid], (err, row) => {
      if (err) {
        console.error('Error checking parent comment:', err);
        return res.status(500).json({ error: err.message });
      }

      if (!row) {
        return res.status(400).json({ error: 'Parent comment does not exist' });
      }

      insertComment();
    });
  } else {
    insertComment();
  }

  // 插入评论的函数
  function insertComment() {
    // 确定用户名和用户ID
    const userId = req.userId || null;
    const username = req.userId
      ? req.username
      : `anonymous_${Math.random().toString(36).substring(2, 10)}`;  // 生成匿名用户名

    db.run(`INSERT INTO comments (pid, user_id, username, text, message_id) VALUES (?, ?, ?, ?, ?)`,
      [pid, userId, username, text.trim(), messageId], function(err) {
        if (err) {
          console.error('Error inserting comment:', err);
          return res.status(500).json({ error: err.message });
        }

        // 获取插入的完整评论对象
        db.get(`SELECT * FROM comments WHERE id = ?`, [this.lastID], (err, row) => {
          if (err) {
            console.error('Error fetching inserted comment:', err);
            return res.status(500).json({ error: err.message });
          }

          // 返回与Remark42兼容的格式
          const comment = {
            id: row.id.toString(),
            pid: row.pid ? row.pid.toString() : null,
            text: row.text,
            user: {
              id: row.user_id ? `user_${row.user_id}` : `anonymous_${row.username}`,
              name: req.username || row.username,
              picture: '',
              profile: '',
              verified: false
            },
            score: row.score || 0,
            time: new Date(row.time).toISOString(),
            edit: row.is_editable ? {
              edited: false,
              reason: '',
              time: null
            } : null,
            vote: 0,
            controversy: 0,
            deletable: row.user_id === req.userId || req.userId,
            editable: row.user_id === req.userId && row.is_editable === 1
          };

          res.status(201).json(comment);
        });
      });
  }
});

// API: Update a comment
app.put('/api/comments/:id', (req, res) => {
  const { id } = req.params;
  const { text } = req.body;

  if (!text || text.trim() === '') {
    return res.status(400).json({ error: 'Comment text cannot be empty' });
  }

  // 首先检查评论是否存在以及用户是否有权限更新
  db.get(`SELECT * FROM comments WHERE id = ?`, [id], (err, comment) => {
    if (err) {
      console.error('Error fetching comment for update:', err);
      return res.status(500).json({ error: err.message });
    }

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // 检查权限：用户只能更新自己的评论
    if (!comment.user_id || comment.user_id !== req.userId) {
      return res.status(403).json({ error: 'You can only update your own comments' });
    }

    // 检查评论是否可编辑
    if (comment.is_editable !== 1) {
      return res.status(400).json({ error: 'This comment is not editable' });
    }

    db.run(`UPDATE comments SET text = ? WHERE id = ?`, [text.trim(), id], function(err) {
      if (err) {
        console.error('Error updating comment:', err);
        return res.status(500).json({ error: err.message });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Comment not found' });
      }

      // 获取更新后的完整评论对象
      db.get(`SELECT * FROM comments WHERE id = ?`, [id], (err, row) => {
        if (err) {
          console.error('Error fetching updated comment:', err);
          return res.status(500).json({ error: err.message });
        }

        if (!row) {
          return res.status(404).json({ error: 'Comment not found' });
        }

        // 返回与Remark42兼容的格式
        const updatedComment = {
          id: row.id.toString(),
          pid: row.pid ? row.pid.toString() : null,
          text: row.text,
          user: {
            id: row.user_id ? `user_${row.user_id}` : `anonymous_${row.username}`,
            name: row.user_id ? req.username : row.username,
            picture: '',
            profile: '',
            verified: false
          },
          score: row.score || 0,
          time: new Date(row.time).toISOString(),
          edit: {
            edited: true,
            reason: '',
            time: new Date().toISOString()
          },
          vote: 0,
          controversy: 0,
          deletable: row.user_id === req.userId || req.userId,
          editable: row.user_id === req.userId && row.is_editable === 1
        };

        res.status(200).json(updatedComment);
      });
    });
  });
});

// API: Delete a comment
app.delete('/api/comments/:id', (req, res) => {
  const { id } = req.params;

  // 首先检查评论是否存在以及用户是否有权限删除
  db.get(`SELECT * FROM comments WHERE id = ?`, [id], (err, comment) => {
    if (err) {
      console.error('Error fetching comment for deletion:', err);
      return res.status(500).json({ error: err.message });
    }

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // 检查权限：用户只能删除自己的评论
    if (!comment.user_id || comment.user_id !== req.userId) {
      return res.status(403).json({ error: 'You can only delete your own comments' });
    }

    db.run(`UPDATE comments SET is_deleted = 1 WHERE id = ?`, [id], function(err) {
      if (err) {
        console.error('Error deleting comment:', err);
        return res.status(500).json({ error: err.message });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Comment not found' });
      }

      res.status(204).send(); // No content
    });
  });
});

// API: Vote on a comment (like/dislike)
app.post('/api/comments/:id/vote', (req, res) => {
  const { id } = req.params;
  const { vote } = req.body; // 1 for upvote, -1 for downvote

  if (vote !== 1 && vote !== -1) {
    return res.status(400).json({ error: 'Vote must be either 1 (upvote) or -1 (downvote)' });
  }

  // 检查评论是否存在
  db.get(`SELECT * FROM comments WHERE id = ?`, [id], (err, comment) => {
    if (err) {
      console.error('Error fetching comment for voting:', err);
      return res.status(500).json({ error: err.message });
    }

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // 获取当前投票信息
    let votes = {};
    try {
      votes = JSON.parse(comment.votes || '{}');
    } catch (e) {
      console.error('Error parsing votes JSON:', e);
      votes = {};
    }

    // 检查当前用户是否已投票
    const currentUserId = req.userId ? `user_${req.userId}` : `anonymous_${req.ip || 'unknown'}`;
    const previousVote = votes[currentUserId];

    // 如果是相同的投票，则取消投票
    if (previousVote === vote) {
      delete votes[currentUserId];
      vote = 0; // 用于计算分数变化
    } else {
      votes[currentUserId] = vote;
    }

    // 根据投票更新分数
    let scoreChange = 0;
    if (vote !== 0) {
      // 如果是新投票或改变投票
      if (previousVote && previousVote !== vote) {
        // 改变投票，先撤销之前的投票
        scoreChange = -previousVote + vote;
      } else if (!previousVote) {
        // 新投票
        scoreChange = vote;
      }
    } else {
      // 取消投票
      scoreChange = -previousVote;
    }

    // 更新评论的分数和投票数据
    db.run(
      `UPDATE comments SET score = score + ?, votes = ? WHERE id = ?`,
      [scoreChange, JSON.stringify(votes), id],
      function(err) {
        if (err) {
          console.error('Error updating comment vote:', err);
          return res.status(500).json({ error: err.message });
        }

        if (this.changes === 0) {
          return res.status(404).json({ error: 'Comment not found' });
        }

        // 获取更新后的评论信息
        db.get(`SELECT score FROM comments WHERE id = ?`, [id], (err, updatedComment) => {
          if (err) {
            console.error('Error fetching updated comment score:', err);
            return res.status(500).json({ error: err.message });
          }

          res.json({
            success: true,
            score: updatedComment.score,
            vote: vote !== 0 ? vote : (previousVote ? 0 : vote) // 返回当前投票状态
          });
        });
      }
    );
  });
});

// Function to clean up orphaned files
const cleanupOrphanedImages = () => {
  console.log('Checking for orphaned files...');

  fs.readdir(uploadsDir, (err, files) => {
    if (err) {
      console.error('Error reading uploads directory:', err);
      return;
    }

    // Get all filenames from database (for all types of files)
    db.all('SELECT image_filename FROM messages WHERE has_image = 1 AND image_filename IS NOT NULL', (err, rows) => {
      if (err) {
        console.error('Error fetching filenames from database:', err);
        return;
      }

      const dbFilenames = new Set(rows.map(row => row.image_filename));
      let orphanCount = 0;

      // Check each file
      files.forEach(filename => {
        if (!dbFilenames.has(filename)) {
          const filePath = path.join(uploadsDir, filename);
          fs.unlink(filePath, (unlinkErr) => {
            if (unlinkErr) {
              console.error(`Failed to delete orphaned file ${filename}:`, unlinkErr);
            } else {
              console.log(`Deleted orphaned file: ${filename}`);
              orphanCount++;
            }
          });
        }
      });

      if (orphanCount > 0) {
        console.log(`Cleaned up ${orphanCount} orphaned files`);
      } else {
        console.log('No orphaned files found');
      }
    });
  });
};

const server = app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

// Set server timeout for large uploads
server.setTimeout(300000); // 5 minutes
