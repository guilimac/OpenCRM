import { BrlCurrencyPipe } from './brl-currency.pipe';

describe('BrlCurrencyPipe', () => {
  let pipe: BrlCurrencyPipe;

  beforeEach(() => {
    pipe = new BrlCurrencyPipe();
  });

  it('should format numbers in BRL format correctly', () => {
    const formatted = pipe.transform(1500.5, 'BRL');
    // Note: Intl format in pt-BR outputs non-breaking space or regular space
    expect(formatted).toContain('1.500,50');
    expect(formatted).toContain('R$');
  });

  it('should return default formatted zero for null or undefined', () => {
    expect(pipe.transform(null)).toBe('R$ 0,00');
    expect(pipe.transform(undefined)).toBe('R$ 0,00');
  });

  it('should format USD when specified', () => {
    const formatted = pipe.transform(2500, 'USD');
    expect(formatted).toContain('$2,500.00');
  });
});
