import addressService from '../../../services/address.service';

jest.mock('../../../config/database');

describe('AddressService', () => {
  it('should be defined', () => {
    expect(addressService).toBeDefined();
  });

  it('should have getById method', () => {
    expect(typeof addressService.getById).toBe('function');
  });

  it('should have create method', () => {
    expect(typeof addressService.create).toBe('function');
  });

  it('should have update method', () => {
    expect(typeof addressService.update).toBe('function');
  });

  it('should have delete method', () => {
    expect(typeof addressService.delete).toBe('function');
  });
});
