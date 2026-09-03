/**
 * Product Service Integration Tests
 */
import productService from '../../services/product.service';

jest.mock('../../config/database');

describe('Product Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should have getAll method', () => {
    expect(productService.getAll).toBeDefined();
    expect(typeof productService.getAll).toBe('function');
  });

  it('should have getById method', () => {
    expect(productService.getById).toBeDefined();
    expect(typeof productService.getById).toBe('function');
  });

  it('should have create method', () => {
    expect(productService.create).toBeDefined();
    expect(typeof productService.create).toBe('function');
  });

  it('should have update method', () => {
    expect(productService.update).toBeDefined();
    expect(typeof productService.update).toBe('function');
  });

  it('should have delete method', () => {
    expect(productService.delete).toBeDefined();
    expect(typeof productService.delete).toBe('function');
  });
});
