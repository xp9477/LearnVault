import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const dbPromise = open({
  filename: './database.sqlite',
  driver: sqlite3.Database
});

// 创建课程表
await (await dbPromise).exec(`
  CREATE TABLE IF NOT EXISTS courses (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    imageUrl TEXT NOT NULL,
    shareLink TEXT NOT NULL,
    platform TEXT NOT NULL,
    outline TEXT,
    createdAt TEXT NOT NULL
  )
`);

// 创建分类表
await (await dbPromise).exec(`
  CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    icon TEXT NOT NULL
  )
`);

// 配置文件上传
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'uploads'))
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + path.extname(file.originalname))
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB 限制
  }
});

// 添加文件上传路由
app.post('/api/upload', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '没有上传文件' });
    }
    res.json({ 
      imageUrl: '/uploads/' + req.file.filename 
    });
  } catch (error) {
    res.status(500).json({ error: '文件上传失败' });
  }
});

// 获取所有课程
app.get('/api/courses', async (req, res) => {
  try {
    const db = await dbPromise;
    const courses = await db.all('SELECT * FROM courses');
    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: '获取课程失败' });
  }
});

// 添加课程
app.post('/api/courses', async (req, res) => {
  try {
    const db = await dbPromise;
    const course = req.body;
    await db.run(
      'INSERT INTO courses (id, title, category, imageUrl, shareLink, platform, outline, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [course.id, course.title, course.category, course.imageUrl, course.shareLink, course.platform, JSON.stringify(course.outline), course.createdAt]
    );
    res.status(201).json(course);
  } catch (error) {
    res.status(500).json({ error: '添加课程失败' });
  }
});

// 获取所有分类
app.get('/api/categories', async (req, res) => {
  try {
    const db = await dbPromise;
    const categories = await db.all('SELECT * FROM categories');
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: '获取分类失败' });
  }
});

// 添加分类
app.post('/api/categories', async (req, res) => {
  try {
    const db = await dbPromise;
    const category = req.body;
    await db.run(
      'INSERT INTO categories (id, name, icon) VALUES (?, ?, ?)',
      [category.id, category.name, category.icon]
    );
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ error: '添加分类失败' });
  }
});

// 更新分类
app.put('/api/categories/:id', async (req, res) => {
  try {
    const db = await dbPromise;
    const category = req.body;
    await db.run(
      'UPDATE categories SET name = ?, icon = ? WHERE id = ?',
      [category.name, category.icon, req.params.id]
    );
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: '更新分类失败' });
  }
});

// 删除分类
app.delete('/api/categories/:id', async (req, res) => {
  try {
    const db = await dbPromise;
    await db.run('DELETE FROM categories WHERE id = ?', [req.params.id]);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: '删除分类失败' });
  }
});

// 更新课程
app.put('/api/courses/:id', async (req, res) => {
  try {
    const db = await dbPromise;
    const course = req.body;
    await db.run(
      'UPDATE courses SET title = ?, category = ?, imageUrl = ?, shareLink = ?, platform = ?, outline = ?, createdAt = ? WHERE id = ?',
      [
        course.title,
        course.category,
        course.imageUrl,
        course.shareLink,
        course.platform,
        JSON.stringify(course.outline),
        course.createdAt,
        req.params.id
      ]
    );
    res.json(course);
  } catch (error) {
    res.status(500).json({ error: '更新课程失败' });
  }
});

// 删除课程
app.delete('/api/courses/:id', async (req, res) => {
  try {
    const db = await dbPromise;
    await db.run('DELETE FROM courses WHERE id = ?', [req.params.id]);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: '删除课程失败' });
  }
});

const port = 3000;
app.listen(port, () => {
  console.log(`服务器运行在 http://localhost:${port}`);
});