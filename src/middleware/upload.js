const path = require('path');
const fs = require('fs');
const multer = require('multer');

/**
 * @description 文件上传配置
 */

// 文件上传目录
const uploadsDir = path.resolve(__dirname, '..', '..', 'data', 'uploads');

// 确保上传目录存在
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer 存储配置
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // 生成唯一文件名: timestamp_random_originalname
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    const originalName = file.originalname.replace(/[^a-zA-Z0-9.]/g, '_');
    const filename = `${timestamp}_${random}_${originalName}`;
    cb(null, filename);
  }
});

// 文件过滤器
const fileFilter = (req, file, cb) => {
  // 暂时接受所有文件 - 在上传端点进行验证
  cb(null, true);
};

// Multer 上传实例 (带过滤器)
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB 限制
    files: 1, // 每个请求只允许一个文件
    fieldSize: 50 * 1024 * 1024 // 为大文件增加字段大小限制
  }
});

// Multer 上传实例 (无过滤器)
const generalUpload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB 限制
    files: 1, // 每个请求只允许一个文件
    fieldSize: 50 * 1024 * 1024 // 为大文件增加字段大小限制
  }
});

module.exports = {
  upload,
  generalUpload,
  uploadsDir
};
