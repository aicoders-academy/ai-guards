// Global test setup for all tests

// We need to ensure this runs before any other code, especially before importing modules
// that might call process.exit

// Flag to know if we're in test mode
global.__TEST__ = true;

// Store original process.exit
const originalExit = process.exit;

// Mock process.exit
process.exit = jest.fn((code) => {
  console.log(`[Test] Process would exit with code ${code}`);
  // In tests, we want to just log but not actually exit
  // If needed, we can throw an error to make tests aware:
  const error = new Error(`Process exited with code ${code}`);
  error.code = code;
  throw error;
});

// Make original available if needed
process.originalExit = originalExit;

// Optional: global beforeEach to reset the mock
beforeEach(() => {
  if (process.exit.mockClear) {
    process.exit.mockClear();
  }
});

// Fix: Properly restore process.exit to avoid affecting other tests
afterAll(() => {
  process.exit = originalExit;
}); 