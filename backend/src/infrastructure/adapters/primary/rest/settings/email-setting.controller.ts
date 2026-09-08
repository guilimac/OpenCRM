import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Put,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard.js';
import { CurrentUser } from '../decorators/current-user.decorator.js';
import { type AccessTokenPayload } from '../../../../../core/application/common/ports/token.port.js';
import { GetEmailConfigUseCase } from '../../../../../core/application/settings/get-email-config.use-case.js';
import { SaveEmailConfigUseCase } from '../../../../../core/application/settings/save-email-config.use-case.js';
import { SendTestEmailUseCase } from '../../../../../core/application/settings/send-test-email.use-case.js';
import { SaveEmailConfigDto, SendTestEmailDto } from './dto/email-config.dto.js';

@ApiTags('Settings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: 'settings/email', version: '1' })
export class EmailSettingController {
  constructor(
    private readonly getEmailConfigUseCase: GetEmailConfigUseCase,
    private readonly saveEmailConfigUseCase: SaveEmailConfigUseCase,
    private readonly sendTestEmailUseCase: SendTestEmailUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get current organization email server configuration' })
  @ApiResponse({ status: 200, description: 'Email configuration loaded with masked secrets' })
  async getEmailConfig(@CurrentUser() user: AccessTokenPayload) {
    const result = await this.getEmailConfigUseCase.execute(user.orgId);
    if (result.isFailure) {
      throw new BadRequestException(result.error);
    }
    return result.getValue();
  }

  @Put()
  @ApiOperation({ summary: 'Save or update organization email server configuration' })
  @ApiResponse({ status: 200, description: 'Email configuration saved successfully' })
  async saveEmailConfig(
    @CurrentUser() user: AccessTokenPayload,
    @Body() dto: SaveEmailConfigDto,
  ) {
    const result = await this.saveEmailConfigUseCase.execute({
      orgId: user.orgId,
      ...dto,
    });
    if (result.isFailure) {
      throw new BadRequestException(result.error);
    }
    return result.getValue();
  }

  @Post('test')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send a test email using current or provided server credentials' })
  @ApiResponse({ status: 200, description: 'Test email successfully dispatched' })
  @ApiResponse({ status: 400, description: 'Failed to connect or send email' })
  async sendTestEmail(
    @CurrentUser() user: AccessTokenPayload,
    @Body() dto: SendTestEmailDto,
  ) {
    const result = await this.sendTestEmailUseCase.execute({
      orgId: user.orgId,
      ...dto,
    });
    if (result.isFailure) {
      throw new BadRequestException(result.error);
    }
    return result.getValue();
  }
}
