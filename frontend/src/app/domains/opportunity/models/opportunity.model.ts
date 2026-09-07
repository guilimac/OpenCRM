export type OpportunityStage =
  | 'DISCOVERY'
  | 'QUALIFICATION'
  | 'PROPOSAL'
  | 'NEGOTIATION'
  | 'CLOSED_WON'
  | 'CLOSED_LOST';

export interface OpportunityItem {
  id: string;
  title: string;
  customerId: string;
  customerName?: string;
  ownerId: string;
  amount: number;
  currency: string;
  exchangeRateToBrl: number;
  amountInBrl: number;
  stage: OpportunityStage;
  probability: number;
  weightedValueInBrl: number;
  expectedCloseDate: string;
  lossReason?: string | null;
  createdAt: string;
}

export interface PipelineStageSummary {
  stage: OpportunityStage;
  count: number;
  totalAmountInBrl: number;
  weightedAmountInBrl: number;
}

export interface PipelineSummaryResponse {
  currency: string;
  totalPipelineValueInBrl: number;
  totalWeightedValueInBrl: number;
  stages: PipelineStageSummary[];
}

export interface CreateOpportunityForm {
  customerId: string;
  title: string;
  amount: number;
  currency?: string;
  exchangeRateToBrl?: number;
  stage?: OpportunityStage;
  expectedCloseDate: string;
}
