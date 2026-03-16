import mysql, { Pool, PoolConnection, RowDataPacket, ResultSetHeader, OkPacket } from 'mysql2/promise';
import config from '../config';

// Create connection pool
const pool: Pool = mysql.createPool({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.name,
  connectionLimit: config.db.connectionLimit,
  waitForConnections: true,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  dateStrings: true,
});

// Database utility class
class Database {
  // Execute a query with parameters
  async query<T extends RowDataPacket[]>(
    sql: string,
    params?: unknown[]
  ): Promise<T> {
    const [rows] = await pool.query<T>(sql, params);
    return rows;
  }

  // Execute an INSERT/UPDATE/DELETE query
  async execute(
    sql: string,
    params?: unknown[]
  ): Promise<ResultSetHeader> {
    const [result] = await pool.query<ResultSetHeader>(sql, params);
    return result;
  }

  // Get a single row
  async queryOne<T extends RowDataPacket>(
    sql: string,
    params?: unknown[]
  ): Promise<T | null> {
    const [rows] = await pool.query<T[]>(sql, params);
    return rows.length > 0 ? rows[0] : null;
  }

  // Transaction support
  async transaction<T>(
    callback: (connection: PoolConnection) => Promise<T>
  ): Promise<T> {
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      const result = await callback(connection);
      await connection.commit();
      return result;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // Test database connection
 async testConnection(): Promise<boolean> {
  const connection = await pool.getConnection();
  try {
    console.log('Database connected successfully');
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  } finally {
    connection.release();
  }
}

  // Close pool
  async close(): Promise<void> {
    await pool.end();
    console.log('Database pool closed');
  }

  // Get the pool (for advanced usage)
  getPool(): Pool {
    return pool;
  }
}

const db = new Database();

export default db;
export { pool, Database };
export type { RowDataPacket, ResultSetHeader, OkPacket, PoolConnection };
