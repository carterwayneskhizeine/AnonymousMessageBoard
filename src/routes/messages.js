const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { getAIResponse } = require('../utils/ai-handler');

/**
 * @description 消息相关的路由
 * @param {import('sqlite3').Database} db - 数据库实例
 * @param {string} uploadsDir - 上传目录
 * @returns {express.Router}
 */
module.exports = function(db, uploadsDir) {
  // API: 获取所有消息
  router.get('/', (req, res) => {
    const { privateKey, page = 1, limit = 5 } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    // 构建基础查询条件
    let baseSql;
    let params = [];

    // 逻辑调整：privateKey 优先于 userId
    if (privateKey && privateKey.trim() !== '') {
      baseSql = "FROM messages m WHERE m.is_private = 0 OR (m.is_private = 1 AND m.private_key = ?)";
      params = [privateKey.trim()];
    } else if (req.userId) {
      baseSql = "FROM messages m WHERE m.is_private = 0 OR (m.is_private = 1 AND m.user_id = ?)";
      params = [req.userId];
    } else {
      baseSql = "FROM messages m WHERE m.is_private = 0";
    }

    // 查询总数
    const countSql = `SELECT COUNT(m.id) as total ${baseSql}`;

    // 查询分页数据，并检查是否存在AI回复
    const dataSql = `
      SELECT m.*, EXISTS(
        SELECT 1 FROM comments c WHERE c.message_id = m.id AND c.username = 'GoldieRill' AND c.is_deleted = 0
      ) as has_ai_reply
      ${baseSql}
      ORDER BY m.is_private DESC, m.timestamp DESC
      LIMIT ? OFFSET ?
    `;

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

        const processedRows = rows.map(row => ({
          ...row,
          has_ai_reply: row.has_ai_reply === 1
        }));

        // 检查是否有匹配的 private 消息
        const hasPrivateMessages = processedRows.some(row => row.is_private === 1);

        // 返回分页结果
        res.json({
          messages: processedRows,
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

  // API: 发布新消息
  router.post('/', (req, res) => {
    const { content, isPrivate, privateKey, hasImage, imageFilename, imageMimeType, imageSize } = req.body;

    // 验证: 消息必须包含文本内容或文件
    if ((!content || content.trim() === '') && !hasImage) {
      return res.status(400).json({ error: 'Message must have either text content or a file' });
    }

    // 如果 hasImage 为 true，则验证文件参数
    if (hasImage) {
      if (!imageFilename || !imageMimeType || !imageSize) {
        return res.status(400).json({ error: 'Missing file information' });
      }

      // 检查文件是否存在
      const imagePath = path.join(uploadsDir, imageFilename);
      if (!fs.existsSync(imagePath)) {
        return res.status(400).json({ error: 'File not found' });
      }

      // 额外的文件验证
      try {
        const stats = fs.statSync(imagePath);
        if (stats.size !== parseInt(imageSize)) {
          // 清理可能损坏的文件
          fs.unlinkSync(imagePath);
          return res.status(400).json({ error: 'File size mismatch' });
        }
      } catch (statError) {
        console.error('Error checking file stats:', statError);
        return res.status(400).json({ error: 'File access error' });
      }
    }

    // 验证私有消息的 KEY（如果用户未登录）
    if (isPrivate && !req.userId && (!privateKey || privateKey.trim() === '')) {
      return res.status(400).json({ error: 'Private message must have a KEY when not logged in' });
    }

    const isPrivateInt = isPrivate ? 1 : 0;
    const userId = req.userId || null;

    // 为私有消息生成或使用提供的 KEY
    let finalPrivateKey = null;
    if (isPrivate) {
      if (privateKey && privateKey.trim() !== '') {
        finalPrivateKey = privateKey.trim();
      } else if (req.userId) {
        const timestamp = Date.now();
        finalPrivateKey = `user_${req.userId}_${timestamp}`;
      } else {
        return res.status(400).json({ error: 'Private message must have a KEY when not logged in' });
      }
    }

    const hasImageInt = hasImage ? 1 : 0;
    const finalContent = content ? content.trim() : '';

    db.run(`INSERT INTO messages (content, is_private, private_key, user_id, has_image, image_filename, image_mime_type, image_size) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [finalContent, isPrivateInt, finalPrivateKey, userId, hasImageInt, imageFilename, imageMimeType, imageSize], function(err) {
      if (err) {
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
      db.get(`SELECT * FROM messages WHERE id = ?`, [this.lastID], (err, row) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        
        // 立即响应用户
        res.status(201).json(row);

        // --- AI 触发逻辑 (异步) ---
        if (row.content && row.content.toLowerCase().includes('@goldierill')) {
          console.log(`[AI Trigger] Mention detected in message ID: ${row.id}.`);
          
          // 使用异步IIFE处理AI逻辑
          (async () => {
            try {
              const aiResponseText = await getAIResponse(row.content);

              if (aiResponseText) {
                console.log(`[AI] Received response. Saving to DB for message ${row.id}.`);
                // 将AI响应作为新评论保存
                db.run(`INSERT INTO comments (pid, user_id, username, text, message_id) VALUES (?, ?, ?, ?, ?)`,
                  [null, null, 'GoldieRill', aiResponseText, row.id], function(err) {
                    if (err) {
                      console.error('[AI Error] Failed to insert AI comment into database:', err);
                    } else {
                      console.log(`[AI Success] AI comment saved with ID: ${this.lastID}.`);
                    }
                  });
              } else {
                console.log('[AI] Handler returned no response. Not saving comment.');
              }
            } catch (aiError) {
              console.error(`[AI Error] An error occurred during AI processing for message ${row.id}:`, aiError);
            }
          })();
        }
      });
    });
  });

  // API: 删除消息
  router.delete('/:id', (req, res) => {
    const { id } = req.params;

    db.get(`SELECT * FROM messages WHERE id = ?`, [id], (err, message) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (!message) {
        return res.status(404).json({ error: 'Message not found' });
      }

      // 检查权限：私有消息用户只能删除自己的消息
      if (message.is_private === 1 && message.user_id && message.user_id !== req.userId) {
        return res.status(403).json({ error: 'You can only delete your own private messages' });
      }

      // 如果消息有文件，则删除文件
      if (message.has_image === 1 && message.image_filename) {
        const imagePath = path.join(uploadsDir, message.image_filename);
        try {
          if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
            console.log(`Deleted file: ${message.image_filename}`);
          }
        } catch (unlinkError) {
          console.error(`Failed to delete file ${message.image_filename}:`, unlinkError);
        }
      }

      db.run(`DELETE FROM messages WHERE id = ?`, id, function(err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
          return res.status(404).json({ error: 'Message not found' });
        }
        res.status(204).send();
      });
    });
  });

  // API: 更新消息
  router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { content } = req.body;

    if (!content || content.trim() === '') {
      return res.status(400).json({ error: 'Message content cannot be empty' });
    }

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

  return router;
}
