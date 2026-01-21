

DROP DATABASE IF EXISTS freelance_job_board;

CREATE DATABASE freelance_job_board
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE freelance_job_board;

CREATE TABLE users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  main_role ENUM('Admin', 'Manager', 'Support', 'Employer', 'Freelancer') NOT NULL,
  is_blocked TINYINT DEFAULT 0,
  failed_attempts INT DEFAULT 0,
  lock_until DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_email (email)
) ENGINE=InnoDB;

CREATE TABLE skills (
  skill_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE
) ENGINE=InnoDB;

CREATE TABLE profiles (
  profile_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  display_name VARCHAR(100),
  headline VARCHAR(255),
  description TEXT,
  photo_url VARCHAR(500),
  location VARCHAR(255),
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE freelancer_profiles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  title VARCHAR(255),
  hourly_rate DECIMAL(10,2),
  experience_level ENUM('entry', 'intermediate', 'expert'),
  github_url VARCHAR(500),
  linkedin_url VARCHAR(500),
  jobs_completed INT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE employer_profiles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  company_name VARCHAR(255),
  company_description TEXT,
  company_website VARCHAR(500),
  company_size ENUM('1-10', '11-50', '51-200', '201-500', '500+'),
  industry VARCHAR(100),
  jobs_posted INT DEFAULT 0,
  total_spent DECIMAL(12,2) DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE profile_skills (
  user_id INT NOT NULL,
  skill_id INT NOT NULL,
  PRIMARY KEY (user_id, skill_id),
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (skill_id) REFERENCES skills(skill_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE categories (
  category_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  manager_id INT,
  FOREIGN KEY (manager_id) REFERENCES users(user_id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE jobs (
  job_id INT AUTO_INCREMENT PRIMARY KEY,
  employer_id INT NOT NULL,
  category_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  budget DECIMAL(10,2),
  status ENUM('Open', 'In Progress', 'Completed', 'Cancelled') DEFAULT 'Open',
  deadline DATE,
  experience_level ENUM('entry', 'intermediate', 'expert'),
  job_type ENUM('fixed', 'hourly') DEFAULT 'fixed',
  duration_estimate ENUM('less_than_week', '1_2_weeks', '2_4_weeks', '1_3_months', '3_6_months', 'more_than_6_months'),
  is_remote BOOLEAN DEFAULT TRUE,
  location VARCHAR(255),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (employer_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE RESTRICT,
  INDEX idx_jobs_employer_id (employer_id),
  INDEX idx_jobs_category_id (category_id),
  INDEX idx_jobs_status (status),
  INDEX idx_jobs_created_at (created_at DESC),
  FULLTEXT INDEX ft_jobs_search (title, description)
) ENGINE=InnoDB;

CREATE TABLE job_skills (
  job_id INT NOT NULL,
  skill_id INT NOT NULL,
  PRIMARY KEY (job_id, skill_id),
  FOREIGN KEY (job_id) REFERENCES jobs(job_id) ON DELETE CASCADE,
  FOREIGN KEY (skill_id) REFERENCES skills(skill_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE jobapplications (
  application_id INT AUTO_INCREMENT PRIMARY KEY,
  job_id INT NOT NULL,
  freelancer_id INT NOT NULL,
  bid_amount DECIMAL(10,2) NOT NULL,
  proposal_text TEXT,
  status ENUM('Pending', 'Accepted', 'Rejected', 'Completed') DEFAULT 'Pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (job_id) REFERENCES jobs(job_id) ON DELETE CASCADE,
  FOREIGN KEY (freelancer_id) REFERENCES users(user_id) ON DELETE CASCADE,
  UNIQUE KEY uk_job_freelancer (job_id, freelancer_id),
  INDEX idx_jobappl_job_id (job_id),
  INDEX idx_jobappl_freelancer_id (freelancer_id)
) ENGINE=InnoDB;

CREATE TABLE assignments (
  assignment_id INT AUTO_INCREMENT PRIMARY KEY,
  job_id INT NOT NULL,
  freelancer_id INT NOT NULL,
  status ENUM('Active', 'Completed', 'Terminated') DEFAULT 'Active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (job_id) REFERENCES jobs(job_id) ON DELETE CASCADE,
  FOREIGN KEY (freelancer_id) REFERENCES users(user_id) ON DELETE CASCADE,
  INDEX idx_assignments_job_id (job_id),
  INDEX idx_assignments_freelancer_id (freelancer_id)
) ENGINE=InnoDB;

CREATE TABLE assignment_deliverables (
  deliverable_id INT AUTO_INCREMENT PRIMARY KEY,
  assignment_id INT NOT NULL,
  freelancer_id INT NOT NULL,
  file_path TEXT,
  file_name TEXT,
  file_size INT,
  mime_type TEXT,
  link_url TEXT,
  status ENUM('submitted', 'accepted', 'changes_requested') DEFAULT 'submitted',
  reviewer_message TEXT,
  reviewed_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (assignment_id) REFERENCES assignments(assignment_id) ON DELETE CASCADE,
  FOREIGN KEY (freelancer_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE reviews (
  review_id INT AUTO_INCREMENT PRIMARY KEY,
  job_id INT NOT NULL,
  reviewer_id INT NOT NULL,
  reviewee_id INT NOT NULL,
  rating TINYINT UNSIGNED NOT NULL CHECK (rating >= 1 AND rating <= 5),
  feedback TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (job_id) REFERENCES jobs(job_id) ON DELETE CASCADE,
  FOREIGN KEY (reviewer_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (reviewee_id) REFERENCES users(user_id) ON DELETE CASCADE,
  INDEX idx_reviews_job_id (job_id),
  INDEX idx_reviews_reviewee_id (reviewee_id)
) ENGINE=InnoDB;

CREATE TABLE payments (
  payment_id INT AUTO_INCREMENT PRIMARY KEY,
  job_id INT NOT NULL,
  payer_id INT NOT NULL,
  payee_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME,
  FOREIGN KEY (job_id) REFERENCES jobs(job_id) ON DELETE CASCADE,
  FOREIGN KEY (payer_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (payee_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE messages (
  message_id INT AUTO_INCREMENT PRIMARY KEY,
  sender_id INT NOT NULL,
  receiver_id INT NOT NULL,
  job_id INT,
  body TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sender_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (receiver_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (job_id) REFERENCES jobs(job_id) ON DELETE SET NULL,
  INDEX idx_messages_sender_id (sender_id),
  INDEX idx_messages_receiver_id (receiver_id),
  INDEX idx_messages_sent_at (sent_at DESC)
) ENGINE=InnoDB;

CREATE TABLE supporttickets (
  ticket_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  subject VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  status ENUM('Open', 'In Progress', 'Escalated', 'Resolved', 'Closed') DEFAULT 'Open',
  priority ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal',
  assigned_to INT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_to) REFERENCES users(user_id) ON DELETE SET NULL,
  INDEX idx_tickets_user_id (user_id),
  INDEX idx_tickets_status (status),
  INDEX idx_tickets_assigned_to (assigned_to)
) ENGINE=InnoDB;

CREATE TABLE audit_logs (
  log_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id INT,
  old_value JSON,
  new_value JSON,
  ip_address VARCHAR(45),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL,
  INDEX idx_audit_user_id (user_id),
  INDEX idx_audit_created_at (created_at DESC)
) ENGINE=InnoDB;
