import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { COMBOBOX_OPTION_REPOSITORY_PORT } from '../../core/domain/settings/combobox-option.repository.port.js';
import { ComboboxOptionOrmEntity } from '../adapters/secondary/persistence/mysql/entities/combobox-option.orm-entity.js';
import { TypeOrmComboboxOptionRepository } from '../adapters/secondary/persistence/mysql/repositories/typeorm-combobox-option.repository.js';
import { GetComboboxOptionsUseCase } from '../../core/application/settings/get-combobox-options.use-case.js';
import { SaveComboboxOptionUseCase } from '../../core/application/settings/save-combobox-option.use-case.js';
import { DeleteComboboxOptionUseCase } from '../../core/application/settings/delete-combobox-option.use-case.js';
import { ResetComboboxOptionsUseCase } from '../../core/application/settings/reset-combobox-options.use-case.js';
import { GetEmailConfigUseCase } from '../../core/application/settings/get-email-config.use-case.js';
import { SaveEmailConfigUseCase } from '../../core/application/settings/save-email-config.use-case.js';
import { SendTestEmailUseCase } from '../../core/application/settings/send-test-email.use-case.js';
import { ComboboxSettingController } from '../adapters/primary/rest/settings/combobox-setting.controller.js';
import { EmailSettingController } from '../adapters/primary/rest/settings/email-setting.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([ComboboxOptionOrmEntity])],
  controllers: [ComboboxSettingController, EmailSettingController],
  providers: [
    {
      provide: COMBOBOX_OPTION_REPOSITORY_PORT,
      useClass: TypeOrmComboboxOptionRepository,
    },
    GetComboboxOptionsUseCase,
    SaveComboboxOptionUseCase,
    DeleteComboboxOptionUseCase,
    ResetComboboxOptionsUseCase,
    GetEmailConfigUseCase,
    SaveEmailConfigUseCase,
    SendTestEmailUseCase,
  ],
  exports: [
    COMBOBOX_OPTION_REPOSITORY_PORT,
    GetComboboxOptionsUseCase,
    GetEmailConfigUseCase,
    SaveEmailConfigUseCase,
  ],
})
export class SettingsModule {}
