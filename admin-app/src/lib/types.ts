export interface Member {
  id: string;
  auth_uid: string;
  display_name: string;
  email: string;
  phone: string;
  avatar_url: string | null;
  pocket_yer: string;
  account_tag: string;
  balance: number;
  verify_state: 'pending' | 'verified' | 'rejected';
  is_frozen: boolean;
  is_manager: boolean;
  created_at: string;
}

export interface Transfer {
  id: string;
  sender_id: string;
  receiver_id: string;
  amount: number;
  currency: string;
  state: 'pending' | 'done' | 'failed' | 'reversed';
  note: string | null;
  created_at: string;
  sender?: Member;
  receiver?: Member;
}

export interface DepositTicket {
  id: string;
  member_id: string;
  amount: number;
  currency: string;
  bank_name: string;
  proof_url: string | null;
  state: 'pending' | 'approved' | 'rejected';
  admin_note: string | null;
  created_at: string;
  member?: Member;
}

export interface CashoutTicket {
  id: string;
  member_id: string;
  amount: number;
  currency: string;
  bank_name: string;
  account_number: string;
  account_holder: string;
  state: 'pending' | 'approved' | 'rejected';
  admin_note: string | null;
  created_at: string;
  member?: Member;
}

export interface ServiceOrder {
  id: string;
  member_id: string;
  kind: string;
  details: string | null;
  state: 'pending' | 'approved' | 'rejected' | 'done' | 'cancelled';
  created_at: string;
  member?: Member;
}

export interface Alert {
  id: string;
  member_id: string;
  title: string;
  body: string;
  is_read: boolean;
  created_at: string;
}

export interface RateConfig {
  id: string;
  from_currency: string;
  to_currency: string;
  rate: number;
  updated_at: string;
}

export interface PromoCode {
  id: string;
  code: string;
  discount_type: 'percent' | 'fixed';
  discount_value: number;
  max_uses: number;
  used_count: number;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
}

export interface CampaignCode {
  id: string;
  code: string;
  reward_amount: number;
  currency: string;
  max_uses: number;
  used_count: number;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
}

export interface HeroBanner {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string;
  link_url: string | null;
  sort_order: number;
  is_visible: boolean;
  created_at: string;
}

export interface ServiceCategory {
  id: string;
  name: string;
  name_ar: string;
  icon_url: string | null;
  parent_id: string | null;
  sort_order: number;
  is_active: boolean;
}

export interface ServiceProvider {
  id: string;
  category_id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
}

export interface BankPartner {
  id: string;
  name: string;
  name_ar: string;
  logo_url: string | null;
  account_number: string;
  account_holder: string;
  is_active: boolean;
}

export interface SupportConversation {
  id: string;
  member_id: string;
  subject: string;
  state: 'open' | 'closed';
  created_at: string;
  updated_at: string;
  member?: Member;
}

export interface SupportMessage {
  id: string;
  conversation_id: string;
  sender_type: 'member' | 'admin';
  body: string;
  created_at: string;
}

export interface AdminNotice {
  id: string;
  title: string;
  body: string;
  sent_by: string;
  target: 'all' | 'verified';
  created_at: string;
}

export interface PlatformConfig {
  id: string;
  key: string;
  value: string;
  updated_at: string;
}

export interface ActivityTrail {
  id: string;
  member_id: string;
  action: string;
  details: string | null;
  created_at: string;
  member?: Member;
}

export interface BalanceMovement {
  id: string;
  member_id: string;
  amount: number;
  reason: string;
  reference_id: string | null;
  created_at: string;
}

export interface EscrowDeal {
  id: string;
  seller_id: string;
  buyer_id: string;
  amount: number;
  currency: string;
  state: 'pending' | 'funded' | 'released' | 'disputed' | 'cancelled';
  created_at: string;
}