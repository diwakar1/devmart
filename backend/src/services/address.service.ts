import db from '../config/database';
import { IAddress } from '../types';
import { NotFoundError, BadRequestError } from '../utils/ApiError';

class AddressService {
  // Get all addresses for a user
  async getAll(userId: number) {
    return db.query<IAddress[]>(
      'SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC',
      [userId]
    );
  }

  // Get address by ID
  async getById(id: number, userId: number) {
    const address = await db.queryOne<IAddress>(
      'SELECT * FROM addresses WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (!address) {
      throw new NotFoundError('Address not found');
    }

    return address;
  }

  // Create address
  async create(userId: number, data: {
    address_type?: string;
    full_name: string;
    phone: string;
    address_line1: string;
    address_line2?: string;
    city: string;
    state: string;
    postal_code: string;
    country?: string;
    is_default?: boolean;
  }) {
    // If setting as default, unset other defaults
    if (data.is_default) {
      await db.execute(
        'UPDATE addresses SET is_default = FALSE WHERE user_id = ?',
        [userId]
      );
    }

    const result = await db.execute(
      `INSERT INTO addresses (user_id, address_type, full_name, phone, address_line1,
        address_line2, city, state, postal_code, country, is_default)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId, data.address_type || 'shipping', data.full_name, data.phone,
        data.address_line1, data.address_line2 || null, data.city, data.state,
        data.postal_code, data.country || 'USA', data.is_default || false,
      ]
    );

    return this.getById(result.insertId, userId);
  }

  // Update address
  async update(id: number, userId: number, data: Record<string, unknown>) {
    await this.getById(id, userId);

    const allowedFields = [
      'address_type', 'full_name', 'phone', 'address_line1', 'address_line2',
      'city', 'state', 'postal_code', 'country', 'is_default',
    ];

    const fields: string[] = [];
    const values: unknown[] = [];

    for (const key of allowedFields) {
      if (data[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(data[key]);
      }
    }

    if (fields.length === 0) {
      throw new BadRequestError('No fields to update');
    }

    // If setting as default, unset other defaults first
    if (data.is_default === true) {
      await db.execute(
        'UPDATE addresses SET is_default = FALSE WHERE user_id = ?',
        [userId]
      );
    }

    values.push(id);
    await db.execute(
      `UPDATE addresses SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    return this.getById(id, userId);
  }

  // Delete address
  async delete(id: number, userId: number) {
    await this.getById(id, userId);
    await db.execute('DELETE FROM addresses WHERE id = ?', [id]);
  }

  // Set default address
  async setDefault(id: number, userId: number) {
    await this.getById(id, userId);

    await db.execute(
      'UPDATE addresses SET is_default = FALSE WHERE user_id = ?',
      [userId]
    );

    await db.execute(
      'UPDATE addresses SET is_default = TRUE WHERE id = ?',
      [id]
    );

    return this.getById(id, userId);
  }
}

export default new AddressService();
