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

export const ALL_COMBOBOX_CATEGORIES: ComboboxCategory[] = [
  ComboboxCategory.CUSTOMER_INDUSTRY,
  ComboboxCategory.CUSTOMER_STATUS,
  ComboboxCategory.PRODUCT_CATEGORY,
  ComboboxCategory.PRODUCT_UNIT,
  ComboboxCategory.PAYMENT_TERMS,
  ComboboxCategory.LOSS_REASON,
  ComboboxCategory.CONTACT_ROLE,
  ComboboxCategory.INTERACTION_TYPE,
];

export function isValidComboboxCategory(val: string): val is ComboboxCategory {
  return ALL_COMBOBOX_CATEGORIES.includes(val as ComboboxCategory);
}
