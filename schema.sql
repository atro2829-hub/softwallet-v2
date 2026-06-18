-- ============================================================
-- Softwallet (سوفت واليت) - Complete Database Schema
-- Yemeni Digital Wallet App
-- ============================================================

-- STEP 1: Drop ALL existing RPC functions (South Wallet legacy)
DROP FUNCTION IF EXISTS public.check_transaction_limit CASCADE;
DROP FUNCTION IF EXISTS public.convert_currency CASCADE;
DROP FUNCTION IF EXISTS public.create_transaction CASCADE;
DROP FUNCTION IF EXISTS public.generate_reference_id CASCADE;
DROP FUNCTION IF EXISTS public.get_dashboard_stats CASCADE;
DROP FUNCTION IF EXISTS public.log_activity CASCADE;
DROP FUNCTION IF EXISTS public.update_balance CASCADE;
DROP FUNCTION IF EXISTS public.update_user_balance CASCADE;

-- STEP 2: Drop ALL existing tables (South Wallet legacy - 45 tables)
DROP TABLE IF EXISTS escrow_messages CASCADE;
DROP TABLE IF EXISTS escrow_deals CASCADE;
DROP TABLE IF EXISTS support_messages CASCADE;
DROP TABLE IF EXISTS support_tickets CASCADE;
DROP TABLE IF EXISTS support_livechat CASCADE;
DROP TABLE IF EXISTS livechat_messages CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS activity_log CASCADE;
DROP TABLE IF EXISTS admin_notifications CASCADE;
DROP TABLE IF EXISTS api_balance_log CASCADE;
DROP TABLE IF EXISTS api_categories CASCADE;
DROP TABLE IF EXISTS api_products CASCADE;
DROP TABLE IF EXISTS api_providers CASCADE;
DROP TABLE IF EXISTS app_config CASCADE;
DROP TABLE IF EXISTS backup_log CASCADE;
DROP TABLE IF EXISTS banks CASCADE;
DROP TABLE IF EXISTS banners CASCADE;
DROP TABLE IF EXISTS bottom_nav CASCADE;
DROP TABLE IF EXISTS branding CASCADE;
DROP TABLE IF EXISTS bulk_codes CASCADE;
DROP TABLE IF EXISTS card_colors CASCADE;
DROP TABLE IF EXISTS commission_log CASCADE;
DROP TABLE IF EXISTS currency_cards CASCADE;
DROP TABLE IF EXISTS deposit_requests CASCADE;
DROP TABLE IF EXISTS employees CASCADE;
DROP TABLE IF EXISTS exchange_rates CASCADE;
DROP TABLE IF EXISTS feature_flags CASCADE;
DROP TABLE IF EXISTS gift_codes CASCADE;
DROP TABLE IF EXISTS instant_recharge CASCADE;
DROP TABLE IF EXISTS investments CASCADE;
DROP TABLE IF EXISTS kill_switch CASCADE;
DROP TABLE IF EXISTS kyc_documents CASCADE;
DROP TABLE IF EXISTS legal_content CASCADE;
DROP TABLE IF EXISTS limits CASCADE;
DROP TABLE IF EXISTS maintenance CASCADE;
DROP TABLE IF EXISTS offices CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS product_packages CASCADE;
DROP TABLE IF EXISTS promo_codes CASCADE;
DROP TABLE IF EXISTS sections CASCADE;
DROP TABLE IF EXISTS social_links CASCADE;
DROP TABLE IF EXISTS sub_sections CASCADE;
DROP TABLE IF EXISTS service_providers CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS user_gift_codes CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS visibility CASCADE;
DROP TABLE IF EXISTS wallet_addresses CASCADE;
DROP TABLE IF EXISTS wallet_services CASCADE;
DROP TABLE IF EXISTS withdraw_requests CASCADE;

-- STEP 3: Create all new Softwallet tables (21 tables)

-- 1. members (app users)
CREATE TABLE members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_uid UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  mobile TEXT UNIQUE,
  email TEXT UNIQUE,
  display_name TEXT,
  given_name TEXT,
  middle_name TEXT,
  family_name TEXT,
  national_code TEXT,
  profile_photo TEXT,
  access_role TEXT DEFAULT 'client' CHECK (access_role IN ('client', 'manager', 'owner')),
  account_tag TEXT UNIQUE,
  account_tier TEXT DEFAULT 'standard',
  verify_state TEXT DEFAULT 'unverified' CHECK (verify_state IN ('unverified', 'submitted', 'confirmed', 'declined')),
  is_frozen BOOLEAN DEFAULT FALSE,
  pocket_yer NUMERIC(18,2) DEFAULT 0,
  pocket_sar NUMERIC(18,2) DEFAULT 0,
  pocket_usd NUMERIC(18,2) DEFAULT 0,
  region TEXT,
  push_key TEXT,
  security_pin TEXT,
  locale TEXT DEFAULT 'ar',
  appearance TEXT DEFAULT 'auto',
  registered_at TIMESTAMPTZ DEFAULT now(),
  modified_at TIMESTAMPTZ DEFAULT now()
);

-- 2. transfers (money movements)
CREATE TABLE transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES members(id),
  receiver_id UUID REFERENCES members(id),
  amount NUMERIC(18,2) NOT NULL,
  currency TEXT DEFAULT 'YER' CHECK (currency IN ('YER','SAR','USD')),
  transfer_type TEXT NOT NULL,
  state TEXT DEFAULT 'pending' CHECK (state IN ('pending','completed','failed','refunded','cancelled')),
  summary TEXT,
  reference_code TEXT UNIQUE,
  executed_at TIMESTAMPTZ DEFAULT now()
);

-- 3. alerts (user notifications)
CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_id UUID REFERENCES members(id) ON DELETE CASCADE,
  heading TEXT NOT NULL,
  content TEXT,
  alert_kind TEXT DEFAULT 'info' CHECK (alert_kind IN ('info','transfer','security','promo','system')),
  is_seen BOOLEAN DEFAULT FALSE,
  destination TEXT,
  dispatched_at TIMESTAMPTZ DEFAULT now()
);

-- 4. service_orders (purchases, recharges, bills)
CREATE TABLE service_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES members(id),
  order_kind TEXT NOT NULL,
  service_label TEXT,
  provider_name TEXT,
  recipient_number TEXT,
  amount NUMERIC(18,2),
  currency TEXT DEFAULT 'YER',
  fee NUMERIC(18,2) DEFAULT 0,
  state TEXT DEFAULT 'pending' CHECK (state IN ('pending','processing','completed','failed','cancelled')),
  operator_note TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. deposit_tickets (deposit requests)
CREATE TABLE deposit_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES members(id),
  amount NUMERIC(18,2) NOT NULL,
  currency TEXT DEFAULT 'YER',
  method TEXT,
  proof_image TEXT,
  state TEXT DEFAULT 'pending' CHECK (state IN ('pending','approved','rejected')),
  reviewer_id UUID REFERENCES members(id),
  reviewer_note TEXT,
  submitted_at TIMESTAMPTZ DEFAULT now(),
  reviewed_at TIMESTAMPTZ
);

-- 6. cashout_tickets (withdrawal requests)
CREATE TABLE cashout_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES members(id),
  amount NUMERIC(18,2) NOT NULL,
  currency TEXT DEFAULT 'YER',
  destination TEXT,
  state TEXT DEFAULT 'pending' CHECK (state IN ('pending','approved','rejected')),
  reviewer_id UUID REFERENCES members(id),
  reviewer_note TEXT,
  submitted_at TIMESTAMPTZ DEFAULT now(),
  reviewed_at TIMESTAMPTZ
);

-- 7. bank_partners (linked bank accounts)
CREATE TABLE bank_partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_name TEXT NOT NULL,
  account_holder TEXT,
  account_number TEXT,
  branch_name TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  sort_weight INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. rate_config (exchange rates)
CREATE TABLE rate_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_currency TEXT NOT NULL,
  target_currency TEXT NOT NULL,
  rate_value NUMERIC(18,6) NOT NULL,
  is_live BOOLEAN DEFAULT TRUE,
  effective_date TIMESTAMPTZ DEFAULT now()
);

-- 9. promo_codes (gift/reward codes)
CREATE TABLE promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code_text TEXT UNIQUE NOT NULL,
  reward_type TEXT,
  reward_value NUMERIC(18,2),
  currency TEXT DEFAULT 'YER',
  usage_limit INTEGER DEFAULT 1,
  times_used INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  expires_on TIMESTAMPTZ,
  created_by UUID REFERENCES members(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 10. campaign_codes (promotional campaigns)
CREATE TABLE campaign_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  promo_label TEXT NOT NULL,
  promo_code TEXT UNIQUE,
  discount_pct NUMERIC(5,2),
  discount_max NUMERIC(18,2),
  valid_from TIMESTAMPTZ DEFAULT now(),
  valid_until TIMESTAMPTZ,
  usage_cap INTEGER DEFAULT 100,
  times_applied INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE
);

-- 11. hero_banners (homepage banners)
CREATE TABLE hero_banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  banner_image TEXT,
  banner_link TEXT,
  display_order INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 12. service_categories (services sections)
CREATE TABLE service_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_name TEXT NOT NULL,
  category_icon TEXT,
  display_order INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT TRUE,
  parent_id UUID REFERENCES service_categories(id)
);

-- 13. service_providers (providers for services)
CREATE TABLE service_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_name TEXT NOT NULL,
  category_id UUID REFERENCES service_categories(id),
  provider_logo TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0
);

-- 14. support_conversations (support tickets/chats)
CREATE TABLE support_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES members(id),
  topic TEXT,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low','normal','high','urgent')),
  state TEXT DEFAULT 'open' CHECK (state IN ('open','in_progress','resolved','closed')),
  opened_at TIMESTAMPTZ DEFAULT now(),
  closed_at TIMESTAMPTZ
);

-- 15. support_messages (chat messages in support)
CREATE TABLE support_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES support_conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES members(id),
  sender_role TEXT,
  body_text TEXT NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT now()
);

-- 16. platform_config (key-value app settings)
CREATE TABLE platform_config (
  config_key TEXT PRIMARY KEY,
  config_value JSONB DEFAULT '{}',
  modified_at TIMESTAMPTZ DEFAULT now()
);

-- 17. activity_trail (audit log)
CREATE TABLE activity_trail (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES members(id),
  action_type TEXT NOT NULL,
  action_detail JSONB DEFAULT '{}',
  recorded_at TIMESTAMPTZ DEFAULT now()
);

-- 18. escrow_deals (escrow transactions)
CREATE TABLE escrow_deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID REFERENCES members(id),
  seller_id UUID REFERENCES members(id),
  item_description TEXT,
  deal_amount NUMERIC(18,2),
  currency TEXT DEFAULT 'YER',
  deal_state TEXT DEFAULT 'pending' CHECK (deal_state IN ('pending','funded','released','disputed','refunded')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 19. escrow_messages (escrow deal chat)
CREATE TABLE escrow_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID REFERENCES escrow_deals(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES members(id),
  body_text TEXT NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT now()
);

-- 20. admin_notices (admin push notifications)
CREATE TABLE admin_notices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notice_title TEXT NOT NULL,
  notice_body TEXT,
  target_role TEXT,
  is_sent BOOLEAN DEFAULT FALSE,
  sent_at TIMESTAMPTZ
);

-- 21. balance_movements (balance audit trail)
CREATE TABLE balance_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES members(id),
  movement_type TEXT,
  amount NUMERIC(18,2),
  currency TEXT,
  reason TEXT,
  reference_id UUID,
  performed_at TIMESTAMPTZ DEFAULT now()
);

-- STEP 3: Insert default platform configuration
INSERT INTO platform_config (config_key, config_value) VALUES
  ('maintenance', '{"active": false, "message": ""}'),
  ('kill_switch', '{"active": false}'),
  ('app_settings', '{"daily_transfer_limit": 500000, "min_transfer": 100}'),
  ('card_styles', '{"colors": [{"name": "default", "gradient": ["#1a1a1a", "#333333"]}, {"name": "gold", "gradient": ["#8B7355", "#C9A84C"]}, {"name": "dark", "gradient": ["#1A0A0E", "#3D0F10"]}]}');

-- STEP 4: Create indexes for performance
CREATE INDEX idx_members_mobile ON members(mobile);
CREATE INDEX idx_members_email ON members(email);
CREATE INDEX idx_members_auth_uid ON members(auth_uid);
CREATE INDEX idx_members_account_tag ON members(account_tag);
CREATE INDEX idx_transfers_sender ON transfers(sender_id);
CREATE INDEX idx_transfers_receiver ON transfers(receiver_id);
CREATE INDEX idx_transfers_state ON transfers(state);
CREATE INDEX idx_transfers_executed ON transfers(executed_at);
CREATE INDEX idx_alerts_target ON alerts(target_id);
CREATE INDEX idx_alerts_seen ON alerts(is_seen);
CREATE INDEX idx_service_orders_client ON service_orders(client_id);
CREATE INDEX idx_service_orders_state ON service_orders(state);
CREATE INDEX idx_deposit_tickets_member ON deposit_tickets(member_id);
CREATE INDEX idx_deposit_tickets_state ON deposit_tickets(state);
CREATE INDEX idx_cashout_tickets_member ON cashout_tickets(member_id);
CREATE INDEX idx_cashout_tickets_state ON cashout_tickets(state);
CREATE INDEX idx_promo_codes_code ON promo_codes(code_text);
CREATE INDEX idx_promo_codes_active ON promo_codes(is_active);
CREATE INDEX idx_campaign_codes_code ON campaign_codes(promo_code);
CREATE INDEX idx_service_providers_category ON service_providers(category_id);
CREATE INDEX idx_support_conversations_member ON support_conversations(member_id);
CREATE INDEX idx_support_messages_conversation ON support_messages(conversation_id);
CREATE INDEX idx_activity_trail_actor ON activity_trail(actor_id);
CREATE INDEX idx_activity_trail_recorded ON activity_trail(recorded_at);
CREATE INDEX idx_escrow_deals_buyer ON escrow_deals(buyer_id);
CREATE INDEX idx_escrow_deals_seller ON escrow_deals(seller_id);
CREATE INDEX idx_escrow_messages_deal ON escrow_messages(deal_id);
CREATE INDEX idx_balance_movements_member ON balance_movements(member_id);
CREATE INDEX idx_balance_movements_performed ON balance_movements(performed_at);

-- STEP 5: Enable Row Level Security
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE deposit_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE cashout_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE hero_banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_trail ENABLE ROW LEVEL SECURITY;
ALTER TABLE escrow_deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE escrow_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE balance_movements ENABLE ROW LEVEL SECURITY;

-- STEP 6: RLS Policies (basic - service_role bypasses these)

-- Members can read their own profile
CREATE POLICY "Members read own" ON members FOR SELECT USING (auth.uid() = auth_uid);
-- Members can update their own profile
CREATE POLICY "Members update own" ON members FOR UPDATE USING (auth.uid() = auth_uid);
-- Allow insert for authenticated users
CREATE POLICY "Members insert" ON members FOR INSERT WITH CHECK (auth.uid() = auth_uid);

-- Transfers: members can see their own transfers
CREATE POLICY "Transfers read own" ON transfers FOR SELECT USING (
  sender_id = (SELECT id FROM members WHERE auth_uid = auth.uid()) OR
  receiver_id = (SELECT id FROM members WHERE auth_uid = auth.uid())
);

-- Alerts: members can read their own alerts
CREATE POLICY "Alerts read own" ON alerts FOR SELECT USING (
  target_id = (SELECT id FROM members WHERE auth_uid = auth.uid())
);
CREATE POLICY "Alerts update own" ON alerts FOR UPDATE USING (
  target_id = (SELECT id FROM members WHERE auth_uid = auth.uid())
);

-- Service orders: members can see their own
CREATE POLICY "Orders read own" ON service_orders FOR SELECT USING (
  client_id = (SELECT id FROM members WHERE auth_uid = auth.uid())
);

-- Deposit tickets: members can see their own
CREATE POLICY "Deposits read own" ON deposit_tickets FOR SELECT USING (
  member_id = (SELECT id FROM members WHERE auth_uid = auth.uid())
);
CREATE POLICY "Deposits insert own" ON deposit_tickets FOR INSERT WITH CHECK (
  member_id = (SELECT id FROM members WHERE auth_uid = auth.uid())
);

-- Cashout tickets: members can see their own
CREATE POLICY "Cashouts read own" ON cashout_tickets FOR SELECT USING (
  member_id = (SELECT id FROM members WHERE auth_uid = auth.uid())
);
CREATE POLICY "Cashouts insert own" ON cashout_tickets FOR INSERT WITH CHECK (
  member_id = (SELECT id FROM members WHERE auth_uid = auth.uid())
);

-- Support: members can read their own conversations
CREATE POLICY "Support read own" ON support_conversations FOR SELECT USING (
  member_id = (SELECT id FROM members WHERE auth_uid = auth.uid())
);
CREATE POLICY "Support insert own" ON support_conversations FOR INSERT WITH CHECK (
  member_id = (SELECT id FROM members WHERE auth_uid = auth.uid())
);

-- Support messages: members can read messages in their conversations
CREATE POLICY "SupportMsg read own" ON support_messages FOR SELECT USING (
  conversation_id IN (SELECT id FROM support_conversations WHERE member_id = (SELECT id FROM members WHERE auth_uid = auth.uid()))
);
CREATE POLICY "SupportMsg insert own" ON support_messages FOR INSERT WITH CHECK (
  conversation_id IN (SELECT id FROM support_conversations WHERE member_id = (SELECT id FROM members WHERE auth_uid = auth.uid()))
);

-- Public read for banners, service categories, providers
CREATE POLICY "Banners public read" ON hero_banners FOR SELECT USING (is_visible = TRUE);
CREATE POLICY "Categories public read" ON service_categories FOR SELECT USING (is_visible = TRUE);
CREATE POLICY "Providers public read" ON service_providers FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Config public read" ON platform_config FOR SELECT USING (true);

-- Escrow: participants can read
CREATE POLICY "Escrow read own" ON escrow_deals FOR SELECT USING (
  buyer_id = (SELECT id FROM members WHERE auth_uid = auth.uid()) OR
  seller_id = (SELECT id FROM members WHERE auth_uid = auth.uid())
);
CREATE POLICY "EscrowMsg read own" ON escrow_messages FOR SELECT USING (
  deal_id IN (SELECT id FROM escrow_deals WHERE
    buyer_id = (SELECT id FROM members WHERE auth_uid = auth.uid()) OR
    seller_id = (SELECT id FROM members WHERE auth_uid = auth.uid())
  )
);

-- Balance movements: members can read their own
CREATE POLICY "BalanceMovements read own" ON balance_movements FOR SELECT USING (
  member_id = (SELECT id FROM members WHERE auth_uid = auth.uid())
);

-- Activity trail: members can read their own
CREATE POLICY "ActivityTrail read own" ON activity_trail FOR SELECT USING (
  actor_id = (SELECT id FROM members WHERE auth_uid = auth.uid())
);