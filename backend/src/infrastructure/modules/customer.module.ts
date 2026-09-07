import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CUSTOMER_REPOSITORY_PORT } from '../../core/domain/customer/customer.repository.port.js';
import { CustomerOrmEntity } from '../adapters/secondary/persistence/mysql/entities/customer.orm-entity.js';
import { ContactOrmEntity } from '../adapters/secondary/persistence/mysql/entities/contact.orm-entity.js';
import { TypeOrmCustomerRepository } from '../adapters/secondary/persistence/mysql/repositories/typeorm-customer.repository.js';
import { CreateCustomerUseCase } from '../../core/application/customer/create-customer.use-case.js';
import { GetCustomerByIdUseCase } from '../../core/application/customer/get-customer-by-id.use-case.js';
import { ListCustomersUseCase } from '../../core/application/customer/list-customers.use-case.js';
import { CustomerController } from '../adapters/primary/rest/customer/customer.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([CustomerOrmEntity, ContactOrmEntity])],
  controllers: [CustomerController],
  providers: [
    {
      provide: CUSTOMER_REPOSITORY_PORT,
      useClass: TypeOrmCustomerRepository,
    },
    CreateCustomerUseCase,
    GetCustomerByIdUseCase,
    ListCustomersUseCase,
  ],
  exports: [CUSTOMER_REPOSITORY_PORT],
})
export class CustomerModule {}
