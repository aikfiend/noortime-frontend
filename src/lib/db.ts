import mysql from 'mysql2/promise';

// Singleton pool — lazily created on first use, reused across hot-reloads in dev.
const globalForDb = globalThis as typeof globalThis & { _dbPool?: mysql.Pool };

function getPool(): mysql.Pool {
  if (globalForDb._dbPool) return globalForDb._dbPool;

  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
  }
  const pool = mysql.createPool({
    uri: process.env.DATABASE_URL,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    timezone: '+00:00',
  });
  if (process.env.NODE_ENV !== 'production') globalForDb._dbPool = pool;
  return pool;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Params = any[];

export const db = {
  query<T>(sql: string, params: Params = []): Promise<T[]> {
    return getPool()
      .execute<mysql.RowDataPacket[]>(sql, params)
      .then(([rows]) => rows as T[]);
  },

  queryOne<T>(sql: string, params: Params = []): Promise<T | null> {
    return db.query<T>(sql, params).then((rows) => rows[0] ?? null);
  },

  execute(sql: string, params: Params = []): Promise<mysql.ResultSetHeader> {
    return getPool()
      .execute<mysql.ResultSetHeader>(sql, params)
      .then(([result]) => result);
  },
};
