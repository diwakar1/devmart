/**
 * User Service Integration Tests
 */
import userService from '../../services/user.service';

jest.mock('../../config/database');

describe('User Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should have getAll method', () => {
    expect(userService.getAll).toBeDefined();
    expect(typeof userService.getAll).toBe('function');
  });

  it('should have getById method', () => {
    expect(userService.getById).toBeDefined();
    expect(typeof userService.getById).toBe('function');
  });

  it('should have toggleActive method', () => {
    expect(userService.toggleActive).toBeDefined();
    expect(typeof userService.toggleActive).toBe('function');
  });

  it('should have updateRole method', () => {
    expect(userService.updateRole).toBeDefined();
    expect(typeof userService.updateRole).toBe('function');
  });
});
