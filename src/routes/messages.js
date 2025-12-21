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
module.exports = function (db, uploadsDir) {
  // API: 获取所有消息
  router.get('/', (req, res) => {
    const { privateKey, page = 1, limit = 5, type } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    // 构建基础查询条件
    let baseSql;
    let params = [];

    // 逻辑调整：新增 type=private 和 type=posts 过滤
    if (type === 'private' && req.userId) {
      // 仅显示当前登录用户的私有消息
      baseSql = "FROM messages m WHERE m.is_private = 1 AND m.user_id = ?";
      params = [req.userId];
    } else if (type === 'posts' && req.userId) {
      // 显示当前登录用户的消息（公共 + 匹配的私有）
      if (privateKey && privateKey.trim() !== '') {
        baseSql = "FROM messages m WHERE (m.is_private = 0 OR (m.is_private = 1 AND m.private_key = ?)) AND m.user_id = ?";
        params = [privateKey.trim(), req.userId];
      } else {
        baseSql = "FROM messages m WHERE m.is_private = 0 AND m.user_id = ?";
        params = [req.userId];
      }
    } else if (privateKey && privateKey.trim() !== '') {
      // 按 KEY 查询 (显示公共消息 + 匹配的私有消息)
      baseSql = "FROM messages m WHERE m.is_private = 0 OR (m.is_private = 1 AND m.private_key = ?)";
      params = [privateKey.trim()];
    } else {
      // 默认/Latest: 仅显示公共消息 (不再混合显示登录用户的私有消息)
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

        const currentUserIdentifier = req.userId ? `user_${req.userId}` : `anonymous_${req.ip || 'unknown'}`;
        const processedRows = rows.map(row => {
          let likers = [];
          try {
            likers = JSON.parse(row.likers || '[]');
          } catch (e) {
            console.error(`Error parsing likers for message ${row.id}:`, e);
          }
          return {
            ...row,
            has_ai_reply: row.has_ai_reply === 1,
            userHasLiked: likers.includes(currentUserIdentifier)
          };
        });
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

  // API: 获取热门消息
  router.get('/trending', (req, res) => {
    const { page = 1, limit = 5, privateKey } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    // 热门消息: 公共消息 + 匹配的私有消息
    let baseSql;
    let params = [];

    if (privateKey && privateKey.trim() !== '') {
      baseSql = "FROM messages m WHERE m.is_private = 0 OR (m.is_private = 1 AND m.private_key = ?)";
      params = [privateKey.trim()];
    } else {
      baseSql = "FROM messages m WHERE m.is_private = 0";
      params = [];
    }

    // 查询总数
    const countSql = `SELECT COUNT(m.id) as total ${baseSql}`;

    // 查询分页数据，按 hot_score 排序
    const dataSql = `
      SELECT m.*, EXISTS(
        SELECT 1 FROM comments c WHERE c.message_id = m.id AND c.username = 'GoldieRill' AND c.is_deleted = 0
      ) as has_ai_reply
      ${baseSql}
      ORDER BY m.hot_score DESC
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

        const currentUserIdentifier = req.userId ? `user_${req.userId}` : `anonymous_${req.ip || 'unknown'}`;
        const processedRows = rows.map(row => {
          let likers = [];
          try {
            likers = JSON.parse(row.likers || '[]');
          } catch (e) {
            console.error(`Error parsing likers for message ${row.id}:`, e);
          }
          return {
            ...row,
            has_ai_reply: row.has_ai_reply === 1,
            userHasLiked: likers.includes(currentUserIdentifier)
          };
        });

        const hasPrivateMessages = processedRows.some(row => row.is_private === 1);

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
          privateKeyProvided: !!privateKey
        });
      });
    });
  });

  // API: 获取用户点赞的消息
  router.get('/liked', (req, res) => {
    const { page = 1, limit = 5 } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    if (!req.userId) {
      return res.status(401).json({ messages: [], pagination: { total: 0 } });
    }

    const currentUserIdentifier = `user_${req.userId}`;
    const searchPattern = `%"${currentUserIdentifier}"%`;

    // 基础查询: 查找 likers 字段包含当前用户标识的消息
    const baseSql = "FROM messages m WHERE m.likers LIKE ?";
    const params = [searchPattern];

    // 查询总数
    const countSql = `SELECT COUNT(m.id) as total ${baseSql}`;

    // 查询分页数据
    const dataSql = `
      SELECT m.*, EXISTS(
        SELECT 1 FROM comments c WHERE c.message_id = m.id AND c.username = 'GoldieRill' AND c.is_deleted = 0
      ) as has_ai_reply
      ${baseSql}
      ORDER BY m.timestamp DESC
      LIMIT ? OFFSET ?
    `;

    db.get(countSql, params, (err, countResult) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }

      const total = countResult.total;
      const totalPages = Math.ceil(total / limitNum);

      db.all(dataSql, [...params, limitNum, offset], (err, rows) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }

        const processedRows = rows.map(row => {
          let likers = [];
          try {
            likers = JSON.parse(row.likers || '[]');
          } catch (e) {
            console.error(`Error parsing likers for message ${row.id}:`, e);
          }
          return {
            ...row,
            has_ai_reply: row.has_ai_reply === 1,
            userHasLiked: likers.includes(currentUserIdentifier)
          };
        });

        res.json({
          messages: processedRows,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            totalPages,
            hasNextPage: pageNum < totalPages,
            hasPrevPage: pageNum > 1
          }
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
      [finalContent, isPrivateInt, finalPrivateKey, userId, hasImageInt, imageFilename, imageMimeType, imageSize], function (err) {
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
                    [null, null, 'GoldieRill', aiResponseText, row.id], function (err) {
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

      db.run(`DELETE FROM messages WHERE id = ?`, id, function (err) {
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

      db.run(`UPDATE messages SET content = ? WHERE id = ?`, [content, id], function (err) {
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

  // API: 消息点赞/取消点赞
  router.post('/:id/like', (req, res) => {
    const { id } = req.params;
    const messageId = parseInt(id);

    // 1. 获取消息及其点赞者列表
    db.get(`SELECT likes, likers FROM messages WHERE id = ?`, [messageId], (err, message) => {
      if (err) {
        console.error('Error fetching message for liking:', err);
        return res.status(500).json({ error: err.message });
      }

      if (!message) {
        return res.status(404).json({ error: 'Message not found' });
      }

      let likers = [];
      try {
        likers = JSON.parse(message.likers || '[]');
      } catch (e) {
        console.error('Error parsing likers JSON:', e);
        return res.status(500).json({ error: 'Could not process like data.' });
      }

      // 2. 确定当前用户ID
      const currentUserIdentifier = req.userId ? `user_${req.userId}` : `anonymous_${req.ip || 'unknown'}`;

      // 3. 检查用户是否已点赞
      const userIndex = likers.indexOf(currentUserIdentifier);
      let newLikesCount;
      let userHasLiked;

      if (userIndex > -1) {
        // 用户已点赞，现在取消点赞
        likers.splice(userIndex, 1); // 移除用户
        newLikesCount = Math.max(0, message.likes - 1); // 保证不为负
        userHasLiked = false;
      } else {
        // 用户未点赞，现在点赞
        likers.push(currentUserIdentifier); // 添加用户
        newLikesCount = message.likes + 1;
        userHasLiked = true;
      }

      // 4. 更新数据库
      const newLikersJson = JSON.stringify(likers);
      db.run(
        `UPDATE messages SET likes = ?, likers = ? WHERE id = ?`,
        [newLikesCount, newLikersJson, messageId],
        function (err) {
          if (err) {
            console.error('Error updating message likes:', err);
            return res.status(500).json({ error: err.message });
          }

          // 5. 返回成功响应
          res.json({
            success: true,
            likes: newLikesCount,
            userHasLiked: userHasLiked
          });
        }
      );
    });
  });

  // API: Convert message to private (Admin only)
  router.put('/:id/make-private', (req, res) => {
    const { id } = req.params;
    const { privateKey } = req.body;

    // Check if user is admin
    if (!req.isAdmin) {
      return res.status(403).json({ error: 'Only administrators can make messages private' });
    }

    // Validate private key
    if (!privateKey || privateKey.trim() === '') {
      return res.status(400).json({ error: 'Private key is required' });
    }

    // Get message
    db.get(`SELECT * FROM messages WHERE id = ?`, [id], (err, message) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (!message) {
        return res.status(404).json({ error: 'Message not found' });
      }

      if (message.is_private === 1) {
        return res.status(400).json({ error: 'Message is already private' });
      }

      // Update message to private
      const finalPrivateKey = privateKey.trim();
      db.run(`UPDATE messages SET is_private = 1, private_key = ? WHERE id = ?`,
        [finalPrivateKey, id], function (err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }

        if (this.changes === 0) {
          return res.status(404).json({ error: 'Message not found' });
        }

        // Get updated message
        db.get(`SELECT * FROM messages WHERE id = ?`, [id], (err, updatedMessage) => {
          if (err) {
            return res.status(500).json({ error: err.message });
          }
          res.status(200).json(updatedMessage);
        });
      });
    });
  });

  return router;
}
