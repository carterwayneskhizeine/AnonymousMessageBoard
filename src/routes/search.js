const express = require('express');
const router = express.Router();

/**
 * @description Search-related routes
 * @param {import('sqlite3').Database} db - Database instance
 * @returns {express.Router}
 */
module.exports = function(db) {
  // API: GET /api/search?q=...
  router.get('/', (req, res) => {
    const { q, page = 1, limit = 5 } = req.query;

    if (!q || q.trim() === '') {
      return res.status(400).json({ error: 'Search query cannot be empty' });
    }

    const searchQuery = `%${q.trim()}%`;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    // Base query for searching
    let baseSql;
    let params = [];

    // Logged-in users can search their own private messages as well as public ones
    if (req.userId) {
      baseSql = "FROM messages m WHERE (m.content LIKE ? AND m.is_private = 0) OR (m.content LIKE ? AND m.is_private = 1 AND m.user_id = ?)";
      params = [searchQuery, searchQuery, req.userId];
    } else {
      // Guests can only search public messages
      baseSql = "FROM messages m WHERE m.content LIKE ? AND m.is_private = 0";
      params = [searchQuery];
    }

    // Get total count for pagination
    const countSql = `SELECT COUNT(m.id) as total ${baseSql}`;
    db.get(countSql, params, (err, countResult) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      const total = countResult.total;
      const totalPages = Math.ceil(total / limitNum);

      // Get paginated results
      const dataSql = `
        SELECT m.* FROM messages m
        WHERE m.id IN (
            SELECT m.id ${baseSql} ORDER BY m.timestamp DESC LIMIT ? OFFSET ?
        )
        ORDER BY m.timestamp DESC
      `;
      
      db.all(dataSql, [...params, limitNum, offset], (err, rows) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }

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
          searchQuery: q
        });
      });
    });
  });

  return router;
};
