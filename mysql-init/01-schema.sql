-- King's Cup Party Database Schema for MySQL

-- Set character set for the database
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- Games table for storing game icons, covers, and profiles
CREATE TABLE IF NOT EXISTS games (
  id VARCHAR(50) PRIMARY KEY,
  title VARCHAR(100),
  image_url LONGTEXT,
  cover_url LONGTEXT,
  emoji VARCHAR(20),
  gradient VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Floating names for admin panel
CREATE TABLE IF NOT EXISTS floating_names (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Game rooms
CREATE TABLE IF NOT EXISTS rooms (
  id VARCHAR(100) PRIMARY KEY,
  code VARCHAR(10) UNIQUE NOT NULL,
  host_name VARCHAR(100),
  game_type VARCHAR(50) DEFAULT 'kingscup',
  is_active BOOLEAN DEFAULT TRUE,
  game_started BOOLEAN DEFAULT FALSE,
  deck JSON,
  current_card JSON,
  cards_remaining INT DEFAULT 52,
  game_phase VARCHAR(50) DEFAULT 'waiting',
  current_player_index INT DEFAULT 0,
  game_state JSON,
  timer_seconds INT DEFAULT 30,
  include_mr_white BOOLEAN DEFAULT FALSE,
  selected_category VARCHAR(100) DEFAULT 'all',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Players in rooms
CREATE TABLE IF NOT EXISTS players (
  id VARCHAR(100) PRIMARY KEY,
  room_id VARCHAR(100),
  name VARCHAR(100),
  is_host BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  avatar INT DEFAULT 1,
  cards JSON,
  points INT DEFAULT 0,
  bet INT DEFAULT 0,
  has_drawn BOOLEAN DEFAULT FALSE,
  is_dealer BOOLEAN DEFAULT FALSE,
  result VARCHAR(50),
  multiplier DECIMAL(5,2) DEFAULT 1.0,
  player_order INT DEFAULT 0,
  role VARCHAR(50),
  word VARCHAR(200),
  is_alive BOOLEAN DEFAULT TRUE,
  has_voted BOOLEAN DEFAULT FALSE,
  voted_for VARCHAR(100),
  vote_count INT DEFAULT 0,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
);

-- Paranoia questions
CREATE TABLE IF NOT EXISTS paranoia_questions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  question TEXT NOT NULL,
  is_default BOOLEAN DEFAULT TRUE,
  created_by VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Five seconds questions
CREATE TABLE IF NOT EXISTS five_sec_questions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  topic TEXT NOT NULL,
  answer_count INT DEFAULT 3,
  is_default BOOLEAN DEFAULT TRUE,
  created_by VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Undercover vocabulary pairs
CREATE TABLE IF NOT EXISTS undercover_vocabulary (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category VARCHAR(100) DEFAULT 'general',
  civilian_word VARCHAR(200) NOT NULL,
  undercover_word VARCHAR(200) NOT NULL,
  is_default BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default games
INSERT IGNORE INTO games (id, title, emoji, gradient) VALUES
  ('kingscup', 'King''s Cup', '🎴', 'from-red-500 to-orange-500'),
  ('pokdeng', 'Pok Deng', '��', 'from-emerald-500 to-green-600'),
  ('undercover', 'Undercover', '🕵️', 'from-purple-500 to-indigo-600'),
  ('paranoia', 'Paranoia', '😱', 'from-pink-500 to-rose-500'),
  ('fivesec', '5 Seconds', '⏱️', 'from-blue-500 to-cyan-500');

-- Insert some default paranoia questions
INSERT IGNORE INTO paranoia_questions (question, is_default) VALUES
  ('ใครในห้องนี้ชอบนินทาคนอื่นมากที่สุด?', TRUE),
  ('ใครในห้องนี้จะรวยที่สุดในอีก 10 ปี?', TRUE),
  ('ใครในห้องนี้เหมาะจะเป็นนักการเมือง?', TRUE),
  ('ใครในห้องนี้มีความลับเยอะที่สุด?', TRUE),
  ('ใครในห้องนี้น่าจะเป็นคนหลอกลวงเก่ง?', TRUE);

-- Insert some default 5 seconds questions
INSERT IGNORE INTO five_sec_questions (topic, answer_count, is_default) VALUES
  ('บอกชื่อผลไม้สีแดง 3 อย่าง', 3, TRUE),
  ('บอกชื่อประเทศในเอเชีย 3 ประเทศ', 3, TRUE),
  ('บอกชื่อสัตว์ที่มี 4 ขา 3 ตัว', 3, TRUE),
  ('บอกยี่ห้อรถยนต์ 3 ยี่ห้อ', 3, TRUE),
  ('บอกชื่อนักร้องไทย 3 คน', 3, TRUE);

-- Insert some default undercover vocabulary
INSERT IGNORE INTO undercover_vocabulary (category, civilian_word, undercover_word, is_default) VALUES
  ('อาหาร', 'ส้มตำ', 'ยำ', TRUE),
  ('อาหาร', 'ข้าวผัด', 'ข้าวคลุกกะปิ', TRUE),
  ('สถานที่', 'เซเว่น', 'แฟมิลี่มาร์ท', TRUE),
  ('ของใช้', 'โทรศัพท์', 'แท็บเล็ต', TRUE),
  ('กีฬา', 'ฟุตบอล', 'ฟุตซอล', TRUE);
