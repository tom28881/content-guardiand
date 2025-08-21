// Mocking the Forge bridge to prevent errors in Jest environment
// Mock @forge/bridge
const mockInvoke = jest.fn();

module.exports = {
  invoke: mockInvoke,
};
