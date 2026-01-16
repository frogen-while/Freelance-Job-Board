const Database = require('better-sqlite3');
const db = new Database('./db/freelance.sqlite3');

// SQLite doesn't support DROP COLUMN directly, need to recreate table
const tableInfo = db.prepare('PRAGMA table_info(freelancer_profiles)').all();
console.log('Current columns:', tableInfo.map(c => c.name));

const hasColumn = tableInfo.some(c => c.name === 'availability_status');
if (hasColumn) {
  console.log('Removing availability_status column...');
  
  // Create new table without availability_status
  db.exec(`
    CREATE TABLE freelancer_profiles_new (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL UNIQUE,
      title TEXT,
      hourly_rate REAL,
      experience_level TEXT CHECK(experience_level IN ('entry', 'intermediate', 'expert')),
      github_url TEXT,
      linkedin_url TEXT,
      jobs_completed INTEGER DEFAULT 0,
      rating REAL DEFAULT 0,
      reviews_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
    )
  `);
  
  // Copy data
  db.exec(`
    INSERT INTO freelancer_profiles_new (id, user_id, title, hourly_rate, experience_level, github_url, linkedin_url, jobs_completed, rating, reviews_count, created_at, updated_at)
    SELECT id, user_id, title, hourly_rate, experience_level, github_url, linkedin_url, jobs_completed, rating, reviews_count, created_at, updated_at
    FROM freelancer_profiles
  `);
  
  // Drop old and rename new
  db.exec('DROP TABLE freelancer_profiles');
  db.exec('ALTER TABLE freelancer_profiles_new RENAME TO freelancer_profiles');
  
  console.log('Column removed successfully!');
  
  // Verify
  const newInfo = db.prepare('PRAGMA table_info(freelancer_profiles)').all();
  console.log('New columns:', newInfo.map(c => c.name));
} else {
  console.log('Column availability_status does not exist, nothing to remove.');
}

db.close();
