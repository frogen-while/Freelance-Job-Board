

DROP DATABASE IF EXISTS freelance_job_board;

CREATE DATABASE freelance_job_board
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE freelance_job_board;


CREATE TABLE usertypes (
  type_id INT AUTO_INCREMENT PRIMARY KEY,
  type_name ENUM('Employer', 'Freelancer', 'Reviewer', 'Support') NOT NULL
) ENGINE=InnoDB;

CREATE TABLE users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  main_role ENUM('Administrator', 'Management', 'Regular', 'Unregistered') NOT NULL,
  status ENUM('active', 'suspended', 'archived') DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_email (email)
) ENGINE=InnoDB;

CREATE TABLE user_usertypes (
  user_id INT NOT NULL,
  type_id INT NOT NULL,
  PRIMARY KEY (user_id, type_id),
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (type_id) REFERENCES usertypes(type_id) ON DELETE CASCADE
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
  hourly_rate DECIMAL(10,2),
  availability_status ENUM('available', 'partially_available', 'not_available') DEFAULT 'available',
  onboarding_completed BOOLEAN DEFAULT FALSE,
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
  status ENUM('Open', 'Assigned', 'In Progress', 'Completed', 'Cancelled') DEFAULT 'Open',
  deadline DATE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (employer_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE RESTRICT,
  INDEX idx_jobs_status (status),
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
  status ENUM('Pending', 'Accepted', 'Rejected') DEFAULT 'Pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (job_id) REFERENCES jobs(job_id) ON DELETE CASCADE,
  FOREIGN KEY (freelancer_id) REFERENCES users(user_id) ON DELETE CASCADE,
  UNIQUE KEY uk_job_freelancer (job_id, freelancer_id)
) ENGINE=InnoDB;

CREATE TABLE assignments (
  assignment_id INT AUTO_INCREMENT PRIMARY KEY,
  job_id INT NOT NULL,
  freelancer_id INT NOT NULL,
  status ENUM('Active', 'Completed', 'Terminated') DEFAULT 'Active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (job_id) REFERENCES jobs(job_id) ON DELETE CASCADE,
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
  FOREIGN KEY (reviewee_id) REFERENCES users(user_id) ON DELETE CASCADE
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
  INDEX idx_messages_receiver (receiver_id, is_read)
) ENGINE=InnoDB;

CREATE TABLE supporttickets (
  ticket_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  support_id INT,
  subject VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  status ENUM('Open', 'In Progress', 'Resolved', 'Closed') DEFAULT 'Open',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (support_id) REFERENCES users(user_id) ON DELETE SET NULL
) ENGINE=InnoDB;


INSERT INTO usertypes (type_name) VALUES 
  ('Employer'),
  ('Freelancer'),
  ('Reviewer'),
  ('Support');
