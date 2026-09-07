import { Inject, Injectable } from '@nestjs/common';
import {
  CUSTOMER_REPOSITORY_PORT,
  type ICustomerRepository,
} from '../../domain/customer/customer.repository.port.js';
import { CACHE_PORT, type ICachePort } from '../common/ports/cache.port.js';
import { Customer } from '../../domain/customer/entities/customer.entity.js';
import { Result } from '../../domain/common/result.js';

export interface Customer360View {
  id: string;
  orgId: string;
  assignedOwnerId?: string | null;
  companyName: string;
  industry?: string | null;
  website?: string | null;
  status: string;
  annualRevenue?: number | null;
  employeeCount?: number | null;
  contacts: Array<{
    id: string;
    firstName: string;
    lastName: string;
    fullName: string;
    title?: string | null;
    email: string;
    phone?: string | null;
    isPrimary: boolean;
  }>;
  createdAt: string;
  updatedAt: string;
}

@Injectable()
export class GetCustomerByIdUseCase {
  constructor(
    @Inject(CUSTOMER_REPOSITORY_PORT)
    private readonly customerRepository: ICustomerRepository,
    @Inject(CACHE_PORT)
    private readonly cachePort: ICachePort,
  ) {}

  async execute(orgId: string, id: string): Promise<Result<Customer360View>> {
    const cacheKey = `cache:org:${orgId}:cust:${id}`;
    const cached = await this.cachePort.get<Customer360View>(cacheKey);
    if (cached) {
      return Result.ok<Customer360View>(cached);
    }

    const customer = await this.customerRepository.findById(orgId, id);
    if (!customer) {
      return Result.fail<Customer360View>('Customer not found');
    }

    const view: Customer360View = {
      id: customer.id,
      orgId: customer.orgId,
      assignedOwnerId: customer.assignedOwnerId,
      companyName: customer.companyName,
      industry: customer.industry,
      website: customer.website,
      status: customer.status.value,
      annualRevenue: customer.annualRevenue,
      employeeCount: customer.employeeCount,
      contacts: customer.contacts.map((c) => ({
        id: c.id,
        firstName: c.firstName,
        lastName: c.lastName,
        fullName: c.fullName,
        title: c.title,
        email: c.email,
        phone: c.phone,
        isPrimary: c.isPrimary,
      })),
      createdAt: customer.createdAt.toISOString(),
      updatedAt: customer.updatedAt.toISOString(),
    };

    // Cache-aside: 15 minutes TTL (900 seconds)
    await this.cachePort.set(cacheKey, view, 900);

    return Result.ok<Customer360View>(view);
  }
}
