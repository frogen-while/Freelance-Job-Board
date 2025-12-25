// open sqlite database and create tables if they do not exist
import { open, Database } from "sqlite";
import sqlite3 from "sqlite3"
import { pathToFileURL } from 'node:url';

export const db: { connection: Database | null} = {
  connection: null
};

export async function openDb(): Promise<void> {
  db.connection = await open({
    filename: process.env.DBFILE || './db/freelance.sqlite3',
    driver: sqlite3.Database
  });
  const { user_version } = await db.connection.get('PRAGMA user_version;') 
  if(!user_version) { // fresh database
    await db.connection!.exec('PRAGMA user_version = 1;');
    console.log('Reinitialize content...');
    await createSchemaAndData();
  }
  await db.connection.exec('PRAGMA foreign_keys = ON');
}

export const userTypesTableDef = {
  name: 'usertypes',
  columns: {
    type_id: { type: 'INTEGER', primaryKey: true, autoincrement: true },

    type_name: { type: "TEXT CHECK(type_name IN ('Employer', 'Freelancer', 'Reviewer', 'Support'))", notNull: true }
  }
};

export const usersTableDef = {
  name: 'users',
  columns: {
    user_id: { type: 'INTEGER', primaryKey: true, autoincrement: true },
    name: { type: 'TEXT', notNull: true },
    email: { type: 'TEXT', notNull: true, unique: true },
    password_hash: { type: 'TEXT', notNull: true },
    main_role: { type: "TEXT CHECK(main_role IN ('Administrator', 'Management', 'Regular', 'Unregistered'))", notNull: true }
  }
};

export const userUserTypesTableDef = {
  name: 'user_usertypes',
  columns: {
    user_id: { type: 'INTEGER', notNull: true },
    type_id: { type: 'INTEGER', notNull: true }
  },
  primaryKey: ['user_id', 'type_id'],
  foreignKeys: [
    { column: 'user_id', references: 'users(user_id) ON DELETE CASCADE' },
    { column: 'type_id', references: 'usertypes(type_id) ON DELETE CASCADE' }
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
    status: { type: "TEXT DEFAULT 'Open' CHECK(status IN ('Open', 'Assigned', 'In Progress', 'Completed', 'Cancelled'))" },
    deadline: { type: 'TEXT' }
  },
  foreignKeys: [
    { column: 'employer_id', references: 'users(user_id) ON DELETE CASCADE' },
    { column: 'category_id', references: 'categories(category_id) ON DELETE RESTRICT' }
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
    status: { type: "TEXT DEFAULT 'Pending' CHECK(status IN ('Pending', 'Accepted', 'Rejected'))" }
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
    status: { type: "TEXT DEFAULT 'Active' CHECK(status IN ('Active', 'Completed', 'Terminated'))" }
  },
  foreignKeys: [
    { column: 'job_id', references: 'jobs(job_id) ON DELETE CASCADE' },
    { column: 'freelancer_id', references: 'users(user_id) ON DELETE CASCADE' }
  ]
};

export const jobReviewsTableDef = {
  name: 'jobreviews',
  columns: {
    review_id: { type: 'INTEGER', primaryKey: true, autoincrement: true },
    job_id: { type: 'INTEGER', notNull: true },
    reviewer_id: { type: 'INTEGER', notNull: true },
    rating: { type: 'INTEGER CHECK(rating >= 1 AND rating <= 5)' },
    feedback: { type: 'TEXT' }
  },
  foreignKeys: [
    { column: 'job_id', references: 'jobs(job_id) ON DELETE CASCADE' },
    { column: 'reviewer_id', references: 'users(user_id) ON DELETE CASCADE' }
  ]
};

export const paymentsTableDef = {
  name: 'payments',
  columns: {
    payment_id: { type: 'INTEGER', primaryKey: true, autoincrement: true },
    job_id: { type: 'INTEGER', notNull: true },
    payer_id: { type: 'INTEGER', notNull: true },
    receiver_id: { type: 'INTEGER', notNull: true },
    amount: { type: 'REAL', notNull: true },
    status: { type: "TEXT DEFAULT 'Pending' CHECK(status IN ('Pending', 'Paid', 'Failed'))" }
  },
  foreignKeys: [
    { column: 'job_id', references: 'jobs(job_id)' },
    { column: 'payer_id', references: 'users(user_id)' },
    { column: 'receiver_id', references: 'users(user_id)' }
  ]
};

export const auditLogTableDef = {
  name: 'auditlog',
  columns: {
    log_id: { type: 'INTEGER', primaryKey: true, autoincrement: true },
    user_id: { type: 'INTEGER' },
    action: { type: 'TEXT', notNull: true },
    entity: { type: 'TEXT', notNull: true },
    entity_id: { type: 'INTEGER' },
    timestamp: { type: "DATETIME DEFAULT CURRENT_TIMESTAMP" }
  },
  foreignKeys: [
    { column: 'user_id', references: 'users(user_id) ON DELETE SET NULL' }
  ]
};

export const supportTicketsTableDef = {
  name: 'supporttickets',
  columns: {
    ticket_id: { type: 'INTEGER', primaryKey: true, autoincrement: true },
    user_id: { type: 'INTEGER', notNull: true },
    support_id: { type: 'INTEGER' },
    subject: { type: 'TEXT', notNull: true },
    message: { type: 'TEXT', notNull: true },
    status: { type: "TEXT DEFAULT 'Open' CHECK(status IN ('Open', 'In Progress', 'Closed'))" }
  },
  foreignKeys: [
    { column: 'user_id', references: 'users(user_id)' },
    { column: 'support_id', references: 'users(user_id)' }
  ]
};



function createTableStatement(def: { 
    name: string;
    columns: { [key: string]: { type: string; primaryKey?: boolean; autoincrement?: boolean; notNull?: boolean; unique?: boolean; default?: any; foreignKey?: any }},
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
    userTypesTableDef,
    usersTableDef,
    userUserTypesTableDef,
    categoriesTableDef,
    jobsTableDef,
    jobApplicationsTableDef,
    assignmentsTableDef,
    jobReviewsTableDef,
    paymentsTableDef,
    auditLogTableDef,
    supportTicketsTableDef
  ];

  for(const def of definitions) {
    await db.connection!.run(createTableStatement(def));
    console.log(`${def.name} table created`);
  }

  const types = ['Employer', 'Freelancer', 'Reviewer', 'Support'];
  for (const t of types) {
    await db.connection!.run('INSERT INTO usertypes (type_name) VALUES (?)', t);
  }
  console.log('User types created');

  const personNum = 20;

  console.log('Categories created');

  console.log('Database initialization complete.');

}

// Only run initialization when this module is executed directly
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  openDb().catch((error) => {
    console.error('❌ Failed to initialize database:', error);
    process.exit(1);
  });
}
