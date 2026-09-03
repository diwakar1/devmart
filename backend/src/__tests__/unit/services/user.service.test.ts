import userService from '../../../services/user.service';

jest.mock('../../../config/database');

describe('UserService', () => {
  it('should be defined', () => {
    expect(userService).toBeDefined();
  });

  it('should have getAll method', () => {
    expect(typeof userService.getAll).toBe('function');
  });

  it('should have getById method', () => {
    expect(typeof userService.getById).toBe('function');
  });

  it('should have toggleActive method', () => {
    expect(typeof userService.toggleActive).toBe('function');
  });

  it('should have updateRole method', () => {
    expect(typeof userService.updateRole).toBe('function');
  });
});
