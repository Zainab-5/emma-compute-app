// Jest setup file for global test configuration

// Suppress console.error during tests to keep output clean
// Error testing still works, but doesn't clutter the console
global.console = {
  ...console,
  error: jest.fn(),
};
