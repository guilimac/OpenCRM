export enum ComboboxCategory {
  CUSTOMER_INDUSTRY = 'CUSTOMER_INDUSTRY',
  CUSTOMER_STATUS = 'CUSTOMER_STATUS',
  PRODUCT_CATEGORY = 'PRODUCT_CATEGORY',
  PRODUCT_UNIT = 'PRODUCT_UNIT',
  PAYMENT_TERMS = 'PAYMENT_TERMS',
  LOSS_REASON = 'LOSS_REASON',
  CONTACT_ROLE = 'CONTACT_ROLE',
  INTERACTION_TYPE = 'INTERACTION_TYPE',
}

export interface ComboboxOptionItem {
  id: string;
  category: ComboboxCategory;
  value: string;
  label: string;
  orderIndex: number;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateComboboxOptionPayload {
  category: ComboboxCategory;
  value: string;
  label: string;
  orderIndex?: number;
  isActive?: boolean;
}

export interface UpdateComboboxOptionPayload {
  label?: string;
  orderIndex?: number;
  isActive?: boolean;
}

export interface CategoryMeta {
  category: ComboboxCategory;
  titleKey: string;
  descriptionKey: string;
  icon: string;
  badgeCount?: number;
}

export const CATEGORY_METADATA_LIST: CategoryMeta[] = [
  {
    category: ComboboxCategory.CUSTOMER_INDUSTRY,
    titleKey: 'SETTINGS.CATEGORIES.CUSTOMER_INDUSTRY.TITLE',
    descriptionKey: 'SETTINGS.CATEGORIES.CUSTOMER_INDUSTRY.DESC',
    icon: 'domain',
  },
  {
    category: ComboboxCategory.CUSTOMER_STATUS,
    titleKey: 'SETTINGS.CATEGORIES.CUSTOMER_STATUS.TITLE',
    descriptionKey: 'SETTINGS.CATEGORIES.CUSTOMER_STATUS.DESC',
    icon: 'person_pin_circle',
  },
  {
    category: ComboboxCategory.PRODUCT_CATEGORY,
    titleKey: 'SETTINGS.CATEGORIES.PRODUCT_CATEGORY.TITLE',
    descriptionKey: 'SETTINGS.CATEGORIES.PRODUCT_CATEGORY.DESC',
    icon: 'category',
  },
  {
    category: ComboboxCategory.PRODUCT_UNIT,
    titleKey: 'SETTINGS.CATEGORIES.PRODUCT_UNIT.TITLE',
    descriptionKey: 'SETTINGS.CATEGORIES.PRODUCT_UNIT.DESC',
    icon: 'straighten',
  },
  {
    category: ComboboxCategory.PAYMENT_TERMS,
    titleKey: 'SETTINGS.CATEGORIES.PAYMENT_TERMS.TITLE',
    descriptionKey: 'SETTINGS.CATEGORIES.PAYMENT_TERMS.DESC',
    icon: 'payments',
  },
  {
    category: ComboboxCategory.LOSS_REASON,
    titleKey: 'SETTINGS.CATEGORIES.LOSS_REASON.TITLE',
    descriptionKey: 'SETTINGS.CATEGORIES.LOSS_REASON.DESC',
    icon: 'thumb_down_off_alt',
  },
  {
    category: ComboboxCategory.CONTACT_ROLE,
    titleKey: 'SETTINGS.CATEGORIES.CONTACT_ROLE.TITLE',
    descriptionKey: 'SETTINGS.CATEGORIES.CONTACT_ROLE.DESC',
    icon: 'badge',
  },
  {
    category: ComboboxCategory.INTERACTION_TYPE,
    titleKey: 'SETTINGS.CATEGORIES.INTERACTION_TYPE.TITLE',
    descriptionKey: 'SETTINGS.CATEGORIES.INTERACTION_TYPE.DESC',
    icon: 'forum',
  },
];
