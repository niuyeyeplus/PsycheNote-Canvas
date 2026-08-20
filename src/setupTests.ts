import { TextDecoder, TextEncoder } from 'util';

import '@testing-library/jest-dom';

// jsdom 不提供 TextEncoder/TextDecoder，流式响应解析依赖它们
global.TextEncoder = TextEncoder as unknown as typeof global.TextEncoder;
global.TextDecoder = TextDecoder as unknown as typeof global.TextDecoder;

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock as unknown as Storage;

// Mock fetch
global.fetch = jest.fn();
