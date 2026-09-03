/**
 * Auth Service Integration Tests
 */
import authService from '../../services/auth.service';

jest.mock('../../config/database');
jest.mock('bcrypt');
jest.mock('../../utils/jwt');

describe('Auth Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should have register method', () => {
    expect(authService.register).toBeDefined();
    expect(typeof authService.register).toBe('function');
  });

  it('should have login method', () => {
    expect(authService.login).toBeDefined();
    expect(typeof authService.login).toBe('function');
  });

  it('should have logout method', () => {
    expect(authService.logout).toBeDefined();
    expect(typeof authService.logout).toBe('function');
  });

  it('should have refreshToken method', () => {
    expect(authService.refreshToken).toBeDefined();
    expect(typeof authService.refreshToken).toBe('function');
  });
});
