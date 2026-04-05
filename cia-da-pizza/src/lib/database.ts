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

  const { data: inserted, error } = await supabaseAdmin
    .from(table)
    .insert(data)
    .select()
    .single();

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
export async function dbDelete(
  table: string,
  where: Record<string, unknown>,
): Promise<void> {
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
 * Run raw SQL (SQLite only) or raw Supabase RPC
 */
export async function dbRaw<T = QueryResult>(
  sql: string,
  params: unknown[] = [],
): Promise<T[]> {
  if (!isSupabaseConfigured) {
    const db = (await import('./db')).default;
    return db.prepare(sql).all(...params) as T[];
  }

  // For Supabase, use rpc or direct queries
  // This is a fallback - prefer using dbAll/dbGet/dbInsert
  throw new Error('dbRaw not supported with Supabase. Use dbAll/dbGet instead.');
}
