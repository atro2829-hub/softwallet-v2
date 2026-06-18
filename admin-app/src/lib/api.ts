import { supabase } from './supabase';
import type {
  Member, Transfer, DepositTicket, CashoutTicket, ServiceOrder,
  RateConfig, PromoCode, CampaignCode, HeroBanner, ServiceCategory,
  ServiceProvider, BankPartner, SupportConversation, SupportMessage,
  AdminNotice, PlatformConfig, ActivityTrail, BalanceMovement
} from './types';

// ─── Members ──────────────────────────────────────────
export async function fetchMembers(filters?: { verify_state?: string; is_frozen?: boolean; search?: string }) {
  let q = supabase.from('members').select('*').order('created_at', { ascending: false });
  if (filters?.verify_state) q = q.eq('verify_state', filters.verify_state);
  if (filters?.is_frozen !== undefined) q = q.eq('is_frozen', filters.is_frozen);
  if (filters?.search) q = q.or(`display_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,phone.ilike.%${filters.search}%,pocket_yer.ilike.%${filters.search}%`);
  const { data, error } = await q;
  if (error) throw error;
  return data as Member[];
}

export async function updateMember(id: string, updates: Partial<Member>) {
  const { data, error } = await supabase.from('members').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data as Member;
}

export async function adjustBalance(memberId: string, amount: number, reason: string) {
  const { data, error } = await supabase
    .from('balance_movements')
    .insert({ member_id: memberId, amount, reason })
    .select()
    .single();
  if (error) throw error;
  return data as BalanceMovement;
}

// ─── Transfers ────────────────────────────────────────
export async function fetchTransfers(filters?: { state?: string; type?: string; from?: string; to?: string }) {
  let q = supabase.from('transfers').select('*, sender:members!transfers_sender_id_fkey(id, display_name, pocket_yer), receiver:members!transfers_receiver_id_fkey(id, display_name, pocket_yer)').order('created_at', { ascending: false });
  if (filters?.state) q = q.eq('state', filters.state);
  if (filters?.from) q = q.gte('created_at', filters.from);
  if (filters?.to) q = q.lte('created_at', filters.to);
  const { data, error } = await q;
  if (error) throw error;
  return data as Transfer[];
}

// ─── Deposits ─────────────────────────────────────────
export async function fetchDeposits(filters?: { state?: string }) {
  let q = supabase.from('deposit_tickets').select('*, member:members!deposit_tickets_member_id_fkey(id, display_name, phone)').order('created_at', { ascending: false });
  if (filters?.state) q = q.eq('state', filters.state);
  const { data, error } = await q;
  if (error) throw error;
  return data as DepositTicket[];
}

export async function updateDeposit(id: string, state: 'approved' | 'rejected', adminNote?: string) {
  const { data, error } = await supabase.from('deposit_tickets').update({ state, admin_note: adminNote || null }).eq('id', id).select().single();
  if (error) throw error;
  return data as DepositTicket;
}

// ─── Cashouts ─────────────────────────────────────────
export async function fetchCashouts(filters?: { state?: string }) {
  let q = supabase.from('cashout_tickets').select('*, member:members!cashout_tickets_member_id_fkey(id, display_name, phone)').order('created_at', { ascending: false });
  if (filters?.state) q = q.eq('state', filters.state);
  const { data, error } = await q;
  if (error) throw error;
  return data as CashoutTicket[];
}

export async function updateCashout(id: string, state: 'approved' | 'rejected', adminNote?: string) {
  const { data, error } = await supabase.from('cashout_tickets').update({ state, admin_note: adminNote || null }).eq('id', id).select().single();
  if (error) throw error;
  return data as CashoutTicket;
}

// ─── Orders ───────────────────────────────────────────
export async function fetchOrders(filters?: { state?: string; kind?: string }) {
  let q = supabase.from('service_orders').select('*, member:members!service_orders_member_id_fkey(id, display_name, phone)').order('created_at', { ascending: false });
  if (filters?.state) q = q.eq('state', filters.state);
  if (filters?.kind) q = q.eq('kind', filters.kind);
  const { data, error } = await q;
  if (error) throw error;
  return data as ServiceOrder[];
}

export async function updateOrder(id: string, state: 'approved' | 'rejected' | 'done' | 'cancelled') {
  const { data, error } = await supabase.from('service_orders').update({ state }).eq('id', id).select().single();
  if (error) throw error;
  return data as ServiceOrder;
}

// ─── Rates ────────────────────────────────────────────
export async function fetchRates() {
  const { data, error } = await supabase.from('rate_config').select('*').order('from_currency');
  if (error) throw error;
  return data as RateConfig[];
}

export async function upsertRate(item: { from_currency: string; to_currency: string; rate: number }) {
  const { data, error } = await supabase.from('rate_config').upsert(item, { onConflict: 'from_currency,to_currency' }).select().single();
  if (error) throw error;
  return data as RateConfig;
}

// ─── Promo Codes ──────────────────────────────────────
export async function fetchPromoCodes() {
  const { data, error } = await supabase.from('promo_codes').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data as PromoCode[];
}

export async function createPromoCode(item: Omit<PromoCode, 'id' | 'used_count' | 'created_at'>) {
  const { data, error } = await supabase.from('promo_codes').insert(item).select().single();
  if (error) throw error;
  return data as PromoCode;
}

export async function updatePromoCode(id: string, updates: Partial<PromoCode>) {
  const { data, error } = await supabase.from('promo_codes').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data as PromoCode;
}

// ─── Campaign Codes ───────────────────────────────────
export async function fetchCampaignCodes() {
  const { data, error } = await supabase.from('campaign_codes').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data as CampaignCode[];
}

export async function createCampaignCode(item: Omit<CampaignCode, 'id' | 'used_count' | 'created_at'>) {
  const { data, error } = await supabase.from('campaign_codes').insert(item).select().single();
  if (error) throw error;
  return data as CampaignCode;
}

export async function updateCampaignCode(id: string, updates: Partial<CampaignCode>) {
  const { data, error } = await supabase.from('campaign_codes').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data as CampaignCode;
}

// ─── Banners ──────────────────────────────────────────
export async function fetchBanners() {
  const { data, error } = await supabase.from('hero_banners').select('*').order('sort_order');
  if (error) throw error;
  return data as HeroBanner[];
}

export async function createBanner(item: Omit<HeroBanner, 'id' | 'created_at'>) {
  const { data, error } = await supabase.from('hero_banners').insert(item).select().single();
  if (error) throw error;
  return data as HeroBanner;
}

export async function updateBanner(id: string, updates: Partial<HeroBanner>) {
  const { data, error } = await supabase.from('hero_banners').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data as HeroBanner;
}

// ─── Service Categories ───────────────────────────────
export async function fetchCategories() {
  const { data, error } = await supabase.from('service_categories').select('*').order('sort_order');
  if (error) throw error;
  return data as ServiceCategory[];
}

export async function createCategory(item: Omit<ServiceCategory, 'id'>) {
  const { data, error } = await supabase.from('service_categories').insert(item).select().single();
  if (error) throw error;
  return data as ServiceCategory;
}

export async function updateCategory(id: string, updates: Partial<ServiceCategory>) {
  const { data, error } = await supabase.from('service_categories').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data as ServiceCategory;
}

export async function deleteCategory(id: string) {
  const { error } = await supabase.from('service_categories').delete().eq('id', id);
  if (error) throw error;
}

// ─── Service Providers ────────────────────────────────
export async function fetchProviders() {
  const { data, error } = await supabase.from('service_providers').select('*, category:service_categories(id, name, name_ar)').order('created_at', { ascending: false });
  if (error) throw error;
  return data as (ServiceProvider & { category: ServiceCategory | null })[];
}

export async function createProvider(item: Omit<ServiceProvider, 'id' | 'created_at'>) {
  const { data, error } = await supabase.from('service_providers').insert(item).select().single();
  if (error) throw error;
  return data as ServiceProvider;
}

export async function updateProvider(id: string, updates: Partial<ServiceProvider>) {
  const { data, error } = await supabase.from('service_providers').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data as ServiceProvider;
}

// ─── Bank Partners ────────────────────────────────────
export async function fetchBanks() {
  const { data, error } = await supabase.from('bank_partners').select('*').order('name');
  if (error) throw error;
  return data as BankPartner[];
}

export async function createBank(item: Omit<BankPartner, 'id'>) {
  const { data, error } = await supabase.from('bank_partners').insert(item).select().single();
  if (error) throw error;
  return data as BankPartner;
}

export async function updateBank(id: string, updates: Partial<BankPartner>) {
  const { data, error } = await supabase.from('bank_partners').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data as BankPartner;
}

// ─── Support ──────────────────────────────────────────
export async function fetchConversations(filters?: { state?: string }) {
  let q = supabase.from('support_conversations').select('*, member:members!support_conversations_member_id_fkey(id, display_name, phone)').order('updated_at', { ascending: false });
  if (filters?.state) q = q.eq('state', filters.state);
  const { data, error } = await q;
  if (error) throw error;
  return data as (SupportConversation & { member: Member | null })[];
}

export async function fetchMessages(conversationId: string) {
  const { data, error } = await supabase.from('support_messages').select('*').eq('conversation_id', conversationId).order('created_at', { ascending: true });
  if (error) throw error;
  return data as SupportMessage[];
}

export async function sendMessage(conversationId: string, body: string) {
  const { data, error } = await supabase.from('support_messages').insert({ conversation_id: conversationId, sender_type: 'admin', body }).select().single();
  if (error) throw error;
  return data as SupportMessage;
}

export async function closeConversation(id: string) {
  const { data, error } = await supabase.from('support_conversations').update({ state: 'closed' }).eq('id', id).select().single();
  if (error) throw error;
  return data as SupportConversation;
}

// ─── Notifications ────────────────────────────────────
export async function fetchNotices() {
  const { data, error } = await supabase.from('admin_notices').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data as AdminNotice[];
}

export async function sendNotice(item: { title: string; body: string; target: 'all' | 'verified' }) {
  const { data, error } = await supabase.from('admin_notices').insert(item).select().single();
  if (error) throw error;
  return data as AdminNotice;
}

// ─── Settings ─────────────────────────────────────────
export async function fetchConfig() {
  const { data, error } = await supabase.from('platform_config').select('*');
  if (error) throw error;
  return data as PlatformConfig[];
}

export async function updateConfig(key: string, value: string) {
  const { data, error } = await supabase.from('platform_config').update({ value }).eq('key', key).select().single();
  if (error) throw error;
  return data as PlatformConfig;
}

export async function upsertConfig(key: string, value: string) {
  const { data, error } = await supabase.from('platform_config').upsert({ key, value }, { onConflict: 'key' }).select().single();
  if (error) throw error;
  return data as PlatformConfig;
}

// ─── Activity ─────────────────────────────────────────
export async function fetchActivity(filters?: { action?: string; member_id?: string }) {
  let q = supabase.from('activity_trail').select('*, member:members!activity_trail_member_id_fkey(id, display_name, pocket_yer)').order('created_at', { ascending: false }).limit(500);
  if (filters?.action) q = q.eq('action', filters.action);
  if (filters?.member_id) q = q.eq('member_id', filters.member_id);
  const { data, error } = await q;
  if (error) throw error;
  return data as (ActivityTrail & { member: Member | null })[];
}

// ─── Dashboard Stats ──────────────────────────────────
export async function fetchDashboardStats() {
  const [membersRes, transfersRes, depositsRes, ordersRes] = await Promise.all([
    supabase.from('members').select('id', { count: 'exact', head: true }),
    supabase.from('transfers').select('id, amount, created_at').eq('state', 'done').gte('created_at', new Date().toISOString().split('T')[0]),
    supabase.from('deposit_tickets').select('id, amount').eq('state', 'pending'),
    supabase.from('service_orders').select('id').in('state', ['pending', 'approved']),
  ]);

  const transfers = transfersRes.data || [];
  const todayTotal = transfers.reduce((sum, t) => sum + (t.amount || 0), 0);

  return {
    totalMembers: membersRes.count || 0,
    todayTransfers: transfers.length,
    todayTransferAmount: todayTotal,
    pendingDeposits: depositsRes.count || 0,
    activeOrders: ordersRes.count || 0,
  };
}