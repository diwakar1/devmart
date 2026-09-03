import wishlistService from '../../../services/wishlist.service';

jest.mock('../../../config/database');

describe('WishlistService', () => {
  it('should be defined', () => {
    expect(wishlistService).toBeDefined();
  });

  it('should have getAll method', () => {
    expect(typeof wishlistService.getAll).toBe('function');
  });

  it('should have add method', () => {
    expect(typeof wishlistService.add).toBe('function');
  });

  it('should have remove method', () => {
    expect(typeof wishlistService.remove).toBe('function');
  });

  it('should have isInWishlist method', () => {
    expect(typeof wishlistService.isInWishlist).toBe('function');
  });
});
