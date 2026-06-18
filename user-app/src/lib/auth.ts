import { supabase } from "./supabase";

export interface Member {
  id: string;
  auth_uid: string;
  mobile: string | null;
  email: string | null;
  display_name: string | null;
  given_name: string | null;
  middle_name: string | null;
  family_name: string | null;
  national_code: string | null;
  profile_photo: string | null;
  access_role: string;
  account_tag: string | null;
  account_tier: string;
  verify_state: string;
  is_frozen: boolean;
  pocket_yer: number;
  pocket_sar: number;
  pocket_usd: number;
  region: string | null;
  push_key: string | null;
  security_pin: string | null;
  locale: string;
  appearance: string;
  registered_at: string;
  modified_at: string;
}

export interface Transfer {
  id: string;
  sender_id: string;
  receiver_id: string;
  amount: number;
  currency: string;
  transfer_type: string;
  state: string;
  summary: string | null;
  reference_code: string | null;
  executed_at: string;
}

export interface Alert {
  id: string;
  target_id: string;
  heading: string;
  content: string;
  alert_kind: string;
  is_seen: boolean;
  destination: string | null;
  dispatched_at: string;
}

export async function signUp(email: string, password: string, displayName: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) throw error;

  if (data.user) {
    await supabase.from("members").insert({
      auth_uid: data.user.id,
      email,
      display_name: displayName,
      locale: "ar",
      appearance: "light",
      access_role: "member",
      account_tier: "basic",
      verify_state: "pending",
      pocket_yer: 0,
      pocket_sar: 0,
      pocket_usd: 0,
    });
  }

  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser(): Promise<Member | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: member } = await supabase
    .from("members")
    .select("*")
    .eq("auth_uid", user.id)
    .single();

  return member as Member | null;
}

export async function onAuthStateChange(
  callback: (user: Member | null) => void
) {
  supabase.auth.onAuthStateChange(async (event) => {
    if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
      const member = await getCurrentUser();
      callback(member);
    } else if (event === "SIGNED_OUT") {
      callback(null);
    }
  });
}

export async function getTransfers(memberId: string, limit = 20) {
  const { data, error } = await supabase
    .from("transfers")
    .select("*")
    .or(`sender_id.eq.${memberId},receiver_id.eq.${memberId}`)
    .order("executed_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data as Transfer[];
}

export async function getAlerts(memberId: string, limit = 50) {
  const { data, error } = await supabase
    .from("alerts")
    .select("*")
    .eq("target_id", memberId)
    .order("dispatched_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data as Alert[];
}

export async function markAlertSeen(alertId: string) {
  const { error } = await supabase
    .from("alerts")
    .update({ is_seen: true })
    .eq("id", alertId);

  if (error) throw error;
}

export async function createTransfer(
  senderId: string,
  receiverTag: string,
  amount: number,
  currency: string,
  summary: string
) {
  // Get receiver by account_tag
  const { data: receiver, error: receiverError } = await supabase
    .from("members")
    .select("id")
    .eq("account_tag", receiverTag)
    .single();

  if (receiverError || !receiver) throw new Error("المستلم غير موجود");

  const refCode = `TRF-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  const { data, error } = await supabase
    .from("transfers")
    .insert({
      sender_id: senderId,
      receiver_id: receiver.id,
      amount,
      currency,
      transfer_type: "peer",
      state: "completed",
      summary,
      reference_code: refCode,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateProfile(memberId: string, updates: Partial<Member>) {
  const { data, error } = await supabase
    .from("members")
    .update(updates)
    .eq("id", memberId)
    .select()
    .single();

  if (error) throw error;
  return data;
}
