import jwt from 'jsonwebtoken';

// Mock database connection
export const mockDbConnection = {
  execute: jest.fn(),
  query: jest.fn(),
  commit: jest.fn(),
  rollback: jest.fn(),
  release: jest.fn(),
  beginTransaction: jest.fn(),
};

// Mock database pool
export const mockDbPool = {
  getConnection: jest.fn().mockResolvedValue(mockDbConnection),
  query: jest.fn(),
  end: jest.fn(),
};

// Mock user data
export const mockUser = {
  id: 1,
  email: 'test@example.com',
  password: 'hashed_password_here',
  firstName: 'John',
  lastName: 'Doe',
  phone: '1234567890',
  dateOfBirth: '1990-01-01',
  gender: 'M',
  profileImage: null,
  isVerified: true,
  status: 'active',
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const mockUserPublic = {
  id: 1,
  email: 'test@example.com',
  firstName: 'John',
  lastName: 'Doe',
  phone: '1234567890',
  profileImage: null,
};

// Mock address data
export const mockAddress = {
  id: 1,
  userId: 1,
  fullName: 'John Doe',
  phone: '1234567890',
  street: '123 Main St',
  city: 'New York',
  state: 'NY',
  postalCode: '10001',
  country: 'USA',
  isDefault: true,
  createdAt: new Date(),
};

// Mock product data
export const mockProduct = {
  id: 1,
  name: 'Test Product',
  description: 'Test Description',
  price: 99.99,
  stock_quantity: 100,
  categoryId: 1,
  brandId: 1,
  sku: 'TEST-001',
  images: [],
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Mock category data
export const mockCategory = {
  id: 1,
  name: 'Electronics',
  slug: 'electronics',
  icon: null,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Mock brand data
export const mockBrand = {
  id: 1,
  name: 'TechCorp',
  slug: 'techcorp',
  logo: null,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Mock cart data
export const mockCartItem = {
  id: 1,
  userId: 1,
  productId: 1,
  variantId: null,
  quantity: 2,
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Mock order data
export const mockOrder = {
  id: 1,
  userId: 1,
  orderNumber: 'ORD-001-2024',
  totalAmount: 199.98,
  orderStatus: 'pending',
  paymentStatus: 'pending',
  shippingAddressId: 1,
  billingAddressId: 1,
  notes: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Mock review data
export const mockReview = {
  id: 1,
  productId: 1,
  userId: 1,
  rating: 5,
  title: 'Great Product',
  comment: 'Really enjoyed this product',
  isVerified: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Mock JWT token
export const mockJwtToken = jwt.sign(
  { userId: 1, email: 'test@example.com' },
  'test-secret-key',
  { expiresIn: '1h' }
);

// Mock request object
export const createMockRequest = (overrides = {}) => ({
  user: { id: 1, email: 'test@example.com' },
  body: {},
  params: {},
  query: {},
  headers: {},
  ...overrides,
});

// Mock response object
export const createMockResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  res.cookie = jest.fn().mockReturnValue(res);
  res.clearCookie = jest.fn().mockReturnValue(res);
  return res;
};

// Mock next function
export const mockNext = jest.fn();

// Helper to create successful response format
export const mockSuccessResponse = (data: any, statusCode = 200) => ({
  statusCode,
  success: true,
  data,
  message: 'Success',
});

// Helper to create error response format
export const mockErrorResponse = (message: string, statusCode = 400) => ({
  statusCode,
  success: false,
  message,
});
