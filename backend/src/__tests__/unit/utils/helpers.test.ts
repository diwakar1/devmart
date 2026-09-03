import {
  slugify,
  parsePagination,
  sanitizeUser,
  generateRandomString,
  generateOrderNumber,
  isValidEmail,
  calcDiscountPercent,
} from '../../../utils/helpers';

describe('Helper Functions', () => {
  it('slugify should be defined', () => {
    expect(typeof slugify).toBe('function');
  });

  it('parsePagination should be defined', () => {
    expect(typeof parsePagination).toBe('function');
  });

  it('sanitizeUser should be defined', () => {
    expect(typeof sanitizeUser).toBe('function');
  });

  it('generateRandomString should be defined', () => {
    expect(typeof generateRandomString).toBe('function');
  });

  it('generateOrderNumber should be defined', () => {
    expect(typeof generateOrderNumber).toBe('function');
  });

  it('isValidEmail should be defined', () => {
    expect(typeof isValidEmail).toBe('function');
  });

  it('calcDiscountPercent should be defined', () => {
    expect(typeof calcDiscountPercent).toBe('function');
  });
});
