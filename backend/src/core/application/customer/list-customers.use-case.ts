import { Inject, Injectable } from '@nestjs/common';
import {
  CUSTOMER_REPOSITORY_PORT,
  type ICustomerRepository,
  type CustomerFindOptions,
  type PaginatedResult,
} from '../../domain/customer/customer.repository.port.js';
import { Customer } from '../../domain/customer/entities/customer.entity.js';
import { Result } from '../../domain/common/result.js';

@Injectable()
export class ListCustomersUseCase {
  constructor(
    @Inject(CUSTOMER_REPOSITORY_PORT)
    private readonly customerRepository: ICustomerRepository,
  ) {}

  async execute(
    orgId: string,
    options: CustomerFindOptions,
  ): Promise<Result<PaginatedResult<Customer>>> {
    const page = options.page && options.page > 0 ? options.page : 1;
    const limit = options.limit && options.limit > 0 && options.limit <= 100 ? options.limit : 10;

    const result = await this.customerRepository.findMany(orgId, {
      ...options,
      page,
      limit,
    });

    return Result.ok<PaginatedResult<Customer>>(result);
  }
}
