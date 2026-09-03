import reviewService from '../../../services/review.service';

jest.mock('../../../config/database');

describe('ReviewService', () => {
  it('should be defined', () => {
    expect(reviewService).toBeDefined();
  });

  it('should have getProductReviews method', () => {
    expect(typeof reviewService.getProductReviews).toBe('function');
  });

  it('should have create method', () => {
    expect(typeof reviewService.create).toBe('function');
  });

  it('should have update method', () => {
    expect(typeof reviewService.update).toBe('function');
  });

  it('should have delete method', () => {
    expect(typeof reviewService.delete).toBe('function');
  });

  it('should have voteHelpful method', () => {
    expect(typeof reviewService.voteHelpful).toBe('function');
  });
});
