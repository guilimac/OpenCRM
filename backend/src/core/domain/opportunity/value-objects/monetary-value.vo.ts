import { ValueObject } from '../../common/value-object.base.js';
import { Result } from '../../common/result.js';

export interface MonetaryValueProps {
  amount: number;
  currency: string;
  exchangeRateToBrl: number; // 1.0 for BRL, e.g. 5.50 for USD -> BRL
}

export class MonetaryValue extends ValueObject<MonetaryValueProps> {
  get amount(): number {
    return this.props.amount;
  }

  get currency(): string {
    return this.props.currency;
  }

  get exchangeRateToBrl(): number {
    return this.props.exchangeRateToBrl;
  }

  /**
   * Calculates the equivalent normalized amount in Brazilian Real (BRL)
   */
  get amountInBrl(): number {
    return Math.round(this.props.amount * this.props.exchangeRateToBrl * 100) / 100;
  }

  public static create(
    amount: number,
    currency = 'BRL',
    exchangeRateToBrl = 1.0,
  ): Result<MonetaryValue> {
    if (amount < 0) {
      return Result.fail<MonetaryValue>('Amount cannot be negative');
    }
    const cleanCurrency = currency.toUpperCase().trim();
    if (cleanCurrency.length !== 3) {
      return Result.fail<MonetaryValue>('Currency must be a valid 3-letter ISO code (e.g. BRL, USD, EUR)');
    }
    if (exchangeRateToBrl <= 0) {
      return Result.fail<MonetaryValue>('Exchange rate must be greater than zero');
    }

    return Result.ok<MonetaryValue>(
      new MonetaryValue({
        amount: Math.round(amount * 100) / 100,
        currency: cleanCurrency,
        exchangeRateToBrl,
      }),
    );
  }
}
