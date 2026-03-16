import db from '../config/database';
import { IUser, User } from '../types';
import { parsePagination, sanitizeUser } from '../utils/helpers';
import { NotFoundError } from '../utils/ApiError';
import { RowDataPacket } from 'mysql2/promise';

interface CountResult extends RowDataPacket {
  total: number;
}

class UserService {
  // Get all users (admin)
  async getAll(query: { page?: number; limit?: number; search?: string; role?: string }) {
    const { page, limit, offset } = parsePagination(query);

    let whereClause = 'WHERE 1=1';
    const params: unknown[] = [];

    if (query.search) {
      whereClause += ' AND (email LIKE ? OR first_name LIKE ? OR last_name LIKE ?)';
      const searchTerm = `%${query.search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    if (query.role) {
      whereClause += ' AND role = ?';
      params.push(query.role);
    }

    const countResult = await db.queryOne<CountResult>(
      `SELECT COUNT(*) as total FROM users ${whereClause}`,
      params
    );
    const total = countResult?.total || 0;

    const users = await db.query<IUser[]>(
      `SELECT * FROM users ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    const sanitizedUsers = users.map((u) =>
      sanitizeUser(u as User)
    );

    return { users: sanitizedUsers, total, page, limit };
  }

  // Get user by ID (admin)
  async getById(id: number) {
    const user = await db.queryOne<IUser>(
      'SELECT * FROM users WHERE id = ?',
      [id]
    );

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return sanitizeUser(user as User);
  }

  // Toggle user active status (admin)
  async toggleActive(id: number) {
    const user = await db.queryOne<IUser>(
      'SELECT * FROM users WHERE id = ?',
      [id]
    );

    if (!user) {
      throw new NotFoundError('User not found');
    }

    await db.execute(
      'UPDATE users SET is_active = ? WHERE id = ?',
      [!user.is_active, id]
    );

    return this.getById(id);
  }

  // Update user role (admin)
  async updateRole(id: number, role: 'user' | 'admin') {
    const user = await db.queryOne<IUser>(
      'SELECT * FROM users WHERE id = ?',
      [id]
    );

    if (!user) {
      throw new NotFoundError('User not found');
    }

    await db.execute('UPDATE users SET role = ? WHERE id = ?', [role, id]);

    return this.getById(id);
  }
}

export default new UserService();
