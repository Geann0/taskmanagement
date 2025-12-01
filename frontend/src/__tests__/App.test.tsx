import React from 'react';
import { render } from '@testing-library/react';

describe('Frontend Tests', () => {
  test('basic component rendering', () => {
    const { container } = render(<div>Hello World</div>);
    expect(container.textContent).toBe('Hello World');
  });

  test('array operations', () => {
    const arr = ['react', 'typescript', 'jest'];
    expect(arr).toContain('jest');
    expect(arr.length).toBe(3);
  });

  test('object equality', () => {
    const user = { name: 'Test', role: 'admin' };
    expect(user.name).toBe('Test');
    expect(user).toHaveProperty('role');
  });
});
