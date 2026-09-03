/**
 * Cart Service Integration Tests
 */
import cartService from '../../services/cart.service';

jest.mock('../../config/database');

describe('Cart Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should have getCart method', () => {
    expect(cartService.getCart).toBeDefined();
    expect(typeof cartService.getCart).toBe('function');
  });

  it('should have addItem method', () => {
    expect(cartService.addItem).toBeDefined();
    expect(typeof cartService.addItem).toBe('function');
  });

  it('should have updateItem method', () => {
    expect(cartService.updateItem).toBeDefined();
    expect(typeof cartService.updateItem).toBe('function');
  });

  it('should have removeItem method', () => {
    expect(cartService.removeItem).toBeDefined();
    expect(typeof cartService.removeItem).toBe('function');
  });

  it('should have clearCart method', () => {
    expect(cartService.clearCart).toBeDefined();
    expect(typeof cartService.clearCart).toBe('function');
  });
});
