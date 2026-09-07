import { describe, it, expect } from 'vitest';
import { MonetaryValue } from './monetary-value.vo.js';

describe('MonetaryValue Value Object', () => {
  it('should create a valid MonetaryValue with BRL default', () => {
    const result = MonetaryValue.create(1500.5);
    expect(result.isSuccess).toBe(true);
    const vo = result.getValue();
    expect(vo.amount).toBe(1500.5);
    expect(vo.currency).toBe('BRL');
    expect(vo.exchangeRateToBrl).toBe(1.0);
    expect(vo.amountInBrl).toBe(1500.5);
  });

  it('should accurately calculate BRL equivalent for foreign currencies', () => {
    // 1,000 USD at 5.50 exchange rate -> 5,500 BRL
    const result = MonetaryValue.create(1000, 'USD', 5.5);
    expect(result.isSuccess).toBe(true);
    const vo = result.getValue();
    expect(vo.currency).toBe('USD');
    expect(vo.amount).toBe(1000);
    expect(vo.amountInBrl).toBe(5500);
  });

  it('should reject negative amounts', () => {
    const result = MonetaryValue.create(-100);
    expect(result.isFailure).toBe(true);
    expect(result.error).toContain('cannot be negative');
  });

  it('should reject invalid currency codes', () => {
    const result = MonetaryValue.create(100, 'INVALID');
    expect(result.isFailure).toBe(true);
    expect(result.error).toContain('valid 3-letter ISO code');
  });
});
