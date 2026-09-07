/**
 * OpenCRM Database Seed Script
 *
 * Standalone seed script that connects directly via TypeORM.
 * Ensures schema exists and populates a comprehensive demo dataset:
 * - 4 Users (Admin, Manager, 2 Sales Reps) with bcrypt passwords (Demo@123456)
 * - 5 Customers (LEAD, PROSPECT, ACTIVE_CUSTOMER, CHURNED)
 * - 6 Contacts linked to customers (with primary contacts marked)
 * - 6 Opportunities across all Kanban stages (BRL & USD multi-currency)
 * - 5 Interactions (CALL, EMAIL, MEETING, NOTE, TASK)
 *
 * Fully idempotent: Uses deterministic UUIDs and ON DUPLICATE KEY UPDATE
 * so it can be re-run safely at any time.
 *
 * Usage:
 *   npm run seed           (via tsx in development)
 *   npm run seed:dist      (via compiled dist/ in production)
 *   docker compose run --rm seed
 */

import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import bcrypt from 'bcryptjs';

import { UserOrmEntity } from '../infrastructure/adapters/secondary/persistence/mysql/entities/user.orm-entity.js';
import { CustomerOrmEntity } from '../infrastructure/adapters/secondary/persistence/mysql/entities/customer.orm-entity.js';
import { ContactOrmEntity } from '../infrastructure/adapters/secondary/persistence/mysql/entities/contact.orm-entity.js';
import { OpportunityOrmEntity } from '../infrastructure/adapters/secondary/persistence/mysql/entities/opportunity.orm-entity.js';
import { InteractionOrmEntity } from '../infrastructure/adapters/secondary/persistence/mysql/entities/interaction.orm-entity.js';
import { CustomerListOrmEntity } from '../infrastructure/adapters/secondary/persistence/mysql/entities/customer-list.orm-entity.js';
import { CustomerListMemberOrmEntity } from '../infrastructure/adapters/secondary/persistence/mysql/entities/customer-list-member.orm-entity.js';

// Load .env from backend directory or project root
config({ path: ['.env', '../.env'] });

// ─────────────────────────────────────────────────────────────
// Deterministic UUIDs (guarantees idempotency on repeated runs)
// ─────────────────────────────────────────────────────────────
const ORG_ID = 'aaaaaaaa-0000-0000-0000-000000000001';

// Users
const ADMIN_ID = 'bbbbbbbb-0001-0000-0000-000000000001';
const MGR_ID   = 'bbbbbbbb-0002-0000-0000-000000000001';
const REP1_ID  = 'bbbbbbbb-0003-0000-0000-000000000001';
const REP2_ID  = 'bbbbbbbb-0004-0000-0000-000000000001';

// Customers
const CUST_1 = 'cccccccc-0001-0000-0000-000000000001'; // TechCorp Brasil
const CUST_2 = 'cccccccc-0002-0000-0000-000000000001'; // Banco Dinâmico
const CUST_3 = 'cccccccc-0003-0000-0000-000000000001'; // Global Retailers Inc
const CUST_4 = 'cccccccc-0004-0000-0000-000000000001'; // Agro Campos do Sul
const CUST_5 = 'cccccccc-0005-0000-0000-000000000001'; // StartupHub

// Contacts
const CONT_1_1 = 'dddddddd-0001-0000-0000-000000000001';
const CONT_1_2 = 'dddddddd-0001-0000-0000-000000000002';
const CONT_2_1 = 'dddddddd-0002-0000-0000-000000000001';
const CONT_3_1 = 'dddddddd-0003-0000-0000-000000000001';
const CONT_4_1 = 'dddddddd-0004-0000-0000-000000000001';
const CONT_5_1 = 'dddddddd-0005-0000-0000-000000000001';

// Opportunities
const OPP_1_1 = 'eeeeeeee-0001-0000-0000-000000000001';
const OPP_1_2 = 'eeeeeeee-0001-0000-0000-000000000002';
const OPP_2_1 = 'eeeeeeee-0002-0000-0000-000000000001';
const OPP_3_1 = 'eeeeeeee-0003-0000-0000-000000000001';
const OPP_4_1 = 'eeeeeeee-0004-0000-0000-000000000001';
const OPP_5_1 = 'eeeeeeee-0005-0000-0000-000000000001';

// Interactions
const INT_1 = 'ffffffff-0001-0000-0000-000000000001';
const INT_2 = 'ffffffff-0002-0000-0000-000000000001';
const INT_3 = 'ffffffff-0003-0000-0000-000000000001';
const INT_4 = 'ffffffff-0004-0000-0000-000000000001';
const INT_5 = 'ffffffff-0005-0000-0000-000000000001';

// Customer Lists
const LIST_1 = 'a1111111-1111-0000-0000-000000000001';

// ─────────────────────────────────────────────────────────────
// Database Connection
// ─────────────────────────────────────────────────────────────
async function getDataSource(): Promise<DataSource> {
  const ds = new DataSource({
    type: 'mysql',
    host:     process.env.DB_HOST     ?? 'localhost',
    port:     parseInt(process.env.DB_PORT ?? '3306', 10),
    username: process.env.DB_USER     ?? 'crm_user',
    password: process.env.DB_PASSWORD ?? 'crm_password',
    database: process.env.DB_NAME     ?? 'opencrm',
    synchronize: true, // Automatically creates tables if not existing
    logging: false,
    entities: [
      UserOrmEntity,
      CustomerOrmEntity,
      ContactOrmEntity,
      OpportunityOrmEntity,
      InteractionOrmEntity,
      CustomerListOrmEntity,
      CustomerListMemberOrmEntity,
    ],
  });
  await ds.initialize();
  return ds;
}

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────
const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

function escStr(v: string | null | undefined): string {
  if (v === null || v === undefined) return 'NULL';
  return `'${v.replace(/'/g, "''")}'`;
}

function escNum(v: number | null | undefined): string {
  if (v === null || v === undefined) return 'NULL';
  return String(v);
}

// ─────────────────────────────────────────────────────────────
// Main Seed Routine
// ─────────────────────────────────────────────────────────────
async function seed(): Promise<void> {
  console.log('🌱 OpenCRM Database Seed Starting...\n');

  let ds: DataSource;
  try {
    ds = await getDataSource();
    console.log('✅ Database connection established & schema verified\n');
  } catch (err) {
    console.error('❌ Failed to connect to database:', err);
    process.exit(1);
  }

  const q = ds.query.bind(ds);

  // Hash password using bcryptjs
  console.log('🔐 Generating password hash...');
  const passwordHash = await bcrypt.hash('Demo@123456', 10);

  // ── Users ──────────────────────────────────────────────────
  console.log('👤 Seeding users...');
  const users = [
    {
      id: ADMIN_ID,
      orgId: ORG_ID,
      email: 'admin@opencrm.com',
      firstName: 'Admin',
      lastName: 'OpenCRM',
      role: 'ADMIN',
    },
    {
      id: MGR_ID,
      orgId: ORG_ID,
      email: 'manager@opencrm.com',
      firstName: 'Gerente',
      lastName: 'Vendas',
      role: 'MANAGER',
    },
    {
      id: REP1_ID,
      orgId: ORG_ID,
      email: 'rep1@opencrm.com',
      firstName: 'Ana',
      lastName: 'Silva',
      role: 'SALES_REP',
    },
    {
      id: REP2_ID,
      orgId: ORG_ID,
      email: 'rep2@opencrm.com',
      firstName: 'Bruno',
      lastName: 'Costa',
      role: 'SALES_REP',
    },
  ];

  for (const user of users) {
    await q(`
      INSERT INTO users
        (id, org_id, email, password_hash, first_name, last_name, role, is_active, created_at, updated_at)
      VALUES
        (${escStr(user.id)}, ${escStr(user.orgId)}, ${escStr(user.email)},
         ${escStr(passwordHash)}, ${escStr(user.firstName)},
         ${escStr(user.lastName)}, ${escStr(user.role)}, 1, ${escStr(now)}, ${escStr(now)})
      ON DUPLICATE KEY UPDATE
        email = VALUES(email),
        role = VALUES(role),
        is_active = 1,
        password_hash = VALUES(password_hash),
        updated_at = VALUES(updated_at)
    `);
    console.log(`   ✔ [${user.role}] ${user.email}`);
  }

  // ── Customers ──────────────────────────────────────────────
  console.log('\n🏢 Seeding customers, contacts & opportunities...');

  const customers = [
    {
      id: CUST_1,
      companyName: 'TechCorp Brasil Soluções Ltda',
      industry: 'Tecnologia da Informação',
      website: 'https://techcorp.com.br',
      status: 'ACTIVE_CUSTOMER',
      annualRevenue: 8500000,
      employeeCount: 120,
      ownerUserId: REP1_ID,
      contacts: [
        {
          id: CONT_1_1,
          firstName: 'Rafaela',
          lastName: 'Monteiro',
          title: 'Diretora de TI',
          email: 'rafaela.monteiro@techcorp.com.br',
          phone: '+55 11 98765-4321',
          isPrimary: true,
        },
        {
          id: CONT_1_2,
          firstName: 'Carlos',
          lastName: 'Augusto',
          title: 'Gerente de Compras',
          email: 'c.augusto@techcorp.com.br',
          phone: '+55 11 91234-5678',
          isPrimary: false,
        },
      ],
      opportunities: [
        {
          id: OPP_1_1,
          title: 'Licenciamento Enterprise Anual – Suite Completa',
          amount: 350000,
          currency: 'BRL',
          exchangeRateToBrl: 1.0,
          stage: 'CLOSED_WON',
          probability: 100,
          expectedCloseDate: '2026-06-30',
          lossReason: null,
          closedAt: '2026-06-28 14:30:00',
        },
        {
          id: OPP_1_2,
          title: 'Expansão de Infraestrutura Cloud – Fase 2',
          amount: 180000,
          currency: 'BRL',
          exchangeRateToBrl: 1.0,
          stage: 'NEGOTIATION',
          probability: 75,
          expectedCloseDate: '2026-10-31',
          lossReason: null,
          closedAt: null,
        },
      ],
    },
    {
      id: CUST_2,
      companyName: 'Banco Dinâmico S/A',
      industry: 'Serviços Financeiros',
      website: 'https://bancodinamico.com.br',
      status: 'ACTIVE_CUSTOMER',
      annualRevenue: 42000000,
      employeeCount: 850,
      ownerUserId: REP2_ID,
      contacts: [
        {
          id: CONT_2_1,
          firstName: 'Marcelo',
          lastName: 'Ferreira',
          title: 'Chief Technology Officer',
          email: 'marcelo.ferreira@bancodinamico.com.br',
          phone: '+55 21 99876-5432',
          isPrimary: true,
        },
      ],
      opportunities: [
        {
          id: OPP_2_1,
          title: 'Plataforma de Análise de Risco – Implementação',
          amount: 620000,
          currency: 'BRL',
          exchangeRateToBrl: 1.0,
          stage: 'PROPOSAL',
          probability: 50,
          expectedCloseDate: '2026-11-15',
          lossReason: null,
          closedAt: null,
        },
      ],
    },
    {
      id: CUST_3,
      companyName: 'Global Retailers Inc',
      industry: 'Varejo Internacional',
      website: 'https://globalretailers.com',
      status: 'PROSPECT',
      annualRevenue: null,
      employeeCount: 3200,
      ownerUserId: REP1_ID,
      contacts: [
        {
          id: CONT_3_1,
          firstName: 'Sarah',
          lastName: 'Thompson',
          title: 'VP of Technology',
          email: 'sarah.thompson@globalretailers.com',
          phone: '+1 415 555-0190',
          isPrimary: true,
        },
      ],
      opportunities: [
        {
          id: OPP_3_1,
          title: 'Consultoria de Migração AWS (USD)',
          amount: 25000,
          currency: 'USD',
          exchangeRateToBrl: 5.5,
          stage: 'QUALIFICATION',
          probability: 25,
          expectedCloseDate: '2026-12-20',
          lossReason: null,
          closedAt: null,
        },
      ],
    },
    {
      id: CUST_4,
      companyName: 'Agro Campos do Sul S/A',
      industry: 'Agronegócio',
      website: null,
      status: 'LEAD',
      annualRevenue: 12000000,
      employeeCount: 200,
      ownerUserId: REP2_ID,
      contacts: [
        {
          id: CONT_4_1,
          firstName: 'Josefa',
          lastName: 'Cavalcante',
          title: 'Diretora Administrativa',
          email: 'josefa@agrocampos.com.br',
          phone: '+55 51 98001-4567',
          isPrimary: true,
        },
      ],
      opportunities: [
        {
          id: OPP_4_1,
          title: 'Sistema de Gestão de Colheita – Proposta Inicial',
          amount: 95000,
          currency: 'BRL',
          exchangeRateToBrl: 1.0,
          stage: 'DISCOVERY',
          probability: 10,
          expectedCloseDate: '2027-02-28',
          lossReason: null,
          closedAt: null,
        },
      ],
    },
    {
      id: CUST_5,
      companyName: 'StartupHub Aceleradora',
      industry: 'Inovação e Startups',
      website: 'https://startuphub.vc',
      status: 'CHURNED',
      annualRevenue: 2200000,
      employeeCount: 35,
      ownerUserId: REP1_ID,
      contacts: [
        {
          id: CONT_5_1,
          firstName: 'André',
          lastName: 'Barroso',
          title: 'CEO',
          email: 'andre@startuphub.vc',
          phone: '+55 11 91111-2222',
          isPrimary: true,
        },
      ],
      opportunities: [
        {
          id: OPP_5_1,
          title: 'Pacote de Aceleração SaaS Anual',
          amount: 48000,
          currency: 'BRL',
          exchangeRateToBrl: 1.0,
          stage: 'CLOSED_LOST',
          probability: 0,
          expectedCloseDate: '2026-03-31',
          lossReason: 'Concorrente ofereceu desconto de 40% abaixo do nosso preço mínimo',
          closedAt: '2026-04-05 09:15:00',
        },
      ],
    },
  ];

  for (const cust of customers) {
    // Upsert Customer
    await q(`
      INSERT INTO customers
        (id, org_id, assigned_owner_id, company_name, industry, website,
         status, annual_revenue, employee_count, created_at, updated_at)
      VALUES
        (${escStr(cust.id)}, ${escStr(ORG_ID)}, ${escStr(cust.ownerUserId)},
         ${escStr(cust.companyName)}, ${escStr(cust.industry)}, ${escStr(cust.website)},
         ${escStr(cust.status)}, ${escNum(cust.annualRevenue)}, ${escNum(cust.employeeCount)},
         ${escStr(now)}, ${escStr(now)})
      ON DUPLICATE KEY UPDATE
        company_name = VALUES(company_name),
        status = VALUES(status),
        industry = VALUES(industry),
        website = VALUES(website),
        annual_revenue = VALUES(annual_revenue),
        employee_count = VALUES(employee_count),
        updated_at = VALUES(updated_at)
    `);

    // Upsert Contacts
    for (const c of cust.contacts) {
      await q(`
        INSERT INTO contacts
          (id, org_id, customer_id, first_name, last_name, title, email, phone, is_primary, created_at, updated_at)
        VALUES
          (${escStr(c.id)}, ${escStr(ORG_ID)}, ${escStr(cust.id)},
           ${escStr(c.firstName)}, ${escStr(c.lastName)}, ${escStr(c.title)},
           ${escStr(c.email)}, ${escStr(c.phone)}, ${c.isPrimary ? 1 : 0},
           ${escStr(now)}, ${escStr(now)})
        ON DUPLICATE KEY UPDATE
          first_name = VALUES(first_name),
          last_name = VALUES(last_name),
          email = VALUES(email),
          phone = VALUES(phone),
          title = VALUES(title),
          is_primary = VALUES(is_primary),
          updated_at = VALUES(updated_at)
      `);
    }

    // Upsert Opportunities
    for (const opp of cust.opportunities) {
      const closedAt = opp.closedAt ? escStr(opp.closedAt) : 'NULL';
      const lossReason = opp.lossReason ? escStr(opp.lossReason) : 'NULL';
      await q(`
        INSERT INTO opportunities
          (id, org_id, customer_id, owner_id, title, amount, currency,
           exchange_rate_to_brl, stage, probability, expected_close_date,
           closed_at, loss_reason, created_at, updated_at)
        VALUES
          (${escStr(opp.id)}, ${escStr(ORG_ID)}, ${escStr(cust.id)},
           ${escStr(cust.ownerUserId)}, ${escStr(opp.title)},
           ${escNum(opp.amount)}, ${escStr(opp.currency)},
           ${escNum(opp.exchangeRateToBrl)}, ${escStr(opp.stage)},
           ${escNum(opp.probability)}, ${escStr(opp.expectedCloseDate)},
           ${closedAt}, ${lossReason}, ${escStr(now)}, ${escStr(now)})
        ON DUPLICATE KEY UPDATE
          title = VALUES(title),
          amount = VALUES(amount),
          currency = VALUES(currency),
          exchange_rate_to_brl = VALUES(exchange_rate_to_brl),
          stage = VALUES(stage),
          probability = VALUES(probability),
          expected_close_date = VALUES(expected_close_date),
          closed_at = VALUES(closed_at),
          loss_reason = VALUES(loss_reason),
          updated_at = VALUES(updated_at)
      `);
    }

    console.log(`   ✔ ${cust.companyName} (${cust.contacts.length} contato(s), ${cust.opportunities.length} oportunidade(s))`);
  }

  // ── Interactions / Timeline ────────────────────────────────
  console.log('\n📋 Seeding interactions...');

  const interactions = [
    {
      id: INT_1,
      userId: REP1_ID,
      customerId: CUST_1,
      type: 'CALL',
      subject: 'Ligação de check-in trimestral',
      description: 'Revisão do contrato Enterprise e feedback sobre a plataforma. Cliente muito satisfeito.',
      outcome: 'Contrato renovado automaticamente. Agendar onboarding para módulo de BI.',
      scheduledAt: '2026-09-01 10:00:00',
      completedAt: '2026-09-01 10:45:00',
    },
    {
      id: INT_2,
      userId: REP1_ID,
      customerId: CUST_1,
      type: 'EMAIL',
      subject: 'Proposta de Expansão Cloud – Fase 2',
      description: 'Enviada proposta detalhada para expansão da infraestrutura cloud com precificação escalonada.',
      outcome: null,
      scheduledAt: null,
      completedAt: null,
    },
    {
      id: INT_3,
      userId: REP2_ID,
      customerId: CUST_2,
      type: 'MEETING',
      subject: 'Reunião de Demonstração – Plataforma de Risco',
      description: 'Demo técnica com equipe de TI do Banco. Apresentação dos módulos de compliance e LGPD.',
      outcome: 'Equipe técnica aprovada. Aguardando aprovação do C-Level para avançar.',
      scheduledAt: '2026-09-03 14:00:00',
      completedAt: '2026-09-03 16:00:00',
    },
    {
      id: INT_4,
      userId: ADMIN_ID,
      customerId: CUST_1,
      type: 'NOTE',
      subject: 'Notas de pesquisa – Expansão de produto',
      description: 'Cliente mencionou interesse futuro em módulo de RH integrado. Anotar para roadmap Q1 2027.',
      outcome: null,
      scheduledAt: null,
      completedAt: null,
    },
    {
      id: INT_5,
      userId: REP2_ID,
      customerId: CUST_2,
      type: 'TASK',
      subject: 'Enviar SLA e documentação técnica',
      description: 'Documento de SLA exigido pelo departamento jurídico do banco antes da assinatura.',
      outcome: null,
      scheduledAt: '2026-09-10 09:00:00',
      completedAt: null,
    },
  ];

  for (const inter of interactions) {
    const schedAt = inter.scheduledAt ? escStr(inter.scheduledAt) : 'NULL';
    const compAt  = inter.completedAt ? escStr(inter.completedAt) : 'NULL';
    const outcome = inter.outcome     ? escStr(inter.outcome)     : 'NULL';

    await q(`
      INSERT INTO interactions
        (id, org_id, user_id, customer_id, type, subject, description,
         outcome, scheduled_at, completed_at, created_at, updated_at)
      VALUES
        (${escStr(inter.id)}, ${escStr(ORG_ID)}, ${escStr(inter.userId)},
         ${escStr(inter.customerId)}, ${escStr(inter.type)}, ${escStr(inter.subject)},
         ${escStr(inter.description ?? '')}, ${outcome}, ${schedAt}, ${compAt},
         ${escStr(now)}, ${escStr(now)})
      ON DUPLICATE KEY UPDATE
        subject = VALUES(subject),
        description = VALUES(description),
        outcome = VALUES(outcome),
        scheduled_at = VALUES(scheduled_at),
        completed_at = VALUES(completed_at),
        updated_at = VALUES(updated_at)
    `);
    console.log(`   ✔ [${inter.type}] ${inter.subject}`);
  }

  // ── Customer Lists & Mass Mailing ──────────────────────────
  console.log('\n✉ Seeding customer lists...');

  await q(`
    INSERT INTO customer_lists
      (id, org_id, name, description, created_at, updated_at)
    VALUES
      (${escStr(LIST_1)}, ${escStr(ORG_ID)},
       'Clientes VIP e Contas Estratégicas',
       'Lista prioritária para comunicação institucional, pesquisas de satisfação e novidades',
       ${escStr(now)}, ${escStr(now)})
    ON DUPLICATE KEY UPDATE
      name = VALUES(name),
      description = VALUES(description),
      updated_at = VALUES(updated_at)
  `);

  const listMembers = [CUST_1, CUST_2, CUST_3];
  for (const custId of listMembers) {
    await q(`
      INSERT INTO customer_list_members
        (list_id, customer_id, created_at)
      VALUES
        (${escStr(LIST_1)}, ${escStr(custId)}, ${escStr(now)})
      ON DUPLICATE KEY UPDATE
        created_at = VALUES(created_at)
    `);
  }
  console.log(`   ✔ Clientes VIP e Contas Estratégicas (${listMembers.length} clientes vinculados)`);

  await ds.destroy();

  console.log('\n✅ Seed concluído com sucesso!\n');
  console.log('─────────────────────────────────────────────────────────');
  console.log('🔑 Usuários de acesso (todos com senha: Demo@123456)');
  console.log('─────────────────────────────────────────────────────────');
  console.log('  ADMIN        →  admin@opencrm.com');
  console.log('  MANAGER      →  manager@opencrm.com');
  console.log('  SALES_REP 1  →  rep1@opencrm.com');
  console.log('  SALES_REP 2  →  rep2@opencrm.com');
  console.log('─────────────────────────────────────────────────────────');
  console.log(`  📊 ${customers.length} clientes`);
  console.log(`  👥 ${customers.reduce((s, c) => s + c.contacts.length, 0)} contatos`);
  console.log(`  💰 ${customers.reduce((s, c) => s + c.opportunities.length, 0)} oportunidades`);
  console.log(`  📝 ${interactions.length} interações`);
  console.log('─────────────────────────────────────────────────────────\n');
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
