// This file is for setting up Jest tests.
import '@testing-library/jest-dom';

// Test setup and mocks for Forge environment

// Mock @forge/api
const mockStorage = {
  get: jest.fn(),
  set: jest.fn(),
  delete: jest.fn(),
};

const mockAsUser = jest.fn(() => ({
  requestConfluence: jest.fn(),
}));

const mockAsApp = jest.fn(() => ({
  requestConfluence: jest.fn(),
}));

const mockAssumeTrustedRoute = jest.fn((url) => url);

// Mock modules using jest.mock
jest.mock('@forge/api', () => ({
  storage: mockStorage,
  asUser: mockAsUser,
  asApp: mockAsApp,
  assumeTrustedRoute: mockAssumeTrustedRoute,
}));

// Mock crypto
jest.mock('crypto', () => ({
  randomUUID: jest.fn(() => 'test-uuid-123'),
}));

// Global test utilities
global.mockStorage = mockStorage;
global.mockAsUser = mockAsUser;
global.mockAsApp = mockAsApp;
global.mockAssumeTrustedRoute = mockAssumeTrustedRoute;

// Reset all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});
