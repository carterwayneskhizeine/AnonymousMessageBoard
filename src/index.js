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
    files: 1 // Only one file per request
  }
});

// Additional multer instance for files without filtering for the new general upload endpoint
const generalUpload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
    files: 1 // Only one file per request
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
    { sql: `CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)`, name: 'idx_users_username' }
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

    res.status(500).json({ error: 'Failed to upload file' });
  }
});

// API: Upload any type of file
app.post('/api/upload-file', generalUpload.single('file'), (req, res) => {
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

    res.status(500).json({ error: 'Failed to upload file' });
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

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
