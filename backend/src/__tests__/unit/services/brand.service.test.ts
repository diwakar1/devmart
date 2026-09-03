import brandService from '../../../services/brand.service';

jest.mock('../../../config/database');

describe('BrandService', () => {
  it('should be defined', () => {
    expect(brandService).toBeDefined();
  });

  it('should have getAll method', () => {
    expect(typeof brandService.getAll).toBe('function');
  });

  it('should have getById method', () => {
    expect(typeof brandService.getById).toBe('function');
  });

  it('should have create method', () => {
    expect(typeof brandService.create).toBe('function');
  });

  it('should have update method', () => {
    expect(typeof brandService.update).toBe('function');
  });

  it('should have delete method', () => {
    expect(typeof brandService.delete).toBe('function');
  });
});
