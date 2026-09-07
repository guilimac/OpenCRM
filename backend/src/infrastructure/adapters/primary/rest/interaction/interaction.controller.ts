import {
  Controller,
  Get,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard.js';
import { CurrentUser } from '../decorators/current-user.decorator.js';
import { type AccessTokenPayload } from '../../../../../core/application/common/ports/token.port.js';
import { ListInteractionsUseCase } from '../../../../../core/application/interaction/list-interactions.use-case.js';

@ApiTags('Interactions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: 'interactions', version: '1' })
export class InteractionController {
  constructor(
    private readonly listInteractionsUseCase: ListInteractionsUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List all interactions / customer activities for the organization' })
  @ApiResponse({ status: 200, description: 'Interactions retrieved successfully' })
  async list(@CurrentUser() user: AccessTokenPayload) {
    const result = await this.listInteractionsUseCase.execute(user.orgId);
    if (result.isFailure) {
      throw new BadRequestException(result.error);
    }
    return result.getValue().map((interaction) => ({
      id: interaction.id,
      userId: interaction.userId,
      customerId: interaction.customerId,
      contactId: interaction.contactId,
      opportunityId: interaction.opportunityId,
      type: interaction.type,
      subject: interaction.subject,
      description: interaction.description,
      outcome: interaction.outcome,
      scheduledAt: interaction.scheduledAt,
      completedAt: interaction.completedAt,
      createdAt: interaction.createdAt,
      updatedAt: interaction.updatedAt,
    }));
  }
}
