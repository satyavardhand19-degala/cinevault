-- Run this in the Supabase SQL editor to create all tables

-- Movies table
CREATE TABLE IF NOT EXISTS movies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  slug VARCHAR(200) UNIQUE,
  tagline VARCHAR(300),
  synopsis TEXT NOT NULL,
  release_date DATE NOT NULL,
  runtime INTEGER,
  language TEXT[] DEFAULT '{}',
  country VARCHAR(100),
  genres TEXT[] DEFAULT '{}',
  director VARCHAR(200) NOT NULL,
  "cast" JSONB DEFAULT '[]',
  rating NUMERIC(3,1) DEFAULT 0 CHECK (rating >= 0 AND rating <= 10),
  poster_url TEXT NOT NULL,
  backdrop_url TEXT,
  trailer_url TEXT NOT NULL,
  trailer_type VARCHAR(20) DEFAULT 'youtube' CHECK (trailer_type IN ('youtube', 'hosted')),
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('published', 'draft')),
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  email VARCHAR(200) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admins table
CREATE TABLE IF NOT EXISTS admins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  email VARCHAR(200) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role VARCHAR(20) DEFAULT 'admin' CHECK (role IN ('admin', 'superadmin')),
  last_login TIMESTAMPTZ,
  login_attempts INTEGER DEFAULT 0,
  lock_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_movies_status_deleted ON movies (status, is_deleted);
CREATE INDEX IF NOT EXISTS idx_movies_release_date ON movies (release_date DESC);
CREATE INDEX IF NOT EXISTS idx_movies_genres ON movies USING GIN (genres);
CREATE INDEX IF NOT EXISTS idx_movies_language ON movies USING GIN (language);

-- Auto-update updated_at on row changes
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER movies_updated_at
  BEFORE UPDATE ON movies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER admins_updated_at
  BEFORE UPDATE ON admins
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
