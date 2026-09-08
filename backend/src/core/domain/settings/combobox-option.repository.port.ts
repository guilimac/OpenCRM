import { ComboboxOption } from './entities/combobox-option.entity.js';
import { ComboboxCategory } from './value-objects/combobox-category.vo.js';

export const COMBOBOX_OPTION_REPOSITORY_PORT = Symbol('COMBOBOX_OPTION_REPOSITORY_PORT');

export interface IComboboxOptionRepository {
  findAllByOrg(orgId: string): Promise<ComboboxOption[]>;
  findByCategory(orgId: string, category: ComboboxCategory): Promise<ComboboxOption[]>;
  findById(orgId: string, id: string): Promise<ComboboxOption | null>;
  findByValue(orgId: string, category: ComboboxCategory, value: string): Promise<ComboboxOption | null>;
  save(option: ComboboxOption): Promise<void>;
  saveMany(options: ComboboxOption[]): Promise<void>;
  delete(orgId: string, id: string): Promise<void>;
  deleteByCategory(orgId: string, category: ComboboxCategory): Promise<void>;
  countByCategory(orgId: string, category: ComboboxCategory): Promise<number>;
}
