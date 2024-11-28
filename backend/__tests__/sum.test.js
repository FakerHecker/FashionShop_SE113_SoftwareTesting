import sum from '../sum.js';

describe('sum function', () => {

  it('should correctly sum two positive numbers', () => {
    const result = sum(1, 2);
    expect(result).toBe(3);  // Kiểm tra kết quả trả về là 3
  });

  it('should correctly sum a positive and a negative number', () => {
    const result = sum(1, -2);
    expect(result).toBe(-1);  // Kiểm tra kết quả trả về là -1
  });

  it('should correctly sum two negative numbers', () => {
    const result = sum(-1, -2);
    expect(result).toBe(-3);  // Kiểm tra kết quả trả về là -3
  });

  it('should return 0 when summing 0 and 0', () => {
    const result = sum(0, 0);
    expect(result).toBe(0);  // Kiểm tra kết quả trả về là 0
  });

  it('should return the number itself when summed with 0', () => {
    const result1 = sum(5, 0);
    const result2 = sum(0, 5);
    expect(result1).toBe(5);  // Kiểm tra kết quả trả về là 5
    expect(result2).toBe(5);  // Kiểm tra kết quả trả về là 5
  });

});