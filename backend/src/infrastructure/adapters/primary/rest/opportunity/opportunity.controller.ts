import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateOpportunityUseCase } from '../../../../../core/application/opportunity/create-opportunity.use-case.js';
import { UpdateOpportunityStageUseCase } from '../../../../../core/application/opportunity/update-opportunity-stage.use-case.js';
import { GetPipelineSummaryUseCase } from '../../../../../core/application/opportunity/get-pipeline-summary.use-case.js';
import { JwtAuthGuard } from '../guards/jwt-auth.guard.js';
import { CurrentUser } from '../decorators/current-user.decorator.js';
import { type AccessTokenPayload } from '../../../../../core/application/common/ports/token.port.js';
import {
  CreateOpportunityRequestDto,
  UpdateOpportunityStageRequestDto,
} from './dto/opportunity.dto.js';

@ApiTags('Opportunities & Pipeline')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: 'opportunities', version: '1' })
export class OpportunityController {
  constructor(
    private readonly createOpportunityUseCase: CreateOpportunityUseCase,
    private readonly updateOpportunityStageUseCase: UpdateOpportunityStageUseCase,
    private readonly getPipelineSummaryUseCase: GetPipelineSummaryUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new sales opportunity (Multi-currency with BRL base)' })
  @ApiResponse({ status: 201, description: 'Opportunity created successfully' })
  async create(
    @CurrentUser() user: AccessTokenPayload,
    @Body() dto: CreateOpportunityRequestDto,
  ) {
    const result = await this.createOpportunityUseCase.execute({
      ...dto,
      orgId: user.orgId,
      ownerId: user.sub,
    });

    if (result.isFailure) {
      throw new BadRequestException(result.error);
    }

    const opp = result.getValue();
    return {
      id: opp.id,
      title: opp.title,
      customerId: opp.customerId,
      ownerId: opp.ownerId,
      amount: opp.monetaryValue.amount,
      currency: opp.monetaryValue.currency,
      exchangeRateToBrl: opp.monetaryValue.exchangeRateToBrl,
      amountInBrl: opp.monetaryValue.amountInBrl,
      stage: opp.stage.value,
      probability: opp.stage.probability,
      weightedValueInBrl: opp.weightedValueInBrl,
      expectedCloseDate: opp.expectedCloseDate,
      createdAt: opp.createdAt,
    };
  }

  @Patch(':id/stage')
  @ApiOperation({ summary: 'Update opportunity stage (Validates loss reason for CLOSED_LOST)' })
  async updateStage(
    @CurrentUser() user: AccessTokenPayload,
    @Param('id') id: string,
    @Body() dto: UpdateOpportunityStageRequestDto,
  ) {
    const result = await this.updateOpportunityStageUseCase.execute({
      orgId: user.orgId,
      opportunityId: id,
      stage: dto.stage,
      lossReason: dto.lossReason,
    });

    if (result.isFailure) {
      throw new BadRequestException(result.error);
    }

    const opp = result.getValue();
    return {
      id: opp.id,
      title: opp.title,
      stage: opp.stage.value,
      probability: opp.stage.probability,
      closedAt: opp.closedAt,
      lossReason: opp.lossReason,
      updatedAt: opp.updatedAt,
    };
  }

  @Get('pipeline-summary')
  @ApiOperation({ summary: 'Get aggregate pipeline metrics in BRL (Redis cached)' })
  async getPipelineSummary(@CurrentUser() user: AccessTokenPayload) {
    const result = await this.getPipelineSummaryUseCase.execute(user.orgId);
    if (result.isFailure) {
      throw new BadRequestException(result.error);
    }
    return result.getValue();
  }
}
