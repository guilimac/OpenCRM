import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  type ICustomerRepository,
  type CustomerFindOptions,
  type PaginatedResult,
} from '../../../../../../core/domain/customer/customer.repository.port.js';
import { Customer } from '../../../../../../core/domain/customer/entities/customer.entity.js';
import { CustomerOrmEntity } from '../entities/customer.orm-entity.js';
import { CustomerMapper } from '../mappers/customer.mapper.js';

@Injectable()
export class TypeOrmCustomerRepository implements ICustomerRepository {
  constructor(
    @InjectRepository(CustomerOrmEntity)
    private readonly repo: Repository<CustomerOrmEntity>,
  ) {}

  async findById(orgId: string, id: string): Promise<Customer | null> {
    const orm = await this.repo.findOne({
      where: { orgId, id },
      relations: { contacts: true },
    });
    return orm ? CustomerMapper.toDomain(orm) : null;
  }

  async findMany(orgId: string, options: CustomerFindOptions): Promise<PaginatedResult<Customer>> {
    const page = options.page && options.page > 0 ? options.page : 1;
    const limit = options.limit && options.limit > 0 ? options.limit : 10;
    const skip = (page - 1) * limit;

    const query = this.repo
      .createQueryBuilder('customer')
      .leftJoinAndSelect('customer.contacts', 'contacts')
      .where('customer.orgId = :orgId', { orgId });

    if (options.status) {
      query.andWhere('customer.status = :status', { status: options.status });
    }

    if (options.assignedOwnerId) {
      query.andWhere('customer.assignedOwnerId = :ownerId', { ownerId: options.assignedOwnerId });
    }

    if (options.search) {
      query.andWhere('(customer.companyName LIKE :search OR customer.industry LIKE :search)', {
        search: `%${options.search}%`,
      });
    }

    query.orderBy('customer.createdAt', 'DESC').skip(skip).take(limit);

    const [items, total] = await query.getManyAndCount();

    return {
      data: items.map((item) => CustomerMapper.toDomain(item)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async save(customer: Customer): Promise<void> {
    const orm = CustomerMapper.toOrm(customer);
    await this.repo.save(orm);
  }

  async update(customer: Customer): Promise<void> {
    const orm = CustomerMapper.toOrm(customer);
    await this.repo.save(orm);
  }

  async delete(orgId: string, id: string): Promise<void> {
    await this.repo.delete({ orgId, id });
  }
}
