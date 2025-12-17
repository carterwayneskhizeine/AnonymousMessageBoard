const express = require('express');
const router = express.Router();
const { hashPassword, comparePassword } = require('../utils/password');

/**
 * @description 认证相关的路由
 * @param {import('sqlite3').Database} db - 数据库实例
 * @returns {express.Router}
 */
module.exports = function(db) {
  // 注册新用户
  router.post('/register', async (req, res) => {
    const { username, password } = req.body;

    // 输入验证
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
      // 检查用户名是否存在
      db.get('SELECT id FROM users WHERE username = ?', [username], async (err, row) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }

        if (row) {
          return res.status(400).json({ error: 'Username already exists' });
        }

        // 哈希密码并创建用户
        const passwordHash = await hashPassword(password);

        // 检查是否是第一个用户 (还没有用户存在)
        db.get('SELECT COUNT(*) as count FROM users', [], (err, row) => {
          if (err) {
            return res.status(500).json({ error: 'Database error' });
          }

          const isFirstUser = row.count === 0;
          const isAdmin = isFirstUser ? 1 : 0;

          db.run('INSERT INTO users (username, password_hash, is_admin) VALUES (?, ?, ?)',
            [username, passwordHash, isAdmin], function(err) {
              if (err) {
                return res.status(500).json({ error: 'Failed to create user' });
              }

              // 设置 session
              req.session.userId = this.lastID;
              req.session.username = username;

              res.status(201).json({
                message: 'User registered successfully',
                user: { id: this.lastID, username, is_admin: isAdmin }
              });
            });
        });
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // 用户登录
  router.post('/login', async (req, res) => {
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

        // 验证密码
        const isValidPassword = await comparePassword(password, user.password_hash);
        if (!isValidPassword) {
          return res.status(401).json({ error: 'Invalid username or password' });
        }

        // 设置 session
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

  // 用户登出
  router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to logout' });
      }
      res.json({ message: 'Logout successful' });
    });
  });

  // 获取当前用户信息
  router.get('/me', (req, res) => {
    if (req.userId) {
      res.json({
        user: {
          id: req.userId,
          username: req.username,
          is_admin: req.isAdmin || false
        }
      });
    } else {
      res.status(401).json({ error: 'Not authenticated' });
    }
  });

  return router;
}
