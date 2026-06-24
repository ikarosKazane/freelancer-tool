/**
 * SQLite 数据库初始化
 *
 * - 使用 better-sqlite3 同步 API
 * - 启动时执行完整 Schema SQL（5 张表 + 索引）
 * - INSERT 默认用户（id=1, name='自由职业者'）如果不存在
 * - 启用 WAL 模式和外键约束
 */

import Database from 'better-sqlite3';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 确保 data/ 目录存在
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'freelancer.db');
const db: Database.Database = new Database(dbPath);

// 启用 WAL 模式（更好的并发性能）
db.pragma('journal_mode = WAL');
// 启用外键约束
db.pragma('foreign_keys = ON');

// 完整 Schema SQL
const schemaSql = `
-- 用户表
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL DEFAULT '自由职业者',
  email TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  avatar_url TEXT DEFAULT '',
  profession TEXT DEFAULT 'designer' CHECK(profession IN ('designer','developer','writer','consultant','photographer')),
  brand_name TEXT DEFAULT '',
  brand_logo_url TEXT DEFAULT '',
  brand_address TEXT DEFAULT '',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 项目表
CREATE TABLE IF NOT EXISTS projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL DEFAULT 1 REFERENCES users(id),
  name TEXT NOT NULL,
  client_name TEXT DEFAULT '',
  client_contact TEXT DEFAULT '',
  description TEXT DEFAULT '',
  budget REAL DEFAULT 0,
  status TEXT DEFAULT 'draft' CHECK(status IN ('draft','quoted','signed','paid','completed')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 报价单表
CREATE TABLE IF NOT EXISTS quotations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL DEFAULT 1 REFERENCES users(id),
  items_json TEXT NOT NULL DEFAULT '[]',
  total_amount REAL DEFAULT 0,
  valid_until DATE,
  payment_terms TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  status TEXT DEFAULT 'draft' CHECK(status IN ('draft','sent','accepted','rejected')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 合同表
CREATE TABLE IF NOT EXISTS contracts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL DEFAULT 1 REFERENCES users(id),
  template_type TEXT CHECK(template_type IN ('design','development','writing','consulting')),
  variables_json TEXT NOT NULL DEFAULT '{}',
  content TEXT DEFAULT '',
  status TEXT DEFAULT 'draft' CHECK(status IN ('draft','sent','signed')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 收款记录表
CREATE TABLE IF NOT EXISTS payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL DEFAULT 1 REFERENCES users(id),
  amount REAL NOT NULL,
  payment_date DATE,
  due_date DATE,
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending','paid')),
  note TEXT DEFAULT '',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_quotations_project_id ON quotations(project_id);
CREATE INDEX IF NOT EXISTS idx_contracts_project_id ON contracts(project_id);
CREATE INDEX IF NOT EXISTS idx_payments_project_id ON payments(project_id);
`;

// 执行 Schema 初始化
db.exec(schemaSql);

// 插入默认用户（id=1），如果不存在
const userExists = db.prepare('SELECT id FROM users WHERE id = 1').get();
if (!userExists) {
  db.prepare(`
    INSERT INTO users (id, name, profession)
    VALUES (1, '自由职业者', 'designer')
  `).run();
}

export default db;
