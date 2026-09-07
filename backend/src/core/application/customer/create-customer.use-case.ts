import { Inject, Injectable } from '@nestjs/common';
import {
  CUSTOMER_REPOSITORY_PORT,
  type ICustomerRepository,
} from '../../domain/customer/customer.repository.port.js';
import { CACHE_PORT, type ICachePort } from '../common/ports/cache.port.js';
import { Customer } from '../../domain/customer/entities/customer.entity.js';
import { CustomerStatus } from '../../domain/customer/value-objects/customer-status.vo.js';
import { Contact } from '../../domain/customer/entities/contact.entity.js';
import { Result } from '../../domain/common/result.js';
import { v4 as uuidv4 } from 'uuid';

export interface CreateCustomerDto {
  orgId: string;
  assignedOwnerId?: string | null;
  companyName: string;
  industry?: string | null;
  website?: string | null;
  status?: string;
  annualRevenue?: number | null;
  employeeCount?: number | null;
  primaryContact?: {
    firstName: string;
    lastName: string;
    title?: string;
    email: string;
    phone?: string;
  };
}

@Injectable()
export class CreateCustomerUseCase {
  constructor(
    @Inject(CUSTOMER_REPOSITORY_PORT)
    private readonly customerRepository: ICustomerRepository,
    @Inject(CACHE_PORT)
    private readonly cachePort: ICachePort,
  ) {}

  async execute(dto: CreateCustomerDto): Promise<Result<Customer>> {
    const statusResult = CustomerStatus.create(dto.status ?? 'LEAD');
    if (statusResult.isFailure) {
      return Result.fail<Customer>(statusResult.error!);
    }

    const customerId = uuidv4();
    const now = new Date();

    const customerResult = Customer.create(
      {
        orgId: dto.orgId,
        assignedOwnerId: dto.assignedOwnerId,
        companyName: dto.companyName,
        industry: dto.industry,
        website: dto.website,
        status: statusResult.getValue(),
        annualRevenue: dto.annualRevenue,
        employeeCount: dto.employeeCount,
        contacts: [],
        createdAt: now,
        updatedAt: now,
      },
      customerId,
    );

    if (customerResult.isFailure) {
      return Result.fail<Customer>(customerResult.error!);
    }

    const customer = customerResult.getValue();

    if (dto.primaryContact) {
      const contactResult = Contact.create(
        {
          orgId: dto.orgId,
          customerId,
          firstName: dto.primaryContact.firstName,
          lastName: dto.primaryContact.lastName,
          title: dto.primaryContact.title,
          email: dto.primaryContact.email,
          phone: dto.primaryContact.phone,
          isPrimary: true,
          createdAt: now,
          updatedAt: now,
        },
        uuidv4(),
      );

      if (contactResult.isFailure) {
        return Result.fail<Customer>(contactResult.error!);
      }
      customer.addContact(contactResult.getValue());
    }

    await this.customerRepository.save(customer);

    // Evict any org customer list caches
    await this.cachePort.delPattern(`cache:org:${dto.orgId}:cust:*`);

    return Result.ok<Customer>(customer);
  }
}
