import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonInfrastructureModule } from './infrastructure/modules/common-infrastructure.module.js';
import { AuthModule } from './infrastructure/modules/auth.module.js';
import { CustomerModule } from './infrastructure/modules/customer.module.js';
import { OpportunityModule } from './infrastructure/modules/opportunity.module.js';
import { HealthController } from './infrastructure/adapters/primary/rest/health/health.controller.js';
import { UserOrmEntity } from './infrastructure/adapters/secondary/persistence/mysql/entities/user.orm-entity.js';
import { CustomerOrmEntity } from './infrastructure/adapters/secondary/persistence/mysql/entities/customer.orm-entity.js';
import { ContactOrmEntity } from './infrastructure/adapters/secondary/persistence/mysql/entities/contact.orm-entity.js';
import { OpportunityOrmEntity } from './infrastructure/adapters/secondary/persistence/mysql/entities/opportunity.orm-entity.js';
import { InteractionOrmEntity } from './infrastructure/adapters/secondary/persistence/mysql/entities/interaction.orm-entity.js';
import { CustomerListOrmEntity } from './infrastructure/adapters/secondary/persistence/mysql/entities/customer-list.orm-entity.js';
import { CustomerListMemberOrmEntity } from './infrastructure/adapters/secondary/persistence/mysql/entities/customer-list-member.orm-entity.js';
import { ProductOrmEntity } from './infrastructure/adapters/secondary/persistence/mysql/entities/product.orm-entity.js';
import { BudgetOrmEntity } from './infrastructure/adapters/secondary/persistence/mysql/entities/budget.orm-entity.js';
import { BudgetItemOrmEntity } from './infrastructure/adapters/secondary/persistence/mysql/entities/budget-item.orm-entity.js';
import { ProductModule } from './infrastructure/modules/product.module.js';
import { BudgetModule } from './infrastructure/modules/budget.module.js';
import { ComboboxOptionOrmEntity } from './infrastructure/adapters/secondary/persistence/mysql/entities/combobox-option.orm-entity.js';
import { EmailConfigOrmEntity } from './infrastructure/adapters/secondary/persistence/mysql/entities/email-config.orm-entity.js';
import { SettingsModule } from './infrastructure/modules/settings.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../.env'],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get<string>('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 3306),
        username: config.get<string>('DB_USER', 'crm_user'),
        password: config.get<string>('DB_PASSWORD', 'crm_password'),
        database: config.get<string>('DB_NAME', 'opencrm'),
        entities: [
          UserOrmEntity,
          CustomerOrmEntity,
          ContactOrmEntity,
          OpportunityOrmEntity,
          InteractionOrmEntity,
          CustomerListOrmEntity,
          CustomerListMemberOrmEntity,
          ProductOrmEntity,
          BudgetOrmEntity,
          BudgetItemOrmEntity,
          ComboboxOptionOrmEntity,
          EmailConfigOrmEntity,
        ],
        synchronize: config.get<string>('DB_SYNCHRONIZE', 'true') === 'true',
        logging: config.get<string>('DB_LOGGING', 'false') === 'true',
        extra: {
          connectionLimit: 25, // Connection pool
        },
      }),
    }),
    CommonInfrastructureModule,
    AuthModule,
    CustomerModule,
    OpportunityModule,
    ProductModule,
    BudgetModule,
    SettingsModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
