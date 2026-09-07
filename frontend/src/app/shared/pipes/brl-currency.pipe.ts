import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'brlCurrency',
  standalone: true,
})
export class BrlCurrencyPipe implements PipeTransform {
  transform(value: number | null | undefined, currency = 'BRL'): string {
    if (value === null || value === undefined || isNaN(value)) {
      return 'R$ 0,00';
    }

    if (currency === 'BRL') {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(value);
    }

    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(value);
  }
}
