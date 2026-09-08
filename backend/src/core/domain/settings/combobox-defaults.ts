import { ComboboxCategory } from './value-objects/combobox-category.vo.js';

export interface DefaultComboboxItem {
  value: string;
  label: string;
  orderIndex: number;
}

export const DEFAULT_COMBOBOX_OPTIONS: Record<ComboboxCategory, DefaultComboboxItem[]> = {
  [ComboboxCategory.CUSTOMER_INDUSTRY]: [
    { value: 'Tecnologia', label: 'Tecnologia & Software', orderIndex: 0 },
    { value: 'Financeiro', label: 'Financeiro / Bancos', orderIndex: 1 },
    { value: 'Varejo', label: 'Varejo & E-commerce', orderIndex: 2 },
    { value: 'Agronegócio', label: 'Agronegócio', orderIndex: 3 },
    { value: 'Saúde', label: 'Saúde & Farmacêutica', orderIndex: 4 },
    { value: 'Indústria', label: 'Indústria & Manufatura', orderIndex: 5 },
    { value: 'Serviços', label: 'Serviços Corporativos', orderIndex: 6 },
    { value: 'Educação', label: 'Educação & Ensino', orderIndex: 7 },
    { value: 'Logística', label: 'Logística & Transporte', orderIndex: 8 },
    { value: 'Construção', label: 'Construção & Engenharia', orderIndex: 9 },
  ],
  [ComboboxCategory.CUSTOMER_STATUS]: [
    { value: 'LEAD', label: 'Lead', orderIndex: 0 },
    { value: 'PROSPECT', label: 'Prospect', orderIndex: 1 },
    { value: 'ACTIVE_CUSTOMER', label: 'Cliente Ativo', orderIndex: 2 },
    { value: 'CHURNED', label: 'Churned / Cancelado', orderIndex: 3 },
    { value: 'INACTIVE', label: 'Inativo', orderIndex: 4 },
  ],
  [ComboboxCategory.PRODUCT_CATEGORY]: [
    { value: 'PRODUTO', label: 'Produto Físico', orderIndex: 0 },
    { value: 'SERVICO', label: 'Serviço', orderIndex: 1 },
    { value: 'SOFTWARE', label: 'Software / SaaS', orderIndex: 2 },
    { value: 'CONSULTORIA', label: 'Consultoria', orderIndex: 3 },
    { value: 'SUPORTE', label: 'Suporte & Manutenção', orderIndex: 4 },
    { value: 'TREINAMENTO', label: 'Treinamento & Capacitação', orderIndex: 5 },
  ],
  [ComboboxCategory.PRODUCT_UNIT]: [
    { value: 'un', label: 'Unidade (un)', orderIndex: 0 },
    { value: 'hora', label: 'Hora (h)', orderIndex: 1 },
    { value: 'mês', label: 'Mês (mês)', orderIndex: 2 },
    { value: 'ano', label: 'Ano (ano)', orderIndex: 3 },
    { value: 'licença', label: 'Licença (lic)', orderIndex: 4 },
    { value: 'projeto', label: 'Projeto (proj)', orderIndex: 5 },
    { value: 'pacote', label: 'Pacote (pct)', orderIndex: 6 },
    { value: 'kg', label: 'Quilograma (kg)', orderIndex: 7 },
  ],
  [ComboboxCategory.PAYMENT_TERMS]: [
    { value: 'À vista', label: 'À vista (PIX / Boleto)', orderIndex: 0 },
    { value: '14 dias', label: 'Faturamento 14 dias', orderIndex: 1 },
    { value: '30 dias', label: 'Faturamento 30 dias (Net 30)', orderIndex: 2 },
    { value: '30/60 dias', label: 'Parcelado 30 / 60 dias', orderIndex: 3 },
    { value: '30/60/90 dias', label: 'Parcelado 30 / 60 / 90 dias', orderIndex: 4 },
    { value: '12x Cartão', label: '12x no Cartão de Crédito', orderIndex: 5 },
    { value: 'Entrada + 30 dias', label: '50% Entrada + 50% em 30 dias', orderIndex: 6 },
    { value: 'Recorrência Mensal', label: 'Assinatura / Mensalidade recorrente', orderIndex: 7 },
  ],
  [ComboboxCategory.LOSS_REASON]: [
    { value: 'PRECO', label: 'Preço acima do orçamento', orderIndex: 0 },
    { value: 'CONCORRENCIA', label: 'Optou pelo concorrente', orderIndex: 1 },
    { value: 'TIMING', label: 'Projeto adiado / Sem prioridade no momento', orderIndex: 2 },
    { value: 'FALTA_RECURSO', label: 'Funcionalidade técnica ausente', orderIndex: 3 },
    { value: 'SEM_RESPOSTA', label: 'Contato parou de responder', orderIndex: 4 },
    { value: 'DESISTENCIA', label: 'Desistência do projeto internamente', orderIndex: 5 },
  ],
  [ComboboxCategory.CONTACT_ROLE]: [
    { value: 'CEO_DIRETOR', label: 'CEO / Diretor Executivo', orderIndex: 0 },
    { value: 'GERENTE', label: 'Gerente / Coordenador de Área', orderIndex: 1 },
    { value: 'COMPRADOR', label: 'Comprador / Procurement', orderIndex: 2 },
    { value: 'TI_TECNICO', label: 'Decisor Técnico / CTO / TI', orderIndex: 3 },
    { value: 'FINANCEIRO', label: 'Responsável Financeiro / CFO', orderIndex: 4 },
    { value: 'OPERACIONAL', label: 'Analista / Operacional', orderIndex: 5 },
  ],
  [ComboboxCategory.INTERACTION_TYPE]: [
    { value: 'NOTE', label: 'Anotação Interna', orderIndex: 0 },
    { value: 'CALL', label: 'Ligação Telefônica', orderIndex: 1 },
    { value: 'EMAIL', label: 'E-mail Comercial', orderIndex: 2 },
    { value: 'MEETING', label: 'Reunião Presencial / Online', orderIndex: 3 },
    { value: 'TASK', label: 'Tarefa / Acompanhamento', orderIndex: 4 },
  ],
};
