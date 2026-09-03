import { validate } from '../../../middlewares/validate.middleware';

describe('Validation Middleware', () => {
  it('should be defined', () => {
    expect(validate).toBeDefined();
  });

  it('should be a function', () => {
    expect(typeof validate).toBe('function');
  });
});
