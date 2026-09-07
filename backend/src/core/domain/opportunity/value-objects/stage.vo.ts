import { ValueObject } from '../../common/value-object.base.js';
import { Result } from '../../common/result.js';

export type OpportunityStageType =
  | 'DISCOVERY'
  | 'QUALIFICATION'
  | 'PROPOSAL'
  | 'NEGOTIATION'
  | 'CLOSED_WON'
  | 'CLOSED_LOST';

export class OpportunityStage extends ValueObject<{ value: OpportunityStageType; probability: number }> {
  private static readonly STAGE_PROBABILITIES: Record<OpportunityStageType, number> = {
    DISCOVERY: 10,
    QUALIFICATION: 25,
    PROPOSAL: 50,
    NEGOTIATION: 75,
    CLOSED_WON: 100,
    CLOSED_LOST: 0,
  };

  get value(): OpportunityStageType {
    return this.props.value;
  }

  get probability(): number {
    return this.props.probability;
  }

  get isClosed(): boolean {
    return this.props.value === 'CLOSED_WON' || this.props.value === 'CLOSED_LOST';
  }

  get isWon(): boolean {
    return this.props.value === 'CLOSED_WON';
  }

  public static create(stageName: string, customProbability?: number): Result<OpportunityStage> {
    const uppercase = stageName.toUpperCase() as OpportunityStageType;
    if (!(uppercase in this.STAGE_PROBABILITIES)) {
      return Result.fail<OpportunityStage>(
        `Invalid opportunity stage: ${stageName}. Must be one of: ${Object.keys(this.STAGE_PROBABILITIES).join(', ')}`,
      );
    }

    const defaultProb = this.STAGE_PROBABILITIES[uppercase];
    const probability = customProbability !== undefined ? customProbability : defaultProb;

    if (probability < 0 || probability > 100) {
      return Result.fail<OpportunityStage>('Probability must be between 0 and 100');
    }

    return Result.ok<OpportunityStage>(new OpportunityStage({ value: uppercase, probability }));
  }
}
