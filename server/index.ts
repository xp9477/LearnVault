import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import { migrateDatabase } from './utils/dbMigration.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// 配置 CORS
app.use(cors({
  origin: 'http://localhost:5173', // Vite 开发服务器的默认地址
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const dbPromise = open({
  filename: './database.sqlite',
  driver: sqlite3.Database
});

// 数据库初始化和迁移
const initDatabase = async () => {
  const db = await dbPromise;
  
  // 创建基础表结构
  await db.exec(`
    CREATE TABLE IF NOT EXISTS courses (
      id TEXT PRIMARY KEY
    )
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY
    )
  `);

  // 执行数据库迁移
  await migrateDatabase(db);
};

// 初始化数据库
await initDatabase();

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
    const course = {
      ...req.body,
      watchedEpisodes: 0 // 新课程默认观看集数为0
    };
    
    await db.run(
      'INSERT INTO courses (id, title, category, imageUrl, shareLink, platform, password, teacher, createdAt, totalEpisodes, watchedEpisodes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        course.id, 
        course.title, 
        course.category, 
        course.imageUrl, 
        course.shareLink, 
        course.platform, 
        course.password, 
        course.teacher, 
        course.createdAt,
        course.totalEpisodes,
        course.watchedEpisodes
      ]
    );
    res.status(201).json(course);
  } catch (error) {
    console.error('添加课程错误:', error);
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
      'UPDATE courses SET title = ?, category = ?, imageUrl = ?, shareLink = ?, platform = ?, password = ?, teacher = ?, createdAt = ?, totalEpisodes = ?, watchedEpisodes = ? WHERE id = ?',
      [
        course.title,
        course.category,
        course.imageUrl,
        course.shareLink,
        course.platform,
        course.password,
        course.teacher,
        course.createdAt,
        course.totalEpisodes,
        course.watchedEpisodes,
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

// 解析夸克网盘分享链接的标题
app.post('/api/quark/token', async (req, res) => {
  try {
    const response = await fetch('https://drive.quark.cn/1/clouddrive/share/sharepage/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://pan.quark.cn',
        'Referer': 'https://pan.quark.cn/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36',
        'Cookie': '__itrace_wid=f49c7ef4-ff3d-49a8-2d79-8e848e407ae5; __wpkreporterwid_=8143a64e-dce7-4287-b4ce-7035ad13d2c4; b-user-id=f36241e9-90bf-2975-ae03-e4f7be200b5e; b-user-id=f36241e9-90bf-2975-ae03-e4f7be200b5e; _UP_A4A_11_=wb9671963fc641b1adcc5442b21ba81b; _UP_335_2B_=1; __wpkreporterwid_=25eff95e-0f71-484c-186e-bcce60dbc376; __itrace_wid=52d91728-db9d-442d-897a-af6e2c00d9de; kkpcwpea=a=a&uc_param_str=einibicppfmivefrlantcunwsssvjbktchnnsnddds&instance=kkpcwp&pf=145&self_service=true&wxUid=AAQapLeWZGJQG5ZK8Vvvlfxl&plain_utdid=Zkwa%2FwAAACkDAFBnthLHmO6W&system_ver=Windows_NT_10.0.22631&channel_no=pckk%40other_ch&ve=3.13.0&sv=release; CwsSessionId=01cbf34e-3ed3-4981-83a2-0afb292b3b38; xlly_s=1; __chkey=; _UP_30C_6A_=st96b6201b4yu6yu2w0kwhdw3r4sjzze; _UP_TS_=sg1a4489261ea72bb82f6063127c359ec1b; _UP_E37_B7_=sg1a4489261ea72bb82f6063127c359ec1b; _UP_TG_=st96b6201b4yu6yu2w0kwhdw3r4sjzze; _UP_D_=pc; __pus=4496b40c37adaa9ca0f994a6ea031783AATGU/WPsJAGQOe8AT45cPmmfrZJXZ4BGCY4qfHoUBK9CGyEc7jluCPcvWsqnkbKRCZFHheiOaVWLgptYm3F+WBD; __kp=c7ced3a0-9f2d-11ef-8437-97a52335bc0a; __kps=AAQapLeWZGJQG5ZK8Vvvlfxl; __ktd=d0OmcrG8qUFwiLso4SsVwg==; __uid=AAQapLeWZGJQG5ZK8Vvvlfxl; ctoken=fv48uczoae_C99I1SwFc7PYM; grey-id=bec04a94-9a7f-db0f-40fd-9372ea36a4d6; grey-id.sig=7dPyCpmAIp0ia3HRkguQWMGYaPCLTccJQAYN1UohtKg; isQuark=true; isQuark.sig=hUgqObykqFom5Y09bll94T1sS9abT1X-4Df_lzgl8nM; __puus=afb54b4aaead3fdf0b661312049d76cfAASPvdNBWyRrXbHw0b+uu+aAsxM/DJbv18fNAdoL7ROTYrSwTrzmEoEtZwclEBryaa1UOGn6mvD2e0CoHPQnxKEAi1v3MgXp9tA+8IZww9Zzr9D7drOtaT1gan2dxfWi7/zXKw6hjQTBvln9/7BIxTAkt4ej7XSp9Gm9bE09Wt99kA3WtXyzIyrgBOkqytotH6T+BBkK3tsDc7BIB/Myd6mz; isg=BD09tE0SBmxKpqPtIOKH9xjkTJk32nEsUCJry_-DRRTDNlxowiq0_UOu5Gpwtonk; tfstk=fFCmFVstytJfIWDkr8RbQpYkale87qO6VGh9XCKaU3-WXr_O7ClNXNdvQo_Oqh-Pvjo2_ROySGLGBhRamg4GDNG90nC9sdSpgd6vXnKMsNs3ykFL9Z_X1drLvWFoMoQ29xlqXnJrzfgGkJPL9Z_qkEzdzWCAzBvXAhRw3KuPz3Ti_ESw34PyVFTZ0Fl4rzY64Fo2bd-y4eYnQCRNbazk5jtxznINc_rvayD_msus1EpDYa2ItXuMlDKhu3cZ_3LDnv72qflNZTauc7x4d4K6Mn_6oGNIGIJG3iYys5cyii_V_LfT2Wpc8FS6M_zZ3HWADQ5VKVlNrIx2B1JrmuxFGa5BaLFU-a55DZ1lWVPwyMKPlsRgTyODgnRkP1ESghXPQspX1mrD_aYN4DkrLmtq1UzOaAM63UTkvJUvI3usMQCurzDFdK8WuWUurAM63UTkvz4oLk92PEPd.',  // 这里需要添加有效的 Cookie
      },
      body: JSON.stringify(req.body)
    });

    if (!response.ok) {
      throw new Error(`请求失败: ${response.status}`);
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('夸克网盘 API 请求失败:', error);
    res.status(500).json({ 
      error: '请求失败',
      message: error instanceof Error ? error.message : '未知错误'
    });
  }
});

const port = 3000;
app.listen(port, () => {
  console.log(`服务器运行在 http://localhost:${port}`);
});