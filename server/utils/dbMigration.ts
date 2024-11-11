import { Database } from 'sqlite';
import { Database as SQLite3Database } from 'sqlite3';

interface TableSchema {
  [tableName: string]: {
    [columnName: string]: {
      type: string;
      required?: boolean;
      default?: any;
    };
  };
}

// 定义数据库表结构
const schema: TableSchema = {
  courses: {
    id: { type: 'TEXT', required: true },
    title: { type: 'TEXT', required: true },
    category: { type: 'TEXT', required: true },
    imageUrl: { type: 'TEXT', required: true },
    shareLink: { type: 'TEXT', required: true },
    platform: { type: 'TEXT', required: true },
    password: { type: 'TEXT' },
    teacher: { type: 'TEXT' },
    createdAt: { type: 'TEXT', required: true },
    totalEpisodes: { type: 'INTEGER' },
    watchedEpisodes: { type: 'INTEGER', required: true, default: 0 }
  },
  categories: {
    id: { type: 'TEXT', required: true },
    name: { type: 'TEXT', required: true },
    icon: { type: 'TEXT', required: true }
  }
};

export async function migrateDatabase(db: Database<SQLite3Database>) {
  try {
    for (const [tableName, columns] of Object.entries(schema)) {
      // 获取表信息
      const tableInfo = await db.all(`PRAGMA table_info(${tableName})`);
      const existingColumns = new Set(tableInfo.map((col: any) => col.name));

      // 检查并添加缺失的列
      for (const [columnName, config] of Object.entries(columns)) {
        if (!existingColumns.has(columnName)) {
          console.log(`正在向 ${tableName} 表添加 ${columnName} 字段...`);
          const nullable = config.required ? 'NOT NULL DEFAULT ""' : '';
          await db.exec(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${config.type} ${nullable}`);
          console.log(`成功添加 ${columnName} 字段`);
        }
      }
    }
    console.log('数据库迁移完成');
  } catch (error) {
    console.error('数据库迁移失败:', error);
    throw error;
  }
} 