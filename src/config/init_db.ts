import { open, Database } from "sqlite";
import sqlite3 from "sqlite3"
import { pathToFileURL } from 'node:url';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const db: { connection: Database | null} = {
  connection: null
};

export async function openDb(): Promise<void> {
  db.connection = await open({
    filename: process.env.DBFILE || './db/freelance.sqlite3',
    driver: sqlite3.Database
  });
  
  await createSchemaAndData();
  await db.connection.exec('PRAGMA foreign_keys = ON');
  console.log('Database connected and initialized successfully.');
}

export const usersTableDef = {
  name: 'users',
  columns: {
    user_id: { type: 'INTEGER', primaryKey: true, autoincrement: true },
    first_name: { type: 'TEXT', notNull: true },
    last_name: { type: 'TEXT', notNull: true },
    email: { type: 'TEXT', notNull: true, unique: true },
    password_hash: { type: 'TEXT', notNull: true },
    main_role: { type: "TEXT CHECK(main_role IN ('Admin', 'Manager', 'Support', 'Employer', 'Freelancer'))", notNull: true },
    status: { type: "TEXT DEFAULT 'active' CHECK(status IN ('active', 'suspended', 'archived'))" },
    is_blocked: { type: "INTEGER DEFAULT 0" },
    failed_attempts: { type: 'INTEGER DEFAULT 0' },
    lock_until: { type: 'DATETIME' },
    created_at: { type: "DATETIME DEFAULT CURRENT_TIMESTAMP" },
    updated_at: { type: "DATETIME DEFAULT CURRENT_TIMESTAMP" }
  }
};

export const skillsTableDef = {
  name: 'skills',
  columns: {
    skill_id: { type: 'INTEGER', primaryKey: true, autoincrement: true },
    name: { type: 'TEXT', notNull: true, unique: true }
  }
};

export const profilesTableDef = {
  name: 'profiles',
  columns: {
    profile_id: { type: 'INTEGER', primaryKey: true, autoincrement: true },
    user_id: { type: 'INTEGER', notNull: true, unique: true },
    display_name: { type: 'TEXT' },
    headline: { type: 'TEXT' },
    description: { type: 'TEXT' },
    photo_url: { type: 'TEXT' },
    location: { type: 'TEXT' },
    onboarding_completed: { type: "BOOLEAN DEFAULT 0" },
    created_at: { type: "DATETIME DEFAULT CURRENT_TIMESTAMP" },
    updated_at: { type: "DATETIME DEFAULT CURRENT_TIMESTAMP" }
  },
  foreignKeys: [{ column: 'user_id', references: 'users(user_id) ON DELETE CASCADE' }]
};

export const freelancerProfilesTableDef = {
  name: 'freelancer_profiles',
  columns: {
    id: { type: 'INTEGER', primaryKey: true, autoincrement: true },
    user_id: { type: 'INTEGER', notNull: true, unique: true },
    title: { type: 'TEXT' },
    hourly_rate: { type: 'REAL' },
    experience_level: { type: "TEXT CHECK(experience_level IN ('entry', 'intermediate', 'expert'))" },
    github_url: { type: 'TEXT' },
    linkedin_url: { type: 'TEXT' },
    jobs_completed: { type: 'INTEGER DEFAULT 0' },
    rating: { type: 'REAL DEFAULT 0' },
    reviews_count: { type: 'INTEGER DEFAULT 0' },
    created_at: { type: "DATETIME DEFAULT CURRENT_TIMESTAMP" },
    updated_at: { type: "DATETIME DEFAULT CURRENT_TIMESTAMP" }
  },
  foreignKeys: [{ column: 'user_id', references: 'users(user_id) ON DELETE CASCADE' }]
};

export const employerProfilesTableDef = {
  name: 'employer_profiles',
  columns: {
    id: { type: 'INTEGER', primaryKey: true, autoincrement: true },
    user_id: { type: 'INTEGER', notNull: true, unique: true },
    company_name: { type: 'TEXT' },
    company_description: { type: 'TEXT' },
    company_website: { type: 'TEXT' },
    company_size: { type: "TEXT CHECK(company_size IN ('1-10', '11-50', '51-200', '201-500', '500+'))" },
    industry: { type: 'TEXT' },
    jobs_posted: { type: 'INTEGER DEFAULT 0' },
    total_spent: { type: 'REAL DEFAULT 0' },
    rating: { type: 'REAL DEFAULT 0' },
    reviews_count: { type: 'INTEGER DEFAULT 0' },
    created_at: { type: "DATETIME DEFAULT CURRENT_TIMESTAMP" },
    updated_at: { type: "DATETIME DEFAULT CURRENT_TIMESTAMP" }
  },
  foreignKeys: [{ column: 'user_id', references: 'users(user_id) ON DELETE CASCADE' }]
};

export const profileSkillsTableDef = {
  name: 'profile_skills',
  columns: {
    user_id: { type: 'INTEGER', notNull: true },
    skill_id: { type: 'INTEGER', notNull: true }
  },
  primaryKey: ['user_id', 'skill_id'],
  foreignKeys: [
    { column: 'user_id', references: 'users(user_id) ON DELETE CASCADE' },
    { column: 'skill_id', references: 'skills(skill_id) ON DELETE CASCADE' }
  ]
};

export const categoriesTableDef = {
  name: 'categories',
  columns: {
    category_id: { type: 'INTEGER', primaryKey: true, autoincrement: true },
    name: { type: 'TEXT', notNull: true },
    description: { type: 'TEXT' },
    manager_id: { type: 'INTEGER' }
  },
  foreignKeys: [
    { column: 'manager_id', references: 'users(user_id) ON DELETE SET NULL' }
  ]
};

export const jobsTableDef = {
  name: 'jobs',
  columns: {
    job_id: { type: 'INTEGER', primaryKey: true, autoincrement: true },
    employer_id: { type: 'INTEGER', notNull: true },
    category_id: { type: 'INTEGER', notNull: true },
    title: { type: 'TEXT', notNull: true },
    description: { type: 'TEXT', notNull: true },
    budget: { type: 'REAL' },
    status: { type: "TEXT DEFAULT 'Open' CHECK(status IN ('Open', 'In Progress', 'Completed', 'Cancelled'))" },
    deadline: { type: 'TEXT' },
    experience_level: { type: "TEXT CHECK(experience_level IN ('entry', 'intermediate', 'expert'))" },
    job_type: { type: "TEXT DEFAULT 'fixed' CHECK(job_type IN ('fixed', 'hourly'))" },
    duration_estimate: { type: "TEXT CHECK(duration_estimate IN ('less_than_week', '1_2_weeks', '2_4_weeks', '1_3_months', '3_6_months', 'more_than_6_months'))" },
    is_remote: { type: 'BOOLEAN DEFAULT 1' },
    location: { type: 'TEXT' },
    is_hidden: { type: 'INTEGER DEFAULT 0' },
    hidden_reason: { type: 'TEXT' },
    hidden_at: { type: 'DATETIME' },
    hidden_by: { type: 'INTEGER' },
    created_at: { type: "DATETIME DEFAULT CURRENT_TIMESTAMP" },
    updated_at: { type: "DATETIME DEFAULT CURRENT_TIMESTAMP" }
  },
  foreignKeys: [
    { column: 'employer_id', references: 'users(user_id) ON DELETE CASCADE' },
    { column: 'category_id', references: 'categories(category_id) ON DELETE RESTRICT' },
    { column: 'hidden_by', references: 'users(user_id) ON DELETE SET NULL' }
  ]
};

export const jobSkillsTableDef = {
  name: 'job_skills',
  columns: {
    job_id: { type: 'INTEGER', notNull: true },
    skill_id: { type: 'INTEGER', notNull: true }
  },
  primaryKey: ['job_id', 'skill_id'],
  foreignKeys: [
    { column: 'job_id', references: 'jobs(job_id) ON DELETE CASCADE' },
    { column: 'skill_id', references: 'skills(skill_id) ON DELETE CASCADE' }
  ]
};

export const jobApplicationsTableDef = {
  name: 'jobapplications',
  columns: {
    application_id: { type: 'INTEGER', primaryKey: true, autoincrement: true },
    job_id: { type: 'INTEGER', notNull: true },
    freelancer_id: { type: 'INTEGER', notNull: true },
    bid_amount: { type: 'REAL', notNull: true },
    proposal_text: { type: 'TEXT' },
    status: { type: "TEXT DEFAULT 'Pending' CHECK(status IN ('Pending', 'Accepted', 'Rejected'))" },
    created_at: { type: "DATETIME DEFAULT CURRENT_TIMESTAMP" }
  },
  foreignKeys: [
    { column: 'job_id', references: 'jobs(job_id) ON DELETE CASCADE' },
    { column: 'freelancer_id', references: 'users(user_id) ON DELETE CASCADE' }
  ]
};

export const assignmentsTableDef = {
  name: 'assignments',
  columns: {
    assignment_id: { type: 'INTEGER', primaryKey: true, autoincrement: true },
    job_id: { type: 'INTEGER', notNull: true },
    freelancer_id: { type: 'INTEGER', notNull: true },
    status: { type: "TEXT DEFAULT 'Active' CHECK(status IN ('Active', 'Completed', 'Terminated'))" },
    created_at: { type: "DATETIME DEFAULT CURRENT_TIMESTAMP" },
    updated_at: { type: "DATETIME DEFAULT CURRENT_TIMESTAMP" }
  },
  foreignKeys: [
    { column: 'job_id', references: 'jobs(job_id) ON DELETE CASCADE' },
    { column: 'freelancer_id', references: 'users(user_id) ON DELETE CASCADE' }
  ]
};

export const assignmentDeliverablesTableDef = {
  name: 'assignment_deliverables',
  columns: {
    deliverable_id: { type: 'INTEGER', primaryKey: true, autoincrement: true },
    assignment_id: { type: 'INTEGER', notNull: true },
    freelancer_id: { type: 'INTEGER', notNull: true },
    file_path: { type: 'TEXT' },
    file_name: { type: 'TEXT' },
    file_size: { type: 'INTEGER' },
    mime_type: { type: 'TEXT' },
    link_url: { type: 'TEXT' },
    status: { type: "TEXT DEFAULT 'submitted' CHECK(status IN ('submitted', 'accepted', 'changes_requested'))" },
    reviewer_message: { type: 'TEXT' },
    reviewed_at: { type: 'DATETIME' },
    created_at: { type: "DATETIME DEFAULT CURRENT_TIMESTAMP" }
  },
  foreignKeys: [
    { column: 'assignment_id', references: 'assignments(assignment_id) ON DELETE CASCADE' },
    { column: 'freelancer_id', references: 'users(user_id) ON DELETE CASCADE' }
  ]
};

export const reviewsTableDef = {
  name: 'reviews',
  columns: {
    review_id: { type: 'INTEGER', primaryKey: true, autoincrement: true },
    job_id: { type: 'INTEGER', notNull: true },
    reviewer_id: { type: 'INTEGER', notNull: true },
    reviewee_id: { type: 'INTEGER', notNull: true },
    rating: { type: 'INTEGER CHECK(rating >= 1 AND rating <= 5)', notNull: true },
    feedback: { type: 'TEXT' },
    created_at: { type: "DATETIME DEFAULT CURRENT_TIMESTAMP" }
  },
  foreignKeys: [
    { column: 'job_id', references: 'jobs(job_id) ON DELETE CASCADE' },
    { column: 'reviewer_id', references: 'users(user_id) ON DELETE CASCADE' },
    { column: 'reviewee_id', references: 'users(user_id) ON DELETE CASCADE' }
  ]
};

export const paymentsTableDef = {
  name: 'payments',
  columns: {
    payment_id: { type: 'INTEGER', primaryKey: true, autoincrement: true },
    job_id: { type: 'INTEGER', notNull: true },
    payer_id: { type: 'INTEGER', notNull: true },
    payee_id: { type: 'INTEGER', notNull: true },
    amount: { type: 'REAL', notNull: true },
    status: { type: "TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'completed', 'failed', 'refunded'))" },
    created_at: { type: "DATETIME DEFAULT CURRENT_TIMESTAMP" },
    completed_at: { type: 'DATETIME' }
  },
  foreignKeys: [
    { column: 'job_id', references: 'jobs(job_id) ON DELETE CASCADE' },
    { column: 'payer_id', references: 'users(user_id) ON DELETE CASCADE' },
    { column: 'payee_id', references: 'users(user_id) ON DELETE CASCADE' }
  ]
};

export const messagesTableDef = {
  name: 'messages',
  columns: {
    message_id: { type: 'INTEGER', primaryKey: true, autoincrement: true },
    sender_id: { type: 'INTEGER', notNull: true },
    receiver_id: { type: 'INTEGER', notNull: true },
    job_id: { type: 'INTEGER' },
    body: { type: 'TEXT', notNull: true },
    is_read: { type: 'INTEGER DEFAULT 0' },
    sent_at: { type: "DATETIME DEFAULT CURRENT_TIMESTAMP" }
  },
  foreignKeys: [
    { column: 'sender_id', references: 'users(user_id) ON DELETE CASCADE' },
    { column: 'receiver_id', references: 'users(user_id) ON DELETE CASCADE' },
    { column: 'job_id', references: 'jobs(job_id) ON DELETE SET NULL' }
  ]
};

export const supportTicketsTableDef = {
  name: 'supporttickets',
  columns: {
    ticket_id: { type: 'INTEGER', primaryKey: true, autoincrement: true },
    user_id: { type: 'INTEGER', notNull: true },
    subject: { type: 'TEXT', notNull: true },
    message: { type: 'TEXT', notNull: true },
    status: { type: "TEXT DEFAULT 'Open' CHECK(status IN ('Open', 'In Progress', 'Escalated', 'Resolved', 'Closed'))" },
    priority: { type: "TEXT DEFAULT 'normal' CHECK(priority IN ('low', 'normal', 'high', 'urgent'))" },
    assigned_to: { type: 'INTEGER' },
    created_at: { type: "DATETIME DEFAULT CURRENT_TIMESTAMP" },
    updated_at: { type: "DATETIME DEFAULT CURRENT_TIMESTAMP" }
  },
  foreignKeys: [
    { column: 'user_id', references: 'users(user_id) ON DELETE CASCADE' },
    { column: 'assigned_to', references: 'users(user_id) ON DELETE SET NULL' }
  ]
};

export const auditLogsTableDef = {
  name: 'audit_logs',
  columns: {
    log_id: { type: 'INTEGER', primaryKey: true, autoincrement: true },
    user_id: { type: 'INTEGER' },
    action: { type: 'TEXT', notNull: true },
    entity_type: { type: 'TEXT', notNull: true },
    entity_id: { type: 'INTEGER' },
    old_value: { type: 'TEXT' },
    new_value: { type: 'TEXT' },
    ip_address: { type: 'TEXT' },
    created_at: { type: "DATETIME DEFAULT CURRENT_TIMESTAMP" }
  },
  foreignKeys: [
    { column: 'user_id', references: 'users(user_id) ON DELETE SET NULL' }
  ]
};

export const jobFlagsTableDef = {
  name: 'job_flags',
  columns: {
    flag_id: { type: 'INTEGER', primaryKey: true, autoincrement: true },
    job_id: { type: 'INTEGER', notNull: true },
    flagged_by: { type: 'INTEGER', notNull: true },
    reason: { type: 'TEXT', notNull: true },
    status: { type: "TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'reviewed', 'dismissed'))" },
    created_at: { type: "DATETIME DEFAULT CURRENT_TIMESTAMP" },
    reviewed_at: { type: 'DATETIME' },
    reviewed_by: { type: 'INTEGER' }
  },
  foreignKeys: [
    { column: 'job_id', references: 'jobs(job_id) ON DELETE CASCADE' },
    { column: 'flagged_by', references: 'users(user_id) ON DELETE CASCADE' },
    { column: 'reviewed_by', references: 'users(user_id) ON DELETE SET NULL' }
  ]
};

function createTableStatement(def: { 
    name: string;
    columns: { [key: string]: { type: string; primaryKey?: boolean; autoincrement?: boolean; notNull?: boolean; unique?: boolean; default?: any }},
    primaryKey?: string[];
    foreignKeys?: { column: string; references: string }[];
  }): string {
  
  const cols = Object.entries(def.columns).map(([name, opts]) => {
    let colDef = `${name} ${opts.type}`;
    if (opts.primaryKey) colDef += ' PRIMARY KEY';
    if (opts.autoincrement) colDef += ' AUTOINCREMENT';
    if (opts.notNull) colDef += ' NOT NULL';
    if (opts.unique) colDef += ' UNIQUE';
    if (opts.default !== undefined) colDef += ` DEFAULT ${opts.default}`;
    return colDef;
  });    
  
  if(def.primaryKey) {
    cols.push(`PRIMARY KEY (${def.primaryKey.join(', ')})`);
  }
  
  if(def.foreignKeys) {
    def.foreignKeys.forEach(fk => {
      cols.push(`FOREIGN KEY (${fk.column}) REFERENCES ${fk.references}`);
    });
  }
  
  return `CREATE TABLE IF NOT EXISTS ${def.name} (\n ${cols.join(',\n ')} \n);`;
}

export async function createSchemaAndData(): Promise<void> {
  const definitions = [
    usersTableDef,
    skillsTableDef,
    profilesTableDef,
    freelancerProfilesTableDef,
    employerProfilesTableDef,
    profileSkillsTableDef,
    categoriesTableDef,
    jobsTableDef,
    jobSkillsTableDef,
    jobApplicationsTableDef,
    assignmentsTableDef,
    assignmentDeliverablesTableDef,
    reviewsTableDef,
    paymentsTableDef,
    messagesTableDef,
    supportTicketsTableDef,
    auditLogsTableDef,
    jobFlagsTableDef
  ];

  for(const def of definitions) {
    await db.connection!.run(createTableStatement(def));
  }

  await runMigrations();
  await seedSkills();
  await seedCategories();
}

async function runMigrations(): Promise<void> {
  // Add is_blocked column to users if not exists
  const usersInfo = await db.connection!.all("PRAGMA table_info(users)");
  const hasIsBlocked = usersInfo.some((col: any) => col.name === 'is_blocked');
  if (!hasIsBlocked) {
    await db.connection!.run('ALTER TABLE users ADD COLUMN is_blocked INTEGER DEFAULT 0');
    console.log('Migration: Added is_blocked column to users table');
  }

  const hasFailedAttempts = usersInfo.some((col: any) => col.name === 'failed_attempts');
  if (!hasFailedAttempts) {
    await db.connection!.run('ALTER TABLE users ADD COLUMN failed_attempts INTEGER DEFAULT 0');
    console.log('Migration: Added failed_attempts column to users table');
  }

  const hasLockUntil = usersInfo.some((col: any) => col.name === 'lock_until');
  if (!hasLockUntil) {
    await db.connection!.run('ALTER TABLE users ADD COLUMN lock_until DATETIME');
    console.log('Migration: Added lock_until column to users table');
  }

  await db.connection!.run("UPDATE jobs SET status = 'In Progress' WHERE status = 'Assigned'");

  const deliverablesInfo = await db.connection!.all("PRAGMA table_info(assignment_deliverables)");
  if (deliverablesInfo && deliverablesInfo.length > 0) {
    const hasStatus = deliverablesInfo.some((col: any) => col.name === 'status');
    if (!hasStatus) {
      await db.connection!.run("ALTER TABLE assignment_deliverables ADD COLUMN status TEXT DEFAULT 'submitted' CHECK(status IN ('submitted', 'accepted', 'changes_requested'))");
      console.log('Migration: Added status column to assignment_deliverables table');
    }

    const hasReviewerMessage = deliverablesInfo.some((col: any) => col.name === 'reviewer_message');
    if (!hasReviewerMessage) {
      await db.connection!.run('ALTER TABLE assignment_deliverables ADD COLUMN reviewer_message TEXT');
      console.log('Migration: Added reviewer_message column to assignment_deliverables table');
    }

    const hasReviewedAt = deliverablesInfo.some((col: any) => col.name === 'reviewed_at');
    if (!hasReviewedAt) {
      await db.connection!.run('ALTER TABLE assignment_deliverables ADD COLUMN reviewed_at DATETIME');
      console.log('Migration: Added reviewed_at column to assignment_deliverables table');
    }
  }
}

async function seedSkills(): Promise<void> {
  const existingSkills = await db.connection!.get('SELECT COUNT(*) as count FROM skills');
  if (existingSkills.count > 0) {
    return; 
  }

  try {
    const skillsPath = join(__dirname, '../../db/skills.json');
    const skillsData = readFileSync(skillsPath, 'utf-8');
    const skills: string[] = JSON.parse(skillsData);

    for (const skillName of skills) {
      await db.connection!.run('INSERT INTO skills (name) VALUES (?)', skillName);
    }
    console.log(`Seeded ${skills.length} skills from skills.json`);
  } catch (error) {
    console.error('Failed to seed skills:', error);
  }
}

async function seedCategories(): Promise<void> {
  const existingCategories = await db.connection!.get('SELECT COUNT(*) as count FROM categories');
  if (existingCategories.count > 0) {
    return
  } 

  try {
    const categoriesPath = join(__dirname, '../../db/categories.json');
    const categoriesData = readFileSync(categoriesPath, 'utf-8');
    const categories: { [key: string]: string } = JSON.parse(categoriesData);

    for (const [name, description] of Object.entries(categories)) {
      await db.connection!.run(
        'INSERT INTO categories (name, description) VALUES (?, ?)',
        name,
        description
      );
    }
    console.log(`Seeded ${Object.keys(categories).length} categories from categories.json`);
  } catch (error) {
    console.error('Failed to seed categories:', error);
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  openDb().catch((error) => {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  });
}
