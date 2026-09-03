import orderService from '../../../services/order.service';

jest.mock('../../../config/database');

describe('OrderService', () => {
  it('should be defined', () => {
    expect(orderService).toBeDefined();
  });

  it('should have createFromCart method', () => {
    expect(typeof orderService.createFromCart).toBe('function');
  });

  it('should have getById method', () => {
    expect(typeof orderService.getById).toBe('function');
  });

  it('should have getUserOrders method', () => {
    expect(typeof orderService.getUserOrders).toBe('function');
  });

  it('should have updateStatus method', () => {
    expect(typeof orderService.updateStatus).toBe('function');
  });

  it('should have cancelOrder method', () => {
    expect(typeof orderService.cancelOrder).toBe('function');
  });
});
