describe('Backend Functionality', () => {
  test('basic math operation', () => {
    expect(1 + 2).toBe(3);
  });

  test('string concatenation', () => {
    expect('hello' + ' world').toBe('hello world');
  });

  test('array includes', () => {
    const arr = [1, 2, 3];
    expect(arr).toContain(2);
  });
});
