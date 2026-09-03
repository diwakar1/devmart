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
  });

  it('should have updateItem method', () => {
    expect(cartService.updateItem).toBeDefined();
  });

  it('should have removeItem method', () => {
    expect(cartService.removeItem).toBeDefined();
  });

  it('should have clearCart method', () => {
    expect(cartService.clearCart).toBeDefined();
  });
});
