import { describe, it, expect } from 'vitest';
import { CustomerList } from './customer-list.entity.js';

describe('CustomerList Aggregate Root', () => {
  const validProps = {
    orgId: 'org-123',
    name: 'Tech Enterprise Leads',
    description: 'Target list for Q4 enterprise campaign',
    customerIds: ['cust-1', 'cust-2'],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it('should create a valid CustomerList', () => {
    const result = CustomerList.create(validProps, 'list-123');

    expect(result.isSuccess).toBe(true);
    const list = result.getValue();
    expect(list.id).toBe('list-123');
    expect(list.name).toBe('Tech Enterprise Leads');
    expect(list.description).toBe('Target list for Q4 enterprise campaign');
    expect(list.memberCount).toBe(2);
    expect(list.customerIds).toEqual(['cust-1', 'cust-2']);
  });

  it('should fail if name is shorter than 2 characters', () => {
    const result = CustomerList.create({ ...validProps, name: 'A' }, 'list-123');
    expect(result.isFailure).toBe(true);
    expect(result.error).toContain('at least 2 characters');
  });

  it('should fail if orgId is missing', () => {
    const result = CustomerList.create({ ...validProps, orgId: '' }, 'list-123');
    expect(result.isFailure).toBe(true);
    expect(result.error).toContain('Organization ID is required');
  });

  it('should deduplicate initial customer IDs', () => {
    const result = CustomerList.create(
      { ...validProps, customerIds: ['cust-1', 'cust-2', 'cust-1', 'cust-3'] },
      'list-123',
    );
    expect(result.isSuccess).toBe(true);
    expect(result.getValue().memberCount).toBe(3);
    expect(result.getValue().customerIds).toEqual(['cust-1', 'cust-2', 'cust-3']);
  });

  it('should add a customer without duplicates', () => {
    const list = CustomerList.create(validProps, 'list-123').getValue();
    list.addCustomer('cust-3');
    expect(list.memberCount).toBe(3);

    // duplicate addition
    list.addCustomer('cust-3');
    expect(list.memberCount).toBe(3);
  });

  it('should remove a customer', () => {
    const list = CustomerList.create(validProps, 'list-123').getValue();
    list.removeCustomer('cust-1');
    expect(list.memberCount).toBe(1);
    expect(list.customerIds).toEqual(['cust-2']);
  });

  it('should set customer list', () => {
    const list = CustomerList.create(validProps, 'list-123').getValue();
    list.setCustomers(['cust-10', 'cust-20', 'cust-10']);
    expect(list.memberCount).toBe(2);
    expect(list.customerIds).toEqual(['cust-10', 'cust-20']);
  });

  it('should update name and description', () => {
    const list = CustomerList.create(validProps, 'list-123').getValue();
    const updateResult = list.updateDetails('New Name', 'New Description');
    expect(updateResult.isSuccess).toBe(true);
    expect(list.name).toBe('New Name');
    expect(list.description).toBe('New Description');

    const invalidUpdate = list.updateDetails(' ');
    expect(invalidUpdate.isFailure).toBe(true);
  });
});
