/**
 * @jest-environment jsdom
 */

import { friendlyError } from '../../../src/frontend/utils/friendlyError';

describe('friendlyError Utility', () => {
  it('should return the error message if it is a string', () => {
    const error = 'This is a test error.';
    expect(friendlyError(error)).toBe('This is a test error.');
  });

  it('should return the message property if error is an object', () => {
    const error = { message: 'Error from object' };
    expect(friendlyError(error)).toBe('Error from object');
  });

  it('should stringify the error if it is an object without a message property', () => {
    const error = { code: 500, details: 'Internal Server Error' };
    expect(friendlyError(error)).toBe('[object Object]');
  });

  it('should handle null and undefined inputs gracefully', () => {
    expect(friendlyError(null)).toBe('Unknown error');
    expect(friendlyError(undefined)).toBe('Unknown error');
  });

  it('should handle non-string, non-object inputs', () => {
    expect(friendlyError(123)).toBe('123');
  });
});
