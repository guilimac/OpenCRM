import { Customer } from '../../../../../../core/domain/customer/entities/customer.entity.js';
import { CustomerStatus } from '../../../../../../core/domain/customer/value-objects/customer-status.vo.js';
import { Contact } from '../../../../../../core/domain/customer/entities/contact.entity.js';
import { CustomerOrmEntity } from '../entities/customer.orm-entity.js';
import { ContactOrmEntity } from '../entities/contact.orm-entity.js';

export class CustomerMapper {
  static toDomain(orm: CustomerOrmEntity): Customer {
    const statusResult = CustomerStatus.create(orm.status);
    const status = statusResult.isSuccess ? statusResult.getValue() : CustomerStatus.create('LEAD').getValue();

    const contacts: Contact[] = (orm.contacts ?? []).map((c) => {
      const contactResult = Contact.create(
        {
          orgId: c.orgId,
          customerId: c.customerId,
          firstName: c.firstName,
          lastName: c.lastName,
          title: c.title,
          email: c.email,
          phone: c.phone,
          isPrimary: c.isPrimary,
          createdAt: c.createdAt,
          updatedAt: c.updatedAt,
        },
        c.id,
      );
      return contactResult.getValue();
    });

    const customerResult = Customer.create(
      {
        orgId: orm.orgId,
        assignedOwnerId: orm.assignedOwnerId,
        companyName: orm.companyName,
        industry: orm.industry,
        website: orm.website,
        status,
        annualRevenue: orm.annualRevenue !== null && orm.annualRevenue !== undefined ? Number(orm.annualRevenue) : null,
        employeeCount: orm.employeeCount,
        contacts,
        createdAt: orm.createdAt,
        updatedAt: orm.updatedAt,
      },
      orm.id,
    );

    return customerResult.getValue();
  }

  static toOrm(domain: Customer): CustomerOrmEntity {
    const orm = new CustomerOrmEntity();
    orm.id = domain.id;
    orm.orgId = domain.orgId;
    orm.assignedOwnerId = domain.assignedOwnerId;
    orm.companyName = domain.companyName;
    orm.industry = domain.industry;
    orm.website = domain.website;
    orm.status = domain.status.value;
    orm.annualRevenue = domain.annualRevenue;
    orm.employeeCount = domain.employeeCount;
    orm.createdAt = domain.createdAt;
    orm.updatedAt = domain.updatedAt;

    if (domain.contacts && domain.contacts.length > 0) {
      orm.contacts = domain.contacts.map((c) => {
        const contactOrm = new ContactOrmEntity();
        contactOrm.id = c.id;
        contactOrm.orgId = c.orgId;
        contactOrm.customerId = c.customerId;
        contactOrm.firstName = c.firstName;
        contactOrm.lastName = c.lastName;
        contactOrm.title = c.title;
        contactOrm.email = c.email;
        contactOrm.phone = c.phone;
        contactOrm.isPrimary = c.isPrimary;
        contactOrm.createdAt = c.createdAt;
        contactOrm.updatedAt = c.updatedAt;
        return contactOrm;
      });
    }

    return orm;
  }
}
