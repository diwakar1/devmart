import authService from '../../../services/auth.service';

jest.mock('../../../config/database');
jest.mock('bcrypt');
jest.mock('../../../utils/jwt');

describe('AuthService', () => {
  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  it('should have register method', () => {
    expect(typeof authService.register).toBe('function');
  });

  it('should have login method', () => {
    expect(typeof authService.login).toBe('function');
  });

  it('should have logout method', () => {
    expect(typeof authService.logout).toBe('function');
  });

  it('should have refreshToken method', () => {
    expect(typeof authService.refreshToken).toBe('function');
  });
});
