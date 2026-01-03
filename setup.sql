-- 1. Enable UUID extension (Standard for modern web apps)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Define Enum Types (Restricts inputs to specific values)
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('ADMIN', 'INNOVATOR', 'INVESTOR');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE deal_status AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'ACTIVE', 'REJECTED', 'CLOSED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE request_status AS ENUM ('PENDING', 'APPROVED', 'DENIED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE doc_type AS ENUM ('PITCH_DECK', 'FINANCIALS', 'CAP_TABLE', 'OTHER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Users Table (Authentication & Authorization)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL, -- Store BCrypt/Argon2 hash, NEVER plain text
    role VARCHAR(255) NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE, -- The "Admin Gatekeeper" switch
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Innovator Profiles (The Supply Side)
CREATE TABLE IF NOT EXISTS innovator_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    company_name VARCHAR(255) NOT NULL,
    industry VARCHAR(100) NOT NULL,
    funding_stage VARCHAR(50), -- e.g., 'Pre-Seed', 'Series A'
    linkedin_url VARCHAR(255),
    fee_agreement_signed BOOLEAN DEFAULT FALSE NOT NULL, -- Legal requirement
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Investor Profiles (The Demand Side)
CREATE TABLE IF NOT EXISTS investor_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    accreditation_doc_url TEXT, -- Link to the S3 file for manual verification
    min_ticket_size NUMERIC(12, 2),
    max_ticket_size NUMERIC(12, 2),
    interested_industries TEXT[], -- Array of strings: ['Fintech', 'Agri']
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Deals (The Listings)
CREATE TABLE IF NOT EXISTS deals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    innovator_id UUID NOT NULL REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    teaser_summary TEXT NOT NULL, -- LAYER 1: Publicly visible
    target_amount NUMERIC(15, 2) NOT NULL,
    industry VARCHAR(100) NOT NULL,
    status deal_status DEFAULT 'DRAFT',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Deal Documents (The Private Data Room)
CREATE TABLE IF NOT EXISTS deal_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
    file_url TEXT NOT NULL, -- S3 Link
    file_type doc_type NOT NULL,
    is_private BOOLEAN DEFAULT TRUE, -- LAYER 2: Defaults to locked
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Access Requests (The Matchmaking Engine)
CREATE TABLE IF NOT EXISTS access_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
    investor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status request_status DEFAULT 'PENDING',
    nda_signed BOOLEAN DEFAULT FALSE,
    nda_signed_at TIMESTAMP WITH TIME ZONE,
    intro_requested BOOLEAN DEFAULT FALSE, -- The "Soft Commit" button
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Prevent an investor from requesting the same deal twice
    UNIQUE(deal_id, investor_id) 
);

-- 9. Mandates (The Reverse Pitch)
CREATE TABLE IF NOT EXISTS mandates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    investor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    amount_allocation NUMERIC(12, 2),
    target_industry VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. Performance Indexes (Makes the app fast)
CREATE INDEX IF NOT EXISTS idx_deals_industry ON deals(industry);
CREATE INDEX IF NOT EXISTS idx_deals_status ON deals(status);
CREATE INDEX IF NOT EXISTS idx_investor_industries ON investor_profiles USING GIN(interested_industries);
CREATE INDEX IF NOT EXISTS idx_access_requests_investor ON access_requests(investor_id);

-- 11. Auto-update 'updated_at' Trigger Function
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to tables that change often
DROP TRIGGER IF EXISTS update_users_modtime ON users;
CREATE TRIGGER update_users_modtime BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

DROP TRIGGER IF EXISTS update_deals_modtime ON deals;
CREATE TRIGGER update_deals_modtime BEFORE UPDATE ON deals FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

DROP TRIGGER IF EXISTS update_access_modtime ON access_requests;
CREATE TRIGGER update_access_modtime BEFORE UPDATE ON access_requests FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

-- Seed script
-- Start a transaction to ensure all data goes in together or not at all
DO $$
DECLARE
    -- Variables to hold the generated IDs so we can link them
    v_admin_id UUID;
    v_inno_1_id UUID;
    v_inno_2_id UUID;
    v_invest_1_id UUID;
    v_invest_2_id UUID;
    v_deal_1_id UUID;
    v_deal_2_id UUID;
BEGIN

    -- ==========================================
    -- 1. CREATE USERS
    -- ==========================================
    
    -- Admin User (You)
    IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@innovest.com') THEN
        INSERT INTO users (email, password_hash, role, is_verified)
        VALUES ('admin@innovest.com', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', 'ADMIN', TRUE)
        RETURNING id INTO v_admin_id;
    ELSE
        SELECT id INTO v_admin_id FROM users WHERE email = 'admin@innovest.com';
    END IF;

    -- Innovator 1 (Verified & Active)
    IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'sarah@agritech.com') THEN
        INSERT INTO users (email, password_hash, role, is_verified)
        VALUES ('sarah@agritech.com', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', 'INNOVATOR', TRUE)
        RETURNING id INTO v_inno_1_id;
    ELSE
        SELECT id INTO v_inno_1_id FROM users WHERE email = 'sarah@agritech.com';
    END IF;

    -- Innovator 2 (New signup, waiting for approval)
    IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'mike@fintech.io') THEN
        INSERT INTO users (email, password_hash, role, is_verified)
        VALUES ('mike@fintech.io', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', 'INNOVATOR', FALSE)
        RETURNING id INTO v_inno_2_id;
    ELSE
        SELECT id INTO v_inno_2_id FROM users WHERE email = 'mike@fintech.io';
    END IF;

    -- Investor 1 (Verified, ready to invest)
    IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'wayne@capital.com') THEN
        INSERT INTO users (email, password_hash, role, is_verified)
        VALUES ('wayne@capital.com', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', 'INVESTOR', TRUE)
        RETURNING id INTO v_invest_1_id;
    ELSE
        SELECT id INTO v_invest_1_id FROM users WHERE email = 'wayne@capital.com';
    END IF;

    -- Investor 2 (New signup, unverified)
    IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'newbie@invest.com') THEN
        INSERT INTO users (email, password_hash, role, is_verified)
        VALUES ('newbie@invest.com', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', 'INVESTOR', FALSE)
        RETURNING id INTO v_invest_2_id;
    ELSE
        SELECT id INTO v_invest_2_id FROM users WHERE email = 'newbie@invest.com';
    END IF;

    -- ==========================================
    -- 2. CREATE PROFILES
    -- ==========================================

    -- Sarah's AgriTech Profile
    IF v_inno_1_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM innovator_profiles WHERE user_id = v_inno_1_id) THEN
        INSERT INTO innovator_profiles (user_id, company_name, industry, funding_stage, linkedin_url, fee_agreement_signed)
        VALUES (v_inno_1_id, 'GreenGrow AI', 'AgriTech', 'Pre-Seed', 'https://linkedin.com/in/sarah-agri', TRUE);
    END IF;

    -- Mike's Fintech Profile
    IF v_inno_2_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM innovator_profiles WHERE user_id = v_inno_2_id) THEN
        INSERT INTO innovator_profiles (user_id, company_name, industry, funding_stage, linkedin_url, fee_agreement_signed)
        VALUES (v_inno_2_id, 'PayRural', 'Fintech', 'Seed', 'https://linkedin.com/in/mike-fin', TRUE);
    END IF;

    -- Wayne's Investor Profile
    IF v_invest_1_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM investor_profiles WHERE user_id = v_invest_1_id) THEN
        INSERT INTO investor_profiles (user_id, accreditation_doc_url, min_ticket_size, max_ticket_size, interested_industries)
        VALUES (v_invest_1_id, 's3://secure-bucket/wayne-tax.pdf', 50000, 500000, ARRAY['AgriTech', 'SaaS']);
    END IF;

    -- Newbie's Investor Profile (Empty doc url, needs upload)
    IF v_invest_2_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM investor_profiles WHERE user_id = v_invest_2_id) THEN
        INSERT INTO investor_profiles (user_id, min_ticket_size, max_ticket_size, interested_industries)
        VALUES (v_invest_2_id, 10000, 50000, ARRAY['Tech']);
    END IF;

    -- ==========================================
    -- 3. POST DEALS
    -- ==========================================

    -- Deal 1: GreenGrow AI (Active and Live)
    IF v_inno_1_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM deals WHERE innovator_id = v_inno_1_id AND title = 'AI-Driven Drone Analytics for Rural Farms') THEN
        INSERT INTO deals (innovator_id, title, teaser_summary, target_amount, industry, status)
        VALUES (v_inno_1_id, 
                'AI-Driven Drone Analytics for Rural Farms', 
                'We use drones to detect crop disease 3 weeks before the human eye. Seeking partners to expand to Midwest.', 
                250000.00, 
                'AgriTech', 
                'ACTIVE')
        RETURNING id INTO v_deal_1_id;
    ELSE
        SELECT id INTO v_deal_1_id FROM deals WHERE innovator_id = v_inno_1_id AND title = 'AI-Driven Drone Analytics for Rural Farms';
    END IF;

    -- Deal 2: PayRural (Draft/Pending)
    IF v_inno_2_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM deals WHERE innovator_id = v_inno_2_id AND title = 'SMS Banking for the Unbanked') THEN
        INSERT INTO deals (innovator_id, title, teaser_summary, target_amount, industry, status)
        VALUES (v_inno_2_id, 
                'SMS Banking for the Unbanked', 
                'Bringing banking to remote villages via SMS protocols.', 
                150000.00, 
                'Fintech', 
                'PENDING_APPROVAL')
        RETURNING id INTO v_deal_2_id;
    ELSE
        SELECT id INTO v_deal_2_id FROM deals WHERE innovator_id = v_inno_2_id AND title = 'SMS Banking for the Unbanked';
    END IF;

    -- ==========================================
    -- 4. UPLOAD DOCUMENTS (Private Layer)
    -- ==========================================

    -- Documents for Deal 1 (GreenGrow)
    IF v_deal_1_id IS NOT NULL THEN
        INSERT INTO deal_documents (deal_id, file_url, file_type, is_private)
        SELECT v_deal_1_id, 's3://bucket/greengrow_pitch.pdf', 'PITCH_DECK', TRUE
        WHERE NOT EXISTS (SELECT 1 FROM deal_documents WHERE deal_id = v_deal_1_id AND file_type = 'PITCH_DECK');

        INSERT INTO deal_documents (deal_id, file_url, file_type, is_private)
        SELECT v_deal_1_id, 's3://bucket/greengrow_financials.pdf', 'FINANCIALS', TRUE
        WHERE NOT EXISTS (SELECT 1 FROM deal_documents WHERE deal_id = v_deal_1_id AND file_type = 'FINANCIALS');
    END IF;

    -- ==========================================
    -- 5. ACCESS REQUESTS (The Matchmaking)
    -- ==========================================

    -- Scenario A: Wayne (Investor 1) requests access to GreenGrow, Approved, NDA Signed
    IF v_deal_1_id IS NOT NULL AND v_invest_1_id IS NOT NULL THEN
        INSERT INTO access_requests (deal_id, investor_id, status, nda_signed, nda_signed_at, intro_requested)
        SELECT v_deal_1_id, v_invest_1_id, 'APPROVED', TRUE, NOW(), FALSE
        WHERE NOT EXISTS (SELECT 1 FROM access_requests WHERE deal_id = v_deal_1_id AND investor_id = v_invest_1_id);
    END IF;

    -- Scenario B: Newbie (Investor 2) requests access to GreenGrow, Pending
    IF v_deal_1_id IS NOT NULL AND v_invest_2_id IS NOT NULL THEN
        INSERT INTO access_requests (deal_id, investor_id, status, nda_signed, intro_requested)
        SELECT v_deal_1_id, v_invest_2_id, 'PENDING', FALSE, FALSE
        WHERE NOT EXISTS (SELECT 1 FROM access_requests WHERE deal_id = v_deal_1_id AND investor_id = v_invest_2_id);
    END IF;

    -- ==========================================
    -- 6. MANDATES (Reverse Pitch)
    -- ==========================================
    
    IF v_invest_1_id IS NOT NULL THEN
        INSERT INTO mandates (investor_id, description, amount_allocation, target_industry)
        SELECT v_invest_1_id, 'Looking for sustainable farming startups with existing revenue.', 100000, 'AgriTech'
        WHERE NOT EXISTS (SELECT 1 FROM mandates WHERE investor_id = v_invest_1_id);
    END IF;

END $$;
