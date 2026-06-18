'use client';

import { useState, useEffect } from 'react';
import { PageHeader, Loading, Table, Modal, Btn, Input, Badge, useToast } from '@/components/ui/shared';
import { fetchPromoCodes, createPromoCode, updatePromoCode, fetchCampaignCodes, createCampaignCode, updateCampaignCode } from '@/lib/api';
import type { PromoCode, CampaignCode } from '@/lib/types';
import { Plus, ToggleLeft, ToggleRight } from 'lucide-react';

export function PromosPage() {
  const [tab, setTab] = useState<'promo' | 'campaign'>('promo');
  const [promos, setPromos] = useState<PromoCode[]>([]);
  const [campaigns, setCampaigns] = useState<CampaignCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<PromoCode | CampaignCode | null>(null);
  const [form, setForm] = useState({ code: '', discount_type: 'percent', discount_value: '', max_uses: '', expires_at: '', reward_amount: '', currency: 'IQD' });
  const { show, ToastComponent } = useToast();

  const load = async () => {
    try {
      const [p, c] = await Promise.all([fetchPromoCodes(), fetchCampaignCodes()]);
      setPromos(p);
      setCampaigns(c);
    } catch { show('فشل التحميل', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openNew = () => {
    setEditing(null);
    setForm({ code: '', discount_type: 'percent', discount_value: '', max_uses: '', expires_at: '', reward_amount: '', currency: 'IQD' });
    setModal(true);
  };

  const handleSubmit = async () => {
    if (tab === 'promo') {
      if (!form.code || !form.discount_value) return;
      try {
        const payload = { code: form.code, discount_type: form.discount_type as 'percent' | 'fixed', discount_value: Number(form.discount_value), max_uses: form.max_uses ? Number(form.max_uses) : null, expires_at: form.expires_at || null, is_active: true };
        if (editing) {
          await updatePromoCode((editing as PromoCode).id, payload as Partial<PromoCode>);
        } else {
          await createPromoCode(payload as Omit<PromoCode, 'id' | 'used_count' | 'created_at'>);
        }
        show('تم الحفظ');
      } catch { show('فشل الحفظ', 'error'); }
    } else {
      if (!form.code || !form.reward_amount) return;
      try {
        const payload = { code: form.code, reward_amount: Number(form.reward_amount), currency: form.currency, max_uses: form.max_uses ? Number(form.max_uses) : null, expires_at: form.expires_at || null, is_active: true };
        if (editing) {
          await updateCampaignCode((editing as CampaignCode).id, payload as Partial<CampaignCode>);
        } else {
          await createCampaignCode(payload as Omit<CampaignCode, 'id' | 'used_count' | 'created_at'>);
        }
        show('تم الحفظ');
      } catch { show('فشل الحفظ', 'error'); }
    }
    setModal(false);
    load();
  };

  const togglePromo = async (item: PromoCode) => {
    try {
      await updatePromoCode(item.id, { is_active: !item.is_active });
      show('تم تحديث الحالة');
      load();
    } catch { show('فشل التحديث', 'error'); }
  };

  const toggleCampaign = async (item: CampaignCode) => {
    try {
      await updateCampaignCode(item.id, { is_active: !item.is_active });
      show('تم تحديث الحالة');
      load();
    } catch { show('فشل التحديث', 'error'); }
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      {ToastComponent}
      <PageHeader title="أكواد الخصم والهدية" subtitle={`${promos.length} خصم، ${campaigns.length} هدية`}>
        <Btn onClick={openNew}><Plus size={14} /> {tab === 'promo' ? 'كود خصم جديد' : 'كود هدية جديد'}</Btn>
      </PageHeader>

      {/* Tabs */}
      <div className="flex gap-1 bg-charcoal-100 p-1 rounded-xl w-fit">
        <button onClick={() => setTab('promo')} className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${tab === 'promo' ? 'bg-white text-charcoal-900 shadow-sm' : 'text-charcoal-500'}`}>
          أكواد الخصم
        </button>
        <button onClick={() => setTab('campaign')} className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${tab === 'campaign' ? 'bg-white text-charcoal-900 shadow-sm' : 'text-charcoal-500'}`}>
          أكواد الهدية
        </button>
      </div>

      {tab === 'promo' ? (
        <Table
          columns={[
            { key: 'code', header: 'الكود', width: 'w-28', render: (p: PromoCode) => <span className="font-mono font-bold" dir="ltr">{p.code}</span> },
            { key: 'discount_type', header: 'النوع', width: 'w-24', render: (p: PromoCode) => <span>{p.discount_type === 'percent' ? 'نسبة' : 'مبلغ ثابت'}</span> },
            { key: 'discount_value', header: 'القيمة', width: 'w-20', render: (p: PromoCode) => <span className="font-bold">{p.discount_value}{p.discount_type === 'percent' ? '%' : ''}</span> },
            { key: 'used_count', header: 'الاستخدام', width: 'w-24', render: (p: PromoCode) => <span>{p.used_count} / {p.max_uses || '∞'}</span> },
            { key: 'expires_at', header: 'الانتهاء', width: 'w-28', render: (p: PromoCode) => <span className="text-xs">{p.expires_at ? new Date(p.expires_at).toLocaleDateString('ar-IQ') : 'بدون انتهاء'}</span> },
            { key: 'is_active', header: 'الحالة', width: 'w-24', render: (p: PromoCode) => <Badge variant={p.is_active ? 'success' : 'neutral'}>{p.is_active ? 'نشط' : 'معطّل'}</Badge> },
            { key: 'toggle', header: '', width: 'w-16', render: (p: PromoCode) => (
              <button onClick={(e) => { e.stopPropagation(); togglePromo(p); }}>
                {p.is_active ? <ToggleRight size={22} className="text-green-600" /> : <ToggleLeft size={22} className="text-charcoal-300" />}
              </button>
            )},
          ]}
          data={promos}
        />
      ) : (
        <Table
          columns={[
            { key: 'code', header: 'الكود', width: 'w-28', render: (c: CampaignCode) => <span className="font-mono font-bold" dir="ltr">{c.code}</span> },
            { key: 'reward_amount', header: 'المكافأة', width: 'w-28', render: (c: CampaignCode) => <span className="font-bold">{c.reward_amount?.toLocaleString()} {c.currency}</span> },
            { key: 'used_count', header: 'الاستخدام', width: 'w-24', render: (c: CampaignCode) => <span>{c.used_count} / {c.max_uses || '∞'}</span> },
            { key: 'expires_at', header: 'الانتهاء', width: 'w-28', render: (c: CampaignCode) => <span className="text-xs">{c.expires_at ? new Date(c.expires_at).toLocaleDateString('ar-IQ') : 'بدون انتهاء'}</span> },
            { key: 'is_active', header: 'الحالة', width: 'w-24', render: (c: CampaignCode) => <Badge variant={c.is_active ? 'success' : 'neutral'}>{c.is_active ? 'نشط' : 'معطّل'}</Badge> },
            { key: 'toggle', header: '', width: 'w-16', render: (c: CampaignCode) => (
              <button onClick={(e) => { e.stopPropagation(); toggleCampaign(c); }}>
                {c.is_active ? <ToggleRight size={22} className="text-green-600" /> : <ToggleLeft size={22} className="text-charcoal-300" />}
              </button>
            )},
          ]}
          data={campaigns}
        />
      )}

      <Modal isOpen={modal} onClose={() => setModal(false)} title={tab === 'promo' ? (editing ? 'تعديل كود الخصم' : 'كود خصم جديد') : (editing ? 'تعديل كود الهدية' : 'كود هدية جديد')} size="md">
        <div className="space-y-4">
          <Input label="الكود" value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="PROMO2024" dir="ltr" />
          {tab === 'promo' ? (
            <>
              <Input label="نوع الخصم" value={form.discount_type} onChange={e => setForm({ ...form, discount_type: e.target.value })} options={[{ label: 'نسبة مئوية', value: 'percent' }, { label: 'مبلغ ثابت', value: 'fixed' }]} />
              <Input label="القيمة" type="number" value={form.discount_value} onChange={e => setForm({ ...form, discount_value: e.target.value })} dir="ltr" />
            </>
          ) : (
            <>
              <Input label="مبلغ المكافأة" type="number" value={form.reward_amount} onChange={e => setForm({ ...form, reward_amount: e.target.value })} dir="ltr" />
              <Input label="العملة" value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value.toUpperCase() })} dir="ltr" />
            </>
          )}
          <Input label="الحد الأقصى للاستخدام (فارغ = بلا حد)" type="number" value={form.max_uses} onChange={e => setForm({ ...form, max_uses: e.target.value })} dir="ltr" />
          <Input label="تاريخ الانتهاء (فارغ = بلا انتهاء)" type="date" value={form.expires_at} onChange={e => setForm({ ...form, expires_at: e.target.value })} dir="ltr" />
          <Btn onClick={handleSubmit} className="w-full">حفظ</Btn>
        </div>
      </Modal>
    </div>
  );
}