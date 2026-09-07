import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard.js';
import { CurrentUser } from '../decorators/current-user.decorator.js';
import { type AccessTokenPayload } from '../../../../../core/application/common/ports/token.port.js';
import {
  CreateCustomerListUseCase,
  ListCustomerListsUseCase,
  GetCustomerListByIdUseCase,
  SendMassEmailUseCase,
} from '../../../../../core/application/customer-list/customer-list.use-cases.js';
import {
  CreateCustomerListDto,
  SendMassEmailDto,
} from './dto/customer-list.dto.js';

@ApiTags('Customer Lists')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: 'customer-lists', version: '1' })
export class CustomerListController {
  constructor(
    private readonly createCustomerListUseCase: CreateCustomerListUseCase,
    private readonly listCustomerListsUseCase: ListCustomerListsUseCase,
    private readonly getCustomerListByIdUseCase: GetCustomerListByIdUseCase,
    private readonly sendMassEmailUseCase: SendMassEmailUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List all pre-created customer lists for the organization' })
  @ApiResponse({ status: 200, description: 'Customer lists retrieved successfully' })
  async list(@CurrentUser() user: AccessTokenPayload) {
    const result = await this.listCustomerListsUseCase.execute(user.orgId);
    if (result.isFailure) {
      throw new BadRequestException(result.error);
    }
    const lists = result.getValue();
    return {
      data: lists.map((l) => ({
        id: l.id,
        name: l.name,
        description: l.description,
        memberCount: l.memberCount,
        customerIds: l.customerIds,
        createdAt: l.createdAt,
        updatedAt: l.updatedAt,
      })),
      total: lists.length,
    };
  }

  @Post()
  @ApiOperation({ summary: 'Create a new customer list segment with optional initial members' })
  @ApiResponse({ status: 201, description: 'Customer list created successfully' })
  async create(
    @CurrentUser() user: AccessTokenPayload,
    @Body() dto: CreateCustomerListDto,
  ) {
    const result = await this.createCustomerListUseCase.execute({
      orgId: user.orgId,
      name: dto.name,
      description: dto.description,
      customerIds: dto.customerIds,
    });

    if (result.isFailure) {
      throw new BadRequestException(result.error);
    }

    const list = result.getValue();
    return {
      id: list.id,
      name: list.name,
      description: list.description,
      memberCount: list.memberCount,
      customerIds: list.customerIds,
      createdAt: list.createdAt,
      updatedAt: list.updatedAt,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get customer list details along with populated member summaries' })
  @ApiResponse({ status: 200, description: 'Customer list retrieved successfully' })
  async getById(
    @CurrentUser() user: AccessTokenPayload,
    @Param('id') id: string,
  ) {
    const result = await this.getCustomerListByIdUseCase.execute(user.orgId, id);
    if (result.isFailure) {
      throw new NotFoundException(result.error);
    }
    return result.getValue();
  }

  @Post(':id/send-mass-email')
  @ApiOperation({
    summary: 'Trigger mass email campaign to all customer contacts in the specified list',
  })
  @ApiResponse({ status: 200, description: 'Mass email campaign executed' })
  async sendMassEmail(
    @CurrentUser() user: AccessTokenPayload,
    @Param('id') id: string,
    @Body() dto: SendMassEmailDto,
  ) {
    const result = await this.sendMassEmailUseCase.execute({
      orgId: user.orgId,
      userId: user.sub,
      customerListId: id,
      subject: dto.subject,
      body: dto.body,
      attachments: dto.attachments,
    });

    if (result.isFailure) {
      throw new BadRequestException(result.error);
    }

    return {
      success: true,
      message: 'Disparo em massa executado com sucesso',
      data: result.getValue(),
    };
  }
}
