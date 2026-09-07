import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateCustomerUseCase } from '../../../../../core/application/customer/create-customer.use-case.js';
import { GetCustomerByIdUseCase } from '../../../../../core/application/customer/get-customer-by-id.use-case.js';
import { ListCustomersUseCase } from '../../../../../core/application/customer/list-customers.use-case.js';
import { SendEmailToCustomerUseCase } from '../../../../../core/application/customer/send-email-to-customer.use-case.js';
import { JwtAuthGuard } from '../guards/jwt-auth.guard.js';
import { CurrentUser } from '../decorators/current-user.decorator.js';
import { type AccessTokenPayload } from '../../../../../core/application/common/ports/token.port.js';
import {
  CreateCustomerRequestDto,
  CustomerQueryDto,
  SendCustomerEmailRequestDto,
} from './dto/customer.dto.js';

@ApiTags('Customers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: 'customers', version: '1' })
export class CustomerController {
  constructor(
    private readonly createCustomerUseCase: CreateCustomerUseCase,
    private readonly getCustomerByIdUseCase: GetCustomerByIdUseCase,
    private readonly listCustomersUseCase: ListCustomersUseCase,
    private readonly sendEmailToCustomerUseCase: SendEmailToCustomerUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new customer account with optional primary contact' })
  @ApiResponse({ status: 201, description: 'Customer created successfully' })
  async create(
    @CurrentUser() user: AccessTokenPayload,
    @Body() dto: CreateCustomerRequestDto,
  ) {
    const result = await this.createCustomerUseCase.execute({
      ...dto,
      orgId: user.orgId,
      assignedOwnerId: user.sub,
    });

    if (result.isFailure) {
      throw new BadRequestException(result.error);
    }

    const customer = result.getValue();
    return {
      id: customer.id,
      companyName: customer.companyName,
      status: customer.status.value,
      industry: customer.industry,
      website: customer.website,
      annualRevenue: customer.annualRevenue,
      employeeCount: customer.employeeCount,
      createdAt: customer.createdAt,
    };
  }

  @Get()
  @ApiOperation({ summary: 'List customer accounts with server pagination and filtering' })
  async list(
    @CurrentUser() user: AccessTokenPayload,
    @Query() query: CustomerQueryDto,
  ) {
    const result = await this.listCustomersUseCase.execute(user.orgId, {
      page: query.page,
      limit: query.limit,
      search: query.search,
      status: query.status,
    });

    if (result.isFailure) {
      throw new BadRequestException(result.error);
    }

    const paginated = result.getValue();
    return {
      data: paginated.data.map((c) => ({
        id: c.id,
        companyName: c.companyName,
        status: c.status.value,
        industry: c.industry,
        website: c.website,
        annualRevenue: c.annualRevenue,
        employeeCount: c.employeeCount,
        contactCount: c.contacts.length,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      })),
      total: paginated.total,
      page: paginated.page,
      limit: paginated.limit,
      totalPages: paginated.totalPages,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get Customer 360 profile by ID (Redis cache-aside)' })
  async getById(
    @CurrentUser() user: AccessTokenPayload,
    @Param('id') id: string,
  ) {
    const result = await this.getCustomerByIdUseCase.execute(user.orgId, id);
    if (result.isFailure) {
      throw new NotFoundException(result.error);
    }
    return result.getValue();
  }

  @Post(':id/send-email')
  @ApiOperation({ summary: 'Send direct email to customer contact and log interaction' })
  @ApiResponse({ status: 200, description: 'Email sent successfully' })
  async sendEmail(
    @CurrentUser() user: AccessTokenPayload,
    @Param('id') id: string,
    @Body() dto: SendCustomerEmailRequestDto,
  ) {
    const result = await this.sendEmailToCustomerUseCase.execute({
      orgId: user.orgId,
      userId: user.sub,
      customerId: id,
      contactId: dto.contactId,
      recipientEmail: dto.recipientEmail,
      subject: dto.subject,
      body: dto.body,
      attachments: dto.attachments,
    });

    if (result.isFailure) {
      throw new BadRequestException(result.error);
    }

    return {
      success: true,
      message: 'Email enviado com sucesso',
      data: result.getValue(),
    };
  }
}

