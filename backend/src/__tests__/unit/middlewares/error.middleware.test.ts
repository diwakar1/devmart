/**
 * Error Middleware Tests
 */
import { errorHandler } from '../../../middlewares/error.middleware';

jest.mock('../../../utils/response');

describe('Error Middleware', () => {
  it('should be defined', () => {
    expect(errorHandler).toBeDefined();
  });

  it('should be a function', () => {
    expect(typeof errorHandler).toBe('function');
  });
});
