import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  type ICustomerListRepository,
} from '../../../../../../core/domain/customer-list/customer-list.repository.port.js';
import { CustomerList } from '../../../../../../core/domain/customer-list/customer-list.entity.js';
import { CustomerListOrmEntity } from '../entities/customer-list.orm-entity.js';
import { CustomerListMemberOrmEntity } from '../entities/customer-list-member.orm-entity.js';
import { CustomerListMapper } from '../mappers/customer-list.mapper.js';

@Injectable()
export class TypeOrmCustomerListRepository implements ICustomerListRepository {
  constructor(
    @InjectRepository(CustomerListOrmEntity)
    private readonly listRepo: Repository<CustomerListOrmEntity>,
    @InjectRepository(CustomerListMemberOrmEntity)
    private readonly memberRepo: Repository<CustomerListMemberOrmEntity>,
  ) {}

  async findById(orgId: string, id: string): Promise<CustomerList | null> {
    const orm = await this.listRepo.findOne({
      where: { orgId, id },
      relations: { members: true },
    });
    return orm ? CustomerListMapper.toDomain(orm) : null;
  }

  async findByOrg(orgId: string): Promise<CustomerList[]> {
    const orms = await this.listRepo.find({
      where: { orgId },
      relations: { members: true },
      order: { createdAt: 'DESC' },
    });
    return orms.map((orm) => CustomerListMapper.toDomain(orm));
  }

  async save(list: CustomerList): Promise<void> {
    const orm = CustomerListMapper.toOrm(list);
    await this.listRepo.save(orm);
  }

  async update(list: CustomerList): Promise<void> {
    const orm = CustomerListMapper.toOrm(list);
    await this.memberRepo.delete({ listId: list.id });
    await this.listRepo.save(orm);
  }

  async delete(orgId: string, id: string): Promise<void> {
    await this.memberRepo.delete({ listId: id });
    await this.listRepo.delete({ orgId, id });
  }
}
