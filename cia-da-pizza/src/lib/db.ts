import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_PATH = path.join(process.cwd(), 'data', 'pizza.db');

// Ensure data directory exists
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(DB_PATH);

// Enable WAL mode for better concurrent read performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function createTables(): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      order_position INTEGER NOT NULL DEFAULT 0,
      active INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      price_small REAL,
      price_medium REAL,
      price_large REAL,
      image_url TEXT,
      active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (category_id) REFERENCES categories(id)
    );

    CREATE TABLE IF NOT EXISTS stores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      address TEXT,
      phone TEXT,
      whatsapp TEXT,
      opening_hours TEXT,
      closing_hours TEXT,
      active INTEGER NOT NULL DEFAULT 1,
      is_delivery INTEGER NOT NULL DEFAULT 0,
      lat REAL,
      lng REAL,
      allows_delivery INTEGER DEFAULT 1,
      allows_pickup INTEGER DEFAULT 1,
      allows_reservation INTEGER DEFAULT 1,
      allows_dine_in INTEGER DEFAULT 1,
      whatsapp_number TEXT DEFAULT '',
      whatsapp_message TEXT DEFAULT 'Olá! Gostaria de fazer um pedido.',
      login_username TEXT UNIQUE,
      login_password_hash TEXT
    );

    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT UNIQUE NOT NULL,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      store_id INTEGER NOT NULL,
      customer_name TEXT NOT NULL,
      customer_phone TEXT,
      customer_address TEXT,
      order_type TEXT NOT NULL CHECK (order_type IN ('delivery', 'pickup', 'dine_in')),
      status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled')),
      total REAL NOT NULL DEFAULT 0,
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (store_id) REFERENCES stores(id)
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      product_name TEXT NOT NULL,
      size TEXT,
      quantity INTEGER NOT NULL DEFAULT 1,
      unit_price REAL NOT NULL,
      notes TEXT,
      FOREIGN KEY (order_id) REFERENCES orders(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    );

    CREATE TABLE IF NOT EXISTS reservations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      store_id INTEGER NOT NULL,
      customer_name TEXT NOT NULL,
      customer_phone TEXT,
      customer_email TEXT,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      guests INTEGER NOT NULL DEFAULT 1,
      status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'confirmed', 'cancelled')),
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (store_id) REFERENCES stores(id)
    );

    CREATE TABLE IF NOT EXISTS admin_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'admin',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      token TEXT UNIQUE NOT NULL,
      user_type TEXT NOT NULL CHECK (user_type IN ('admin', 'store')),
      user_id INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      expires_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
    CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
    CREATE INDEX IF NOT EXISTS idx_orders_store ON orders(store_id);
    CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
    CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
    CREATE INDEX IF NOT EXISTS idx_reservations_store ON reservations(store_id);
    CREATE INDEX IF NOT EXISTS idx_reservations_date ON reservations(date);
  `);
}

function isDatabaseEmpty(): boolean {
  const row = db.prepare('SELECT COUNT(*) as count FROM categories').get() as {
    count: number;
  };
  return row.count === 0;
}

function initializeDatabase(): void {
  createTables();

  try {
    if (isDatabaseEmpty()) {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { seedDatabase } = require('./seed');
      seedDatabase(db);
    }
  } catch (e: unknown) {
    const err = e as { code?: string };
    if (err.code !== 'SQLITE_CONSTRAINT_UNIQUE') {
      throw e;
    }
  }
}

// Initialize on first import
initializeDatabase();

export default db;

// Re-export types for convenience
export type Category = {
  id: number;
  name: string;
  order_position: number;
  active: number;
};

export type Product = {
  id: number;
  category_id: number;
  name: string;
  description: string | null;
  price_small: number | null;
  price_medium: number | null;
  price_large: number | null;
  image_url: string | null;
  active: number;
  created_at: string;
};

export type Store = {
  id: number;
  name: string;
  address: string | null;
  phone: string | null;
  whatsapp: string | null;
  opening_hours: string | null;
  closing_hours: string | null;
  active: number;
  is_delivery: number;
  lat: number | null;
  lng: number | null;
  allows_delivery: number;
  allows_pickup: number;
  allows_reservation: number;
  allows_dine_in: number;
  whatsapp_number: string;
  whatsapp_message: string;
  login_username: string | null;
  login_password_hash: string | null;
};

export type Setting = {
  id: number;
  key: string;
  value: string;
};

export type Order = {
  id: number;
  store_id: number;
  customer_name: string;
  customer_phone: string | null;
  customer_address: string | null;
  order_type: 'delivery' | 'pickup' | 'dine_in';
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  total: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type OrderItem = {
  id: number;
  order_id: number;
  product_id: number;
  product_name: string;
  size: string | null;
  quantity: number;
  unit_price: number;
  notes: string | null;
};

export type Reservation = {
  id: number;
  store_id: number;
  customer_name: string;
  customer_phone: string | null;
  customer_email: string | null;
  date: string;
  time: string;
  guests: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  notes: string | null;
  created_at: string;
};

export type AdminUser = {
  id: number;
  username: string;
  password_hash: string;
  name: string;
  role: string;
  created_at: string;
};
