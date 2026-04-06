/**
 * Database abstraction layer
 * Uses Supabase in production (when env vars are set) and SQLite locally
 */

import { isSupabaseConfigured, supabaseAdmin } from './supabase';

// Re-export for backward compatibility
export { isSupabaseConfigured };

type QueryResult = Record<string, unknown>;

/**
 * Execute a SELECT query and return all rows
 */
export async function dbAll<T = QueryResult>(
  table: string,
  options?: {
    where?: Record<string, unknown>;
    orderBy?: string;
    ascending?: boolean;
    limit?: number;
    select?: string;
  },
): Promise<T[]> {
  if (!isSupabaseConfigured) {
    // Fallback to SQLite
    const db = (await import('./db')).default;
    let sql = `SELECT ${options?.select || '*'} FROM ${table}`;
    const params: unknown[] = [];

    if (options?.where) {
      const conditions = Object.entries(options.where).map(([key, val]) => {
        params.push(val);
        return `${key} = ?`;
      });
      sql += ` WHERE ${conditions.join(' AND ')}`;
    }

    if (options?.orderBy) {
      sql += ` ORDER BY ${options.orderBy} ${options.ascending === false ? 'DESC' : 'ASC'}`;
    }

    if (options?.limit) {
      sql += ` LIMIT ${options.limit}`;
    }

    return db.prepare(sql).all(...params) as T[];
  }

  let query = supabaseAdmin.from(table).select(options?.select || '*');

  if (options?.where) {
    for (const [key, val] of Object.entries(options.where)) {
      query = query.eq(key, val);
    }
  }

  if (options?.orderBy) {
    query = query.order(options.orderBy, { ascending: options.ascending ?? true });
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data || []) as T[];
}

/**
 * Execute a SELECT query and return one row
 */
export async function dbGet<T = QueryResult>(
  table: string,
  where: Record<string, unknown>,
  select?: string,
): Promise<T | null> {
  if (!isSupabaseConfigured) {
    const db = (await import('./db')).default;
    const conditions = Object.keys(where).map((k) => `${k} = ?`);
    const sql = `SELECT ${select || '*'} FROM ${table} WHERE ${conditions.join(' AND ')} LIMIT 1`;
    return (db.prepare(sql).get(...Object.values(where)) as T) || null;
  }

  const { data, error } = await supabaseAdmin
    .from(table)
    .select(select || '*')
    .match(where)
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') throw new Error(error.message);
  return (data as T) || null;
}

/**
 * Insert a row and return the inserted row
 */
export async function dbInsert<T = QueryResult>(
  table: string,
  data: Record<string, unknown>,
): Promise<T> {
  if (!isSupabaseConfigured) {
    const db = (await import('./db')).default;
    const keys = Object.keys(data);
    const placeholders = keys.map(() => '?').join(', ');
    const sql = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`;
    const result = db.prepare(sql).run(...Object.values(data));
    return { ...data, id: Number(result.lastInsertRowid) } as T;
  }

  const { data: inserted, error } = await supabaseAdmin.from(table).insert(data).select().single();

  if (error) throw new Error(error.message);
  return inserted as T;
}

/**
 * Update rows matching where clause
 */
export async function dbUpdate(
  table: string,
  where: Record<string, unknown>,
  data: Record<string, unknown>,
): Promise<void> {
  if (!isSupabaseConfigured) {
    const db = (await import('./db')).default;
    const sets = Object.keys(data).map((k) => `${k} = ?`);
    const conditions = Object.keys(where).map((k) => `${k} = ?`);
    const sql = `UPDATE ${table} SET ${sets.join(', ')} WHERE ${conditions.join(' AND ')}`;
    db.prepare(sql).run(...Object.values(data), ...Object.values(where));
    return;
  }

  const { error } = await supabaseAdmin.from(table).update(data).match(where);
  if (error) throw new Error(error.message);
}

/**
 * Delete rows matching where clause
 */
export async function dbDelete(table: string, where: Record<string, unknown>): Promise<void> {
  if (!isSupabaseConfigured) {
    const db = (await import('./db')).default;
    const conditions = Object.keys(where).map((k) => `${k} = ?`);
    const sql = `DELETE FROM ${table} WHERE ${conditions.join(' AND ')}`;
    db.prepare(sql).run(...Object.values(where));
    return;
  }

  const { error } = await supabaseAdmin.from(table).delete().match(where);
  if (error) throw new Error(error.message);
}

/**
 * Run raw SQL (SQLite only, for complex queries not supported by Supabase client)
 */
export async function dbRaw<T = QueryResult>(sql: string, params: unknown[] = []): Promise<T[]> {
  if (!isSupabaseConfigured) {
    const db = (await import('./db')).default;
    return db.prepare(sql).all(...params) as T[];
  }
  throw new Error('dbRaw not supported with Supabase. Use specific functions.');
}

/**
 * Run raw SQL and return single row
 */
export async function dbRawGet<T = QueryResult>(
  sql: string,
  params: unknown[] = [],
): Promise<T | null> {
  if (!isSupabaseConfigured) {
    const db = (await import('./db')).default;
    return (db.prepare(sql).get(...params) as T) || null;
  }
  throw new Error('dbRawGet not supported with Supabase. Use specific functions.');
}

/**
 * Run raw SQL for INSERT/UPDATE/DELETE (no return)
 */
export async function dbRawRun(
  sql: string,
  params: unknown[] = [],
): Promise<{ lastInsertRowid?: number; changes?: number }> {
  if (!isSupabaseConfigured) {
    const db = (await import('./db')).default;
    const result = db.prepare(sql).run(...params);
    return {
      lastInsertRowid: Number(result.lastInsertRowid),
      changes: result.changes,
    };
  }
  throw new Error('dbRawRun not supported with Supabase. Use specific functions.');
}

/**
 * Upsert a setting (key-value pair)
 */
export async function dbUpsertSetting(key: string, value: string): Promise<void> {
  if (!isSupabaseConfigured) {
    const db = (await import('./db')).default;
    db.prepare(
      'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
    ).run(key, value);
    return;
  }
  const { error } = await supabaseAdmin
    .from('settings')
    .upsert({ key, value }, { onConflict: 'key' });
  if (error) throw new Error(error.message);
}

/**
 * Get products with category name (JOIN)
 */
export async function dbGetProducts(filters?: {
  categoryId?: number;
  search?: string;
  active?: number;
}): Promise<QueryResult[]> {
  if (!isSupabaseConfigured) {
    const db = (await import('./db')).default;
    let sql =
      'SELECT p.*, c.name AS category_name FROM products p JOIN categories c ON p.category_id = c.id WHERE 1=1';
    const params: unknown[] = [];
    if (filters?.categoryId) {
      sql += ' AND p.category_id = ?';
      params.push(filters.categoryId);
    }
    if (filters?.active !== undefined) {
      sql += ' AND p.active = ?';
      params.push(filters.active);
    }
    if (filters?.search) {
      sql += ' AND (p.name LIKE ? OR p.description LIKE ?)';
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }
    sql += ' ORDER BY c.order_position ASC, p.name ASC';
    return db.prepare(sql).all(...params) as QueryResult[];
  }

  let query = supabaseAdmin.from('products').select('*, categories!inner(name, order_position)');
  if (filters?.categoryId) query = query.eq('category_id', filters.categoryId);
  if (filters?.active !== undefined) query = query.eq('active', filters.active);
  if (filters?.search)
    query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
  query = query.order('name');

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data || []).map((p: Record<string, unknown>) => {
    const cat = p.categories as Record<string, unknown> | null;
    return { ...p, category_name: cat?.name || '', categories: undefined };
  });
}

/**
 * Get a product with its category name
 */
export async function dbGetProduct(id: number): Promise<QueryResult | null> {
  if (!isSupabaseConfigured) {
    const db = (await import('./db')).default;
    return (
      (db
        .prepare(
          'SELECT p.*, c.name AS category_name FROM products p JOIN categories c ON p.category_id = c.id WHERE p.id = ?',
        )
        .get(id) as QueryResult) || null
    );
  }
  const { data, error } = await supabaseAdmin
    .from('products')
    .select('*, categories!inner(name)')
    .eq('id', id)
    .single();
  if (error && error.code !== 'PGRST116') throw new Error(error.message);
  if (!data) return null;
  const cat = data.categories as Record<string, unknown> | null;
  return { ...data, category_name: cat?.name || '', categories: undefined };
}

/**
 * Get orders with filters (complex)
 */
export async function dbGetOrders(filters: {
  storeId?: number;
  status?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
  offset?: number;
}): Promise<QueryResult[]> {
  if (!isSupabaseConfigured) {
    const db = (await import('./db')).default;
    let sql = 'SELECT * FROM orders WHERE 1=1';
    const params: unknown[] = [];
    if (filters.storeId) {
      sql += ' AND store_id = ?';
      params.push(filters.storeId);
    }
    if (filters.status) {
      sql += ' AND status = ?';
      params.push(filters.status);
    }
    if (filters.search) {
      sql += ' AND (customer_name LIKE ? OR customer_phone LIKE ?)';
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }
    if (filters.dateFrom) {
      sql += ' AND date(created_at) >= ?';
      params.push(filters.dateFrom);
    }
    if (filters.dateTo) {
      sql += ' AND date(created_at) <= ?';
      params.push(filters.dateTo);
    }
    sql += ' ORDER BY created_at DESC';
    if (filters.limit) {
      sql += ' LIMIT ?';
      params.push(filters.limit);
    }
    if (filters.offset) {
      sql += ' OFFSET ?';
      params.push(filters.offset);
    }
    return db.prepare(sql).all(...params) as QueryResult[];
  }

  let query = supabaseAdmin.from('orders').select('*');
  if (filters.storeId) query = query.eq('store_id', filters.storeId);
  if (filters.status) query = query.eq('status', filters.status);
  if (filters.search) {
    query = query.or(
      `customer_name.ilike.%${filters.search}%,customer_phone.ilike.%${filters.search}%`,
    );
  }
  if (filters.dateFrom) query = query.gte('created_at', `${filters.dateFrom}T00:00:00`);
  if (filters.dateTo) query = query.lte('created_at', `${filters.dateTo}T23:59:59`);
  query = query.order('created_at', { ascending: false });
  if (filters.limit) query = query.limit(filters.limit);
  if (filters.offset)
    query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data || []) as QueryResult[];
}

/**
 * Get single order with items
 */
export async function dbGetOrderWithItems(
  id: number,
  storeId?: number,
): Promise<{ order: QueryResult; items: QueryResult[] } | null> {
  if (!isSupabaseConfigured) {
    const db = (await import('./db')).default;
    let sql = 'SELECT * FROM orders WHERE id = ?';
    const params: unknown[] = [id];
    if (storeId) {
      sql += ' AND store_id = ?';
      params.push(storeId);
    }
    const order = db.prepare(sql).get(...params) as QueryResult | undefined;
    if (!order) return null;
    const items = db
      .prepare('SELECT * FROM order_items WHERE order_id = ?')
      .all(id) as QueryResult[];
    return { order, items };
  }

  let query = supabaseAdmin.from('orders').select('*').eq('id', id);
  if (storeId) query = query.eq('store_id', storeId);
  const { data: order, error } = await query.single();
  if (error || !order) return null;

  const { data: items } = await supabaseAdmin.from('order_items').select('*').eq('order_id', id);
  return { order: order as QueryResult, items: (items || []) as QueryResult[] };
}

/**
 * Create order with items in a transaction
 */
export async function dbCreateOrder(
  orderData: Record<string, unknown>,
  items: Record<string, unknown>[],
): Promise<{ orderId: number; total: number }> {
  if (!isSupabaseConfigured) {
    const db = (await import('./db')).default;
    const createOrderTx = db.transaction(() => {
      const keys = Object.keys(orderData);
      const placeholders = keys.map(() => '?').join(', ');
      const orderResult = db
        .prepare(`INSERT INTO orders (${keys.join(', ')}) VALUES (${placeholders})`)
        .run(...Object.values(orderData));
      const orderId = Number(orderResult.lastInsertRowid);

      const insertItem = db.prepare(
        `INSERT INTO order_items (order_id, product_id, product_name, size, quantity, unit_price, notes, borda, borda_price) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      );
      for (const item of items) {
        insertItem.run(
          orderId,
          item.product_id,
          item.product_name,
          item.size || null,
          item.quantity,
          item.unit_price,
          item.notes || null,
          item.borda || null,
          item.borda_price || 0,
        );
      }
      return { orderId, total: orderData.total as number };
    });
    return createOrderTx();
  }

  // Supabase: insert order first, then items
  const { data: order, error } = await supabaseAdmin
    .from('orders')
    .insert(orderData)
    .select('id, total')
    .single();
  if (error) throw new Error(error.message);

  const orderItems = items.map((item) => ({
    order_id: order.id,
    product_id: item.product_id,
    product_name: item.product_name,
    size: item.size || null,
    quantity: item.quantity,
    unit_price: item.unit_price,
    notes: item.notes || null,
    borda: item.borda || null,
    borda_price: item.borda_price || 0,
  }));
  const { error: itemsError } = await supabaseAdmin.from('order_items').insert(orderItems);
  if (itemsError) throw new Error(itemsError.message);

  return { orderId: order.id as number, total: order.total as number };
}

/**
 * Track order by ID or phone (public)
 */
export async function dbTrackOrder(
  query: string,
): Promise<{ order: QueryResult; items: QueryResult[]; store_name: string } | null> {
  if (!isSupabaseConfigured) {
    const db = (await import('./db')).default;
    const isNumeric = /^\d+$/.test(query);
    let order: QueryResult | undefined;
    if (isNumeric) {
      order = db
        .prepare(
          'SELECT o.*, s.name as store_name FROM orders o JOIN stores s ON o.store_id = s.id WHERE o.id = ?',
        )
        .get(parseInt(query)) as QueryResult | undefined;
    }
    if (!order) {
      order = db
        .prepare(
          'SELECT o.*, s.name as store_name FROM orders o JOIN stores s ON o.store_id = s.id WHERE o.customer_phone LIKE ? ORDER BY o.created_at DESC LIMIT 1',
        )
        .get(`%${query}%`) as QueryResult | undefined;
    }
    if (!order) return null;
    const items = db
      .prepare('SELECT * FROM order_items WHERE order_id = ?')
      .all(order.id as number) as QueryResult[];
    return { order, items, store_name: order.store_name as string };
  }

  const isNumeric = /^\d+$/.test(query);
  let orderData = null;

  if (isNumeric) {
    const { data } = await supabaseAdmin
      .from('orders')
      .select('*, stores!inner(name)')
      .eq('id', parseInt(query))
      .single();
    orderData = data;
  }

  if (!orderData) {
    const { data } = await supabaseAdmin
      .from('orders')
      .select('*, stores!inner(name)')
      .ilike('customer_phone', `%${query}%`)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    orderData = data;
  }

  if (!orderData) return null;

  const store = orderData.stores as Record<string, unknown>;
  const { data: items } = await supabaseAdmin
    .from('order_items')
    .select('*')
    .eq('order_id', orderData.id);

  return {
    order: { ...orderData, store_name: store?.name, stores: undefined } as QueryResult,
    items: (items || []) as QueryResult[],
    store_name: (store?.name as string) || '',
  };
}

/**
 * Get reservations with filters
 */
export async function dbGetReservations(filters: {
  storeId?: number;
  status?: string;
  date?: string;
}): Promise<QueryResult[]> {
  if (!isSupabaseConfigured) {
    const db = (await import('./db')).default;
    let sql = 'SELECT * FROM reservations WHERE 1=1';
    const params: unknown[] = [];
    if (filters.storeId) {
      sql += ' AND store_id = ?';
      params.push(filters.storeId);
    }
    if (filters.status) {
      sql += ' AND status = ?';
      params.push(filters.status);
    }
    if (filters.date) {
      sql += ' AND date = ?';
      params.push(filters.date);
    }
    sql += ' ORDER BY date DESC, time ASC';
    return db.prepare(sql).all(...params) as QueryResult[];
  }

  let query = supabaseAdmin.from('reservations').select('*');
  if (filters.storeId) query = query.eq('store_id', filters.storeId);
  if (filters.status) query = query.eq('status', filters.status);
  if (filters.date) query = query.eq('date', filters.date);
  query = query.order('date', { ascending: false }).order('time', { ascending: true });

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data || []) as QueryResult[];
}

/**
 * Get session with user info (admin or store)
 */
export async function dbGetSessionWithUser(
  token: string,
  userType: 'admin' | 'store',
): Promise<QueryResult | null> {
  if (!isSupabaseConfigured) {
    const db = (await import('./db')).default;
    if (userType === 'admin') {
      return (
        (db
          .prepare(
            `SELECT s.*, a.username, a.name, a.role FROM sessions s JOIN admin_users a ON s.user_id = a.id WHERE s.token = ? AND s.user_type = 'admin' AND s.expires_at > datetime('now')`,
          )
          .get(token) as QueryResult) || null
      );
    }
    return (
      (db
        .prepare(
          `SELECT s.*, st.name as store_name, st.login_username as username FROM sessions s JOIN stores st ON s.user_id = st.id WHERE s.token = ? AND s.user_type = 'store' AND s.expires_at > datetime('now')`,
        )
        .get(token) as QueryResult) || null
    );
  }

  const { data: session, error } = await supabaseAdmin
    .from('sessions')
    .select('*')
    .eq('token', token)
    .eq('user_type', userType)
    .gt('expires_at', new Date().toISOString())
    .single();

  if (error || !session) return null;

  if (userType === 'admin') {
    const { data: user } = await supabaseAdmin
      .from('admin_users')
      .select('username, name, role')
      .eq('id', session.user_id)
      .single();
    return user ? { ...session, ...user } : null;
  }

  const { data: store } = await supabaseAdmin
    .from('stores')
    .select('name, login_username')
    .eq('id', session.user_id)
    .single();
  return store ? { ...session, store_name: store.name, username: store.login_username } : null;
}

/**
 * Get dashboard stats
 */
export async function dbGetDashboardStats(): Promise<{
  ordersToday: number;
  pendingOrders: number;
  reservationsToday: number;
  revenueToday: number;
  recentOrders: QueryResult[];
  recentReservations: QueryResult[];
  statusBreakdown: QueryResult[];
  revenueByStore: QueryResult[];
}> {
  const tz = 'America/Sao_Paulo';
  const today = new Date(new Date().toLocaleString('en-US', { timeZone: tz }));
  const todayStr = today.toISOString().split('T')[0];

  if (!isSupabaseConfigured) {
    const db = (await import('./db')).default;

    const ordersToday = (
      db
        .prepare('SELECT COUNT(*) as count FROM orders WHERE date(created_at) = ?')
        .get(todayStr) as { count: number }
    ).count;

    const pendingOrders = (
      db.prepare("SELECT COUNT(*) as count FROM orders WHERE status = 'pending'").get() as {
        count: number;
      }
    ).count;

    const reservationsToday = (
      db.prepare('SELECT COUNT(*) as count FROM reservations WHERE date = ?').get(todayStr) as {
        count: number;
      }
    ).count;

    const revenueToday = (
      db
        .prepare(
          "SELECT COALESCE(SUM(total), 0) as total FROM orders WHERE date(created_at) = ? AND status != 'cancelled'",
        )
        .get(todayStr) as { total: number }
    ).total;

    const recentOrders = db
      .prepare(
        'SELECT o.*, s.name as store_name FROM orders o LEFT JOIN stores s ON o.store_id = s.id ORDER BY o.created_at DESC LIMIT 10',
      )
      .all() as QueryResult[];

    const recentReservations = db
      .prepare('SELECT * FROM reservations ORDER BY created_at DESC LIMIT 5')
      .all() as QueryResult[];

    const statusBreakdown = db
      .prepare('SELECT status, COUNT(*) as count FROM orders GROUP BY status')
      .all() as QueryResult[];

    const revenueByStore = db
      .prepare(
        "SELECT s.name as store_name, COALESCE(SUM(o.total), 0) as revenue FROM stores s LEFT JOIN orders o ON s.id = o.store_id AND o.status != 'cancelled' GROUP BY s.id, s.name",
      )
      .all() as QueryResult[];

    return {
      ordersToday,
      pendingOrders,
      reservationsToday,
      revenueToday,
      recentOrders,
      recentReservations,
      statusBreakdown,
      revenueByStore,
    };
  }

  // Supabase
  const startOfDay = `${todayStr}T00:00:00`;
  const endOfDay = `${todayStr}T23:59:59`;

  const [
    ordersTodayRes,
    pendingRes,
    reservationsRes,
    revenueRes,
    recentOrdersRes,
    recentReservationsRes,
    statusRes,
    revenueStoreRes,
  ] = await Promise.all([
    supabaseAdmin
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', startOfDay)
      .lte('created_at', endOfDay),
    supabaseAdmin
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending'),
    supabaseAdmin
      .from('reservations')
      .select('id', { count: 'exact', head: true })
      .eq('date', todayStr),
    supabaseAdmin
      .from('orders')
      .select('total')
      .gte('created_at', startOfDay)
      .lte('created_at', endOfDay)
      .neq('status', 'cancelled'),
    supabaseAdmin
      .from('orders')
      .select('*, stores(name)')
      .order('created_at', { ascending: false })
      .limit(10),
    supabaseAdmin
      .from('reservations')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5),
    supabaseAdmin.from('orders').select('status'),
    supabaseAdmin.from('stores').select('name, orders(total, status)'),
  ]);

  const revenueTotal = (revenueRes.data || []).reduce(
    (sum: number, o: Record<string, unknown>) => sum + ((o.total as number) || 0),
    0,
  );

  // Count statuses
  const statusMap: Record<string, number> = {};
  for (const o of statusRes.data || []) {
    const s = (o as Record<string, unknown>).status as string;
    statusMap[s] = (statusMap[s] || 0) + 1;
  }
  const statusBreakdown = Object.entries(statusMap).map(([status, count]) => ({ status, count }));

  // Revenue by store
  const revenueByStore = (revenueStoreRes.data || []).map((s: Record<string, unknown>) => {
    const orders = (s.orders || []) as Record<string, unknown>[];
    const revenue = orders
      .filter((o) => o.status !== 'cancelled')
      .reduce((sum: number, o) => sum + ((o.total as number) || 0), 0);
    return { store_name: s.name, revenue };
  });

  const recentOrders = (recentOrdersRes.data || []).map((o: Record<string, unknown>) => {
    const store = o.stores as Record<string, unknown> | null;
    return { ...o, store_name: store?.name || '', stores: undefined };
  });

  return {
    ordersToday: ordersTodayRes.count || 0,
    pendingOrders: pendingRes.count || 0,
    reservationsToday: reservationsRes.count || 0,
    revenueToday: revenueTotal,
    recentOrders: recentOrders as QueryResult[],
    recentReservations: (recentReservationsRes.data || []) as QueryResult[],
    statusBreakdown: statusBreakdown as QueryResult[],
    revenueByStore: revenueByStore as QueryResult[],
  };
}
