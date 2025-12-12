const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const bcrypt = require('bcrypt');

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

// The database file will be created in the /app/data directory inside the container
const dbPath = path.resolve(__dirname, '..', 'data', 'messages.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    db.run(`CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      is_private INTEGER DEFAULT 0,
      private_key TEXT DEFAULT NULL,
      user_id INTEGER DEFAULT NULL
    )`);

    // 确保现有表也有新字段（如果表已存在但缺少字段）
    db.run(`ALTER TABLE messages ADD COLUMN is_private INTEGER DEFAULT 0`, (err) => {
      if (err && !err.message.includes('duplicate column name')) {
        console.error('Error adding is_private column:', err.message);
      }
    });
    db.run(`ALTER TABLE messages ADD COLUMN private_key TEXT DEFAULT NULL`, (err) => {
      if (err && !err.message.includes('duplicate column name')) {
        console.error('Error adding private_key column:', err.message);
      }
    });

    // 创建 users 表
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
      }
    });

    // 添加 user_id 字段到 messages 表
    db.run(`ALTER TABLE messages ADD COLUMN user_id INTEGER DEFAULT NULL`, (err) => {
      if (err && !err.message.includes('duplicate column name')) {
        console.error('Error adding user_id column:', err.message);
      } else {
        console.log('User_id column added or already exists.');
      }
    });
  }
});

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

// ==================== Messages API ====================

// API: Get all messages
app.get('/api/messages', (req, res) => {
  const { privateKey } = req.query;

  let sql = "SELECT * FROM messages WHERE is_private = 0";
  let params = [];

  // 如果用户已登录，显示用户的私有消息
  if (req.userId) {
    sql = "SELECT * FROM messages WHERE is_private = 0 OR (is_private = 1 AND user_id = ?)";
    params = [req.userId];
  }

  // 如果提供了 privateKey，则返回 public 消息 + 匹配 KEY 的 private 消息（覆盖用户登录逻辑）
  if (privateKey && privateKey.trim() !== '') {
    sql = "SELECT * FROM messages WHERE is_private = 0 OR (is_private = 1 AND private_key = ?)";
    params = [privateKey.trim()];
  }

  sql += " ORDER BY is_private DESC, timestamp DESC";

  db.all(sql, params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    // 检查是否有匹配的 private 消息
    const hasPrivateMessages = rows.some(row => row.is_private === 1);

    // 返回消息列表和是否有 private 消息的标志
    res.json({
      messages: rows,
      hasPrivateMessages: hasPrivateMessages,
      privateKeyProvided: !!privateKey,
      userId: req.userId || null
    });
  });
});

// API: Post a new message
app.post('/api/messages', (req, res) => {
  const { content, isPrivate, privateKey } = req.body;
  if (!content || content.trim() === '') {
    return res.status(400).json({ error: 'Message content cannot be empty' });
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

  db.run(`INSERT INTO messages (content, is_private, private_key, user_id) VALUES (?, ?, ?, ?)`,
    [content, isPrivateInt, finalPrivateKey, userId], function(err) {
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

    // 检查权限：用户只能删除自己的消息
    if (message.user_id && message.user_id !== req.userId) {
      return res.status(403).json({ error: 'You can only delete your own messages' });
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

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
