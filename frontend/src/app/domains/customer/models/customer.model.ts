export interface CustomerSummary {
  id: string;
  companyName: string;
  status: 'LEAD' | 'PROSPECT' | 'ACTIVE_CUSTOMER' | 'CHURNED' | 'INACTIVE';
  industry?: string | null;
  website?: string | null;
  annualRevenue?: number | null;
  employeeCount?: number | null;
  contactCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ContactItem {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  title?: string | null;
  email: string;
  phone?: string | null;
  isPrimary: boolean;
}

export interface CustomerDetail extends CustomerSummary {
  orgId: string;
  assignedOwnerId?: string | null;
  contacts: ContactItem[];
}

export interface PaginatedCustomers {
  data: CustomerSummary[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateCustomerForm {
  companyName: string;
  industry?: string;
  website?: string;
  status?: string;
  annualRevenue?: number;
  employeeCount?: number;
  primaryContact?: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    title?: string;
  };
}
