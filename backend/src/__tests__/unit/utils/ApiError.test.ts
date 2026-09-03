import {
  ApiError,
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  ValidationError,
  InternalError,
} from '../../../utils/ApiError';

describe('ApiError Classes', () => {
  it('ApiError should be defined', () => {
    expect(ApiError).toBeDefined();
  });

  it('NotFoundError should be defined', () => {
    expect(NotFoundError).toBeDefined();
  });

  it('BadRequestError should be defined', () => {
    expect(BadRequestError).toBeDefined();
  });

  it('UnauthorizedError should be defined', () => {
    expect(UnauthorizedError).toBeDefined();
  });

  it('ForbiddenError should be defined', () => {
    expect(ForbiddenError).toBeDefined();
  });

  it('ConflictError should be defined', () => {
    expect(ConflictError).toBeDefined();
  });

  it('ValidationError should be defined', () => {
    expect(ValidationError).toBeDefined();
  });

  it('InternalError should be defined', () => {
    expect(InternalError).toBeDefined();
  });
});
