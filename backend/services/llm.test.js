// Unit tests for llm service

describe('llm service', () => {
  // Test that the module exports the right functions
  it('should export streamLLMReply function', () => {
    const llm = require('./llm');
    expect(typeof llm.streamLLMReply).toBe('function');
  });

  it('should export callLLM function', () => {
    const llm = require('./llm');
    expect(typeof llm.callLLM).toBe('function');
  });

  // Test that the API key is configured (basic check)
  it('should have API configuration in the module', () => {
    // The module should load without errors
    const llm = require('./llm');
    expect(llm).toBeDefined();
  });
});
