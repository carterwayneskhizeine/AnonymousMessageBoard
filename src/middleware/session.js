const path = require('path');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);

/**
 * @description Express 会话中间件配置
 */
const sessionMiddleware = session({
  store: new SQLiteStore({
    dir: path.resolve(__dirname, '..', '..', 'data'),
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
});

module.exports = sessionMiddleware;
