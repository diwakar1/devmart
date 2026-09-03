import categoryService from '../../../services/category.service';

jest.mock('../../../config/database');

describe('CategoryService', () => {
  it('should be defined', () => {
    expect(categoryService).toBeDefined();
  });

  it('should have getAll method', () => {
    expect(typeof categoryService.getAll).toBe('function');
  });

  it('should have getById method', () => {
    expect(typeof categoryService.getById).toBe('function');
  });

  it('should have create method', () => {
    expect(typeof categoryService.create).toBe('function');
  });

  it('should have update method', () => {
    expect(typeof categoryService.update).toBe('function');
  });

  it('should have delete method', () => {
    expect(typeof categoryService.delete).toBe('function');
  });
});
