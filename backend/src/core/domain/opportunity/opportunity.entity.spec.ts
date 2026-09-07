import { describe, it, expect } from 'vitest';
import { Opportunity } from './entities/opportunity.entity.js';
import { MonetaryValue } from './value-objects/monetary-value.vo.js';
import { OpportunityStage } from './value-objects/stage.vo.js';

describe('Opportunity Entity', () => {
  const defaultMoney = MonetaryValue.create(10000, 'BRL').getValue();
  const defaultStage = OpportunityStage.create('DISCOVERY').getValue();

  it('should calculate weighted value in BRL accurately based on probability', () => {
    // 10,000 BRL at 10% probability (Discovery) = 1,000 BRL
    const opp = Opportunity.create(
      {
        orgId: 'org-1',
        customerId: 'cust-1',
        ownerId: 'user-1',
        title: 'New Contract',
        monetaryValue: defaultMoney,
        stage: defaultStage,
        expectedCloseDate: new Date('2026-12-31'),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      'opp-1',
    ).getValue();

    expect(opp.weightedValueInBrl).toBe(1000);
  });

  it('should require a loss reason when transitioning to CLOSED_LOST', () => {
    const opp = Opportunity.create(
      {
        orgId: 'org-1',
        customerId: 'cust-1',
        ownerId: 'user-1',
        title: 'New Contract',
        monetaryValue: defaultMoney,
        stage: defaultStage,
        expectedCloseDate: new Date('2026-12-31'),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      'opp-1',
    ).getValue();

    const closedLostStage = OpportunityStage.create('CLOSED_LOST').getValue();

    // Fails without loss reason
    const failResult = opp.changeStage(closedLostStage);
    expect(failResult.isFailure).toBe(true);
    expect(failResult.error).toContain('loss reason is strictly required');

    // Succeeds with loss reason
    const successResult = opp.changeStage(closedLostStage, 'Competitor offer was lower');
    expect(successResult.isSuccess).toBe(true);
    expect(opp.stage.value).toBe('CLOSED_LOST');
    expect(opp.lossReason).toBe('Competitor offer was lower');
    expect(opp.closedAt).toBeDefined();
  });
});
