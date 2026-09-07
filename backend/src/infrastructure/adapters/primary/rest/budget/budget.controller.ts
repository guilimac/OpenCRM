import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard.js';
import { CurrentUser } from '../decorators/current-user.decorator.js';
import { type AccessTokenPayload } from '../../../../../core/application/common/ports/token.port.js';
import { CreateBudgetUseCase } from '../../../../../core/application/budget/create-budget.use-case.js';
import { ListBudgetsUseCase } from '../../../../../core/application/budget/list-budgets.use-case.js';
import { GetBudgetByIdUseCase } from '../../../../../core/application/budget/get-budget-by-id.use-case.js';
import { UpdateBudgetStatusUseCase } from '../../../../../core/application/budget/update-budget-status.use-case.js';
import { DeleteBudgetUseCase } from '../../../../../core/application/budget/delete-budget.use-case.js';
import { CreateBudgetDto, UpdateBudgetStatusDto, BudgetQueryDto } from './dto/budget.dto.js';

@ApiTags('Budgets & Quotes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: 'budgets', version: '1' })
export class BudgetController {
  constructor(
    private readonly createBudgetUseCase: CreateBudgetUseCase,
    private readonly listBudgetsUseCase: ListBudgetsUseCase,
    private readonly getBudgetByIdUseCase: GetBudgetByIdUseCase,
    private readonly updateBudgetStatusUseCase: UpdateBudgetStatusUseCase,
    private readonly deleteBudgetUseCase: DeleteBudgetUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new budget / quote with item calculations' })
  @ApiResponse({ status: 201, description: 'Budget created successfully' })
  async create(
    @CurrentUser() user: AccessTokenPayload,
    @Body() dto: CreateBudgetDto,
  ) {
    const result = await this.createBudgetUseCase.execute({
      ...dto,
      orgId: user.orgId,
    });

    if (result.isFailure) {
      throw new BadRequestException(result.error);
    }

    const b = result.getValue();
    return this.mapToResponse(b);
  }

  @Get()
  @ApiOperation({ summary: 'List all budgets with item summaries and filters' })
  async list(
    @CurrentUser() user: AccessTokenPayload,
    @Query() query: BudgetQueryDto,
  ) {
    const result = await this.listBudgetsUseCase.execute(user.orgId, {
      customerId: query.customerId,
      opportunityId: query.opportunityId,
      status: query.status,
      search: query.search,
    });

    if (result.isFailure) {
      throw new BadRequestException(result.error);
    }

    return result.getValue().map((b) => this.mapToResponse(b));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get budget details by ID' })
  async getById(
    @CurrentUser() user: AccessTokenPayload,
    @Param('id') id: string,
  ) {
    const result = await this.getBudgetByIdUseCase.execute(user.orgId, id);
    if (result.isFailure) {
      throw new NotFoundException(result.error);
    }

    return this.mapToResponse(result.getValue());
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update budget status (DRAFT, SENT, APPROVED, REJECTED, EXPIRED)' })
  async updateStatus(
    @CurrentUser() user: AccessTokenPayload,
    @Param('id') id: string,
    @Body() dto: UpdateBudgetStatusDto,
  ) {
    const result = await this.updateBudgetStatusUseCase.execute({
      orgId: user.orgId,
      id,
      status: dto.status,
    });

    if (result.isFailure) {
      throw new BadRequestException(result.error);
    }

    return this.mapToResponse(result.getValue());
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a budget' })
  async delete(
    @CurrentUser() user: AccessTokenPayload,
    @Param('id') id: string,
  ) {
    const result = await this.deleteBudgetUseCase.execute(user.orgId, id);
    if (result.isFailure) {
      throw new NotFoundException(result.error);
    }
    return { success: true, message: 'Orçamento excluído com sucesso' };
  }

  private mapToResponse(b: any) {
    return {
      id: b.id,
      budgetNumber: b.budgetNumber,
      title: b.title,
      customerId: b.customerId,
      opportunityId: b.opportunityId,
      status: b.status.value,
      issueDate: b.issueDate,
      validUntil: b.validUntil,
      subtotal: b.subtotal,
      discountAmount: b.discountAmount,
      totalAmount: b.totalAmount,
      currency: b.currency,
      paymentTerms: b.paymentTerms,
      notes: b.notes,
      items: b.items.map((item: any) => ({
        id: item.id,
        productId: item.productId,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discountPercent: item.discountPercent,
        total: item.total,
      })),
      createdAt: b.createdAt,
      updatedAt: b.updatedAt,
    };
  }
}
