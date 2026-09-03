import cartService from '../../../services/cart.service';

jest.mock('../../../config/database');

describe('CartService', () => {
  it('should be defined', () => {
    expect(cartService).toBeDefined();
  });

  it('should have getCart method', () => {
    expect(typeof cartService.getCart).toBe('function');
  });

  it('should have addItem method', () => {
    expect(typeof cartService.addItem).toBe('function');
  });

  it('should have updateItem method', () => {
    expect(typeof cartService.updateItem).toBe('function');
  });

  it('should have removeItem method', () => {
    expect(typeof cartService.removeItem).toBe('function');
  });

  it('should have clearCart method', () => {
    expect(typeof cartService.clearCart).toBe('function');
  });
});
