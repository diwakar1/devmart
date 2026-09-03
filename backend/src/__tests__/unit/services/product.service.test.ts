import productService from '../../../services/product.service';

jest.mock('../../../config/database');

describe('ProductService', () => {
  it('should be defined', () => {
    expect(productService).toBeDefined();
  });

  it('should have getAll method', () => {
    expect(typeof productService.getAll).toBe('function');
  });

  it('should have getById method', () => {
    expect(typeof productService.getById).toBe('function');
  });

  it('should have create method', () => {
    expect(typeof productService.create).toBe('function');
  });

  it('should have update method', () => {
    expect(typeof productService.update).toBe('function');
  });

  it('should have delete method', () => {
    expect(typeof productService.delete).toBe('function');
  });
});
