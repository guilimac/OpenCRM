import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CUSTOMER_REPOSITORY_PORT } from '../../core/domain/customer/customer.repository.port.js';
import { CUSTOMER_LIST_REPOSITORY_PORT } from '../../core/domain/customer-list/customer-list.repository.port.js';
import { INTERACTION_REPOSITORY_PORT } from '../../core/domain/interaction/interaction.repository.port.js';
import { CustomerOrmEntity } from '../adapters/secondary/persistence/mysql/entities/customer.orm-entity.js';
import { ContactOrmEntity } from '../adapters/secondary/persistence/mysql/entities/contact.orm-entity.js';
import { CustomerListOrmEntity } from '../adapters/secondary/persistence/mysql/entities/customer-list.orm-entity.js';
import { CustomerListMemberOrmEntity } from '../adapters/secondary/persistence/mysql/entities/customer-list-member.orm-entity.js';
import { InteractionOrmEntity } from '../adapters/secondary/persistence/mysql/entities/interaction.orm-entity.js';
import { TypeOrmCustomerRepository } from '../adapters/secondary/persistence/mysql/repositories/typeorm-customer.repository.js';
import { TypeOrmCustomerListRepository } from '../adapters/secondary/persistence/mysql/repositories/typeorm-customer-list.repository.js';
import { TypeOrmInteractionRepository } from '../adapters/secondary/persistence/mysql/repositories/typeorm-interaction.repository.js';
import { CreateCustomerUseCase } from '../../core/application/customer/create-customer.use-case.js';
import { GetCustomerByIdUseCase } from '../../core/application/customer/get-customer-by-id.use-case.js';
import { ListCustomersUseCase } from '../../core/application/customer/list-customers.use-case.js';
import { SendEmailToCustomerUseCase } from '../../core/application/customer/send-email-to-customer.use-case.js';
import {
  CreateCustomerListUseCase,
  ListCustomerListsUseCase,
  GetCustomerListByIdUseCase,
  SendMassEmailUseCase,
} from '../../core/application/customer-list/customer-list.use-cases.js';
import { CustomerController } from '../adapters/primary/rest/customer/customer.controller.js';
import { CustomerListController } from '../adapters/primary/rest/customer-list/customer-list.controller.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CustomerOrmEntity,
      ContactOrmEntity,
      CustomerListOrmEntity,
      CustomerListMemberOrmEntity,
      InteractionOrmEntity,
    ]),
  ],
  controllers: [CustomerController, CustomerListController],
  providers: [
    {
      provide: CUSTOMER_REPOSITORY_PORT,
      useClass: TypeOrmCustomerRepository,
    },
    {
      provide: CUSTOMER_LIST_REPOSITORY_PORT,
      useClass: TypeOrmCustomerListRepository,
    },
    {
      provide: INTERACTION_REPOSITORY_PORT,
      useClass: TypeOrmInteractionRepository,
    },
    CreateCustomerUseCase,
    GetCustomerByIdUseCase,
    ListCustomersUseCase,
    SendEmailToCustomerUseCase,
    CreateCustomerListUseCase,
    ListCustomerListsUseCase,
    GetCustomerListByIdUseCase,
    SendMassEmailUseCase,
  ],
  exports: [
    CUSTOMER_REPOSITORY_PORT,
    CUSTOMER_LIST_REPOSITORY_PORT,
    INTERACTION_REPOSITORY_PORT,
  ],
})
export class CustomerModule {}
