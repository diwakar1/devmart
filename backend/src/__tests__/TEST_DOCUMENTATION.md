# Backend Testing Documentation

## Overview
This document outlines the comprehensive testing setup for the DevMart backend API.

## Test Structure

```
backend/src/__tests__/
├── setup.ts                    # Test utilities and mock data
├── unit/
│   ├── services/
│   │   ├── auth.service.test.ts
│   │   ├── user.service.test.ts
│   │   ├── product.service.test.ts
│   │   ├── cart.service.test.ts
│   │   ├── order.service.test.ts
│   │   ├── category.service.test.ts
│   │   ├── brand.service.test.ts
│   │   ├── address.service.test.ts
│   │   ├── review.service.test.ts
│   │   └── wishlist.service.test.ts
│   ├── middlewares/
│   │   ├── auth.middleware.test.ts
│   │   ├── error.middleware.test.ts
│   │   └── validate.middleware.test.ts
│   └── utils/
│       ├── helpers.test.ts
│       ├── jwt.test.ts
│       └── ApiError.test.ts
└── integration/
    ├── auth.controller.integration.test.ts
    ├── user.controller.integration.test.ts
    ├── product.controller.integration.test.ts
    └── cart.controller.integration.test.ts
```

## Test Categories

### 1. Unit Tests (60+ tests)
Test individual services, utilities, and middlewares in isolation with mocked dependencies.

**Services (10 files, ~50 tests):**
- `auth.service.test.ts` - Register, login, logout, token refresh
- `user.service.test.ts` - Get users, profile management, user toggling
- `product.service.test.ts` - CRUD operations, filtering, searching
- `cart.service.test.ts` - Add/remove items, quantity updates, stock validation
- `order.service.test.ts` - Order creation, status updates, cancellation
- `category.service.test.ts` - Category CRUD operations
- `brand.service.test.ts` - Brand management
- `address.service.test.ts` - Address CRUD, default address handling
- `review.service.test.ts` - Review management, rating calculations
- `wishlist.service.test.ts` - Wishlist operations

**Middlewares (3 files, ~15 tests):**
- `auth.middleware.test.ts` - Token authentication, optional auth
- `error.middleware.test.ts` - Error handling, error type detection
- `validate.middleware.test.ts` - Request validation, error formatting

**Utilities (3 files, ~20 tests):**
- `helpers.test.ts` - Slugify, pagination, sanitization, email validation
- `jwt.test.ts` - Token generation and verification
- `ApiError.test.ts` - Custom error classes and status codes

### 2. Integration Tests (20+ tests)
Test controllers with mocked services to verify request handling, response formatting, and error handling.

**Controllers (4 files, ~20 tests):**
- `auth.controller.integration.test.ts` - Registration, login, refresh, logout
- `user.controller.integration.test.ts` - User profile, admin operations
- `product.controller.integration.test.ts` - Product browsing, admin management
- `cart.controller.integration.test.ts` - Cart operations

## Running Tests

### Install Dependencies
```bash
cd backend
npm install --save-dev ts-jest supertest jest-mock-extended @types/supertest
```

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Run Tests with Coverage Report
```bash
npm run test:coverage
```

### Run Specific Test File
```bash
npm test -- auth.service.test.ts
```

### Run Tests Matching Pattern
```bash
npm test -- --testNamePattern="should register user"
```

## Test Coverage Goals

| Category | Target | Current |
|----------|--------|---------|
| Branches | 50%+ | - |
| Functions | 50%+ | - |
| Lines | 50%+ | - |
| Statements | 50%+ | - |

## Mocking Strategy

### Database Mocking
- `db.query()` - Returns array of records
- `db.queryOne()` - Returns single record
- `db.execute()` - Returns insert/update result
- `db.getConnection()` - Returns mock connection for transactions

### Service Mocking
- All services mocked in controller tests
- Allows testing controller logic independently

### Authentication Mocking
- JWT tokens mocked in middleware tests
- User object injected via request mock
- Token verification bypassed with mock return

### Request/Response Mocking
- `createMockRequest()` - Creates fake Express request
- `createMockResponse()` - Creates fake Express response
- Allows testing without actual HTTP server

## Test Data (Fixtures)

The `setup.ts` file provides mock data for:
- Users (with/without sensitive fields)
- Products
- Categories
- Brands
- Cart items
- Orders
- Reviews
- Addresses
- Wishlist items

## Error Testing

Tests cover:
- `NotFoundError` (404)
- `BadRequestError` (400)
- `UnauthorizedError` (401)
- `ForbiddenError` (403)
- `ConflictError` (409)
- `ValidationError` (422)
- `InternalError` (500)

## Best Practices Implemented

1. ✅ Isolated unit tests with mocked dependencies
2. ✅ Clear test descriptions using BDD style
3. ✅ Proper beforeEach/afterEach lifecycle
4. ✅ Comprehensive error case testing
5. ✅ Edge case coverage (pagination limits, empty results)
6. ✅ Consistent mock data across tests
7. ✅ No database calls in tests
8. ✅ TypeScript support via ts-jest

## Next Steps

### To Extend Testing:

1. **Add more integration tests** for remaining controllers:
   - `order.controller.integration.test.ts`
   - `category.controller.integration.test.ts`
   - `brand.controller.integration.test.ts`
   - `address.controller.integration.test.ts`
   - `review.controller.integration.test.ts`
   - `wishlist.controller.integration.test.ts`

2. **Add E2E tests** using supertest:
   - Full request/response cycle
   - Database seed and cleanup
   - Real API routes testing

3. **Increase coverage**:
   - Target 70%+ for critical modules
   - Add edge cases and boundary tests
   - Test error recovery scenarios

4. **Performance tests**:
   - Pagination performance
   - Large dataset queries
   - Rate limiting verification

## Troubleshooting

### Common Issues

**Issue: Cannot find module 'ts-jest'**
```bash
npm install --save-dev ts-jest
```

**Issue: Tests not running**
- Ensure `jest.config.js` exists in backend root
- Verify test files match pattern `**/*.test.ts`
- Check `tsconfig.json` is valid

**Issue: Mock not working**
- Ensure `jest.mock()` is at top of file
- Check mock path matches actual import
- Verify mock is cleared with `jest.clearAllMocks()`

## CI/CD Integration

Add to your CI/CD pipeline:
```yaml
- name: Run Backend Tests
  run: |
    cd backend
    npm install
    npm run test:coverage
```

Then upload coverage reports to services like Codecov or Coveralls.
