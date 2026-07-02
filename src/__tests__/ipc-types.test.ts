import { describe, it, expect } from 'vitest';
import { ipcOk, ipcErr, type IpcResult } from '../shared/ipc-types';

describe('ipcOk', () => {
  it('creates a success result with data', () => {
    const result = ipcOk(42);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data).toBe(42);
    }
  });

  it('works with string data', () => {
    const result = ipcOk('hello');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data).toBe('hello');
    }
  });

  it('works with object data', () => {
    const obj = { a: 1, b: 'two' };
    const result = ipcOk(obj);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data).toEqual(obj);
    }
  });

  it('works with null data', () => {
    const result = ipcOk(null);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data).toBeNull();
    }
  });
});

describe('ipcErr', () => {
  it('creates a failure result from Error', () => {
    const result = ipcErr(new Error('boom'));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe('boom');
    }
  });

  it('creates a failure result from string', () => {
    const result = ipcErr('something broke');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe('something broke');
    }
  });

  it('creates a failure result from number', () => {
    const result = ipcErr(500);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe('500');
    }
  });

  it('creates a failure result from object', () => {
    const result = ipcErr({ custom: 'error' });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe('[object Object]');
    }
  });
});

describe('IpcResult type narrowing', () => {
  it('discriminates ok branch in if-else', () => {
    const result: IpcResult<number> = ipcOk(100);
    if (result.ok) {
      expect(result.data).toBe(100);
    } else {
      // TypeScript should narrow to the error branch
      expect(result.error).toBeDefined();
    }
  });

  it('discriminates error branch', () => {
    const result: IpcResult<string> = ipcErr('fail');
    if (!result.ok) {
      expect(result.error).toBe('fail');
    }
  });
});
