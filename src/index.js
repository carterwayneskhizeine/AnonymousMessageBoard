const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = 1989;

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
      private_key TEXT DEFAULT NULL
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
  }
});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'views'));

app.use(express.static(path.join(__dirname, '..', 'public')));
app.use(express.json());

// Render main page
app.get('/', (req, res) => {
  db.all("SELECT * FROM messages WHERE is_private = 0 ORDER BY timestamp DESC", [], (err, rows) => {
    if (err) {
      res.status(500).send("Error fetching messages");
      return;
    }
    res.render('index', { messages: rows });
  });
});

// API: Get all messages
app.get('/api/messages', (req, res) => {
  const { privateKey } = req.query;

  let sql = "SELECT * FROM messages WHERE is_private = 0";
  let params = [];

  if (privateKey && privateKey.trim() !== '') {
    // 如果提供了 privateKey，则返回 public 消息 + 匹配 KEY 的 private 消息
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
      privateKeyProvided: !!privateKey
    });
  });
});

// API: Post a new message
app.post('/api/messages', (req, res) => {
  const { content, isPrivate, privateKey } = req.body;
  if (!content || content.trim() === '') {
    return res.status(400).json({ error: 'Message content cannot be empty' });
  }

  // 验证 private 消息的 KEY
  if (isPrivate && (!privateKey || privateKey.trim() === '')) {
    return res.status(400).json({ error: 'Private message must have a KEY' });
  }

  const isPrivateInt = isPrivate ? 1 : 0;
  const privateKeyValue = isPrivate ? privateKey.trim() : null;

  db.run(`INSERT INTO messages (content, is_private, private_key) VALUES (?, ?, ?)`,
    [content, isPrivateInt, privateKeyValue], function(err) {
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

// API: Update a message
app.put('/api/messages/:id', (req, res) => {
  const { id } = req.params;
  const { content } = req.body;

  if (!content || content.trim() === '') {
    return res.status(400).json({ error: 'Message content cannot be empty' });
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

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
