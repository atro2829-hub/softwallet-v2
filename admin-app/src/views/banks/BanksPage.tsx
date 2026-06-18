'use client';

import { useState, useEffect } from 'react';
import { PageHeader, Loading, Table, Modal, Btn, Input, Badge, useToast } from '@/components/ui/shared';
import { fetchBanks, createBank, updateBank } from '@/lib/api';
import type { BankPartner } from '@/lib/types';
import { Plus, Pencil, Building2 } from 'lucide-react';

export function BanksPage() {
  const [banks, setBanks] = useState<BankPartner[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<BankPartner | null>(null);
  const [form, setForm] = useState({ name: '', name_ar: '', logo_url: '', account_number: '', account_holder: '', is_active: true });
  const { show, ToastComponent } = useToast();

  const load = async () => {
    try {
      const data = await fetchBanks();
      setBanks(data);
    } catch { show('فشل التحميل', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openNew = () => {
    setEditing(null);
    setForm({ name: '', name_ar: '', logo_url: '', account_number: '', account_holder: '', is_active: true });
    setModal(true);
  };

  const openEdit = (b: BankPartner) => {
    setEditing(b);
    setForm({ name: b.name, name_ar: b.name_ar, logo_url: b.logo_url || '', account_number: b.account_number, account_holder: b.account_holder, is_active: b.is_active });
    setModal(true);
  };

  const handleSubmit = async () => {
    if (!form.name || !form.account_number || !form.account_holder) return;
    try {
      const payload = { name: form.name, name_ar: form.name_ar, logo_url: form.logo_url || null, account_number: form.account_number, account_holder: form.account_holder, is_active: form.is_active };
      if (editing) {
        await updateBank(editing.id, payload);
      } else {
        await createBank(payload);
      }
      show('تم الحفظ');
      setModal(false);
      load();
    } catch { show('فشل الحفظ', 'error'); }
  };

  const toggleActive = async (b: BankPartner) => {
    try {
      await updateBank(b.id, { is_active: !b.is_active });
      load();
    } catch { show('فشل التحديث', 'error'); }
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      {ToastComponent}
      <PageHeader title="البنوك الشريكة" subtitle={`${banks.length} بنك`}>
        <Btn onClick={openNew}><Plus size={14} /> إضافة بنك</Btn>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {banks.map(b => (
          <div key={b.id} className="bg-white border border-charcoal-100 rounded-2xl p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                {b.logo_url ? (
                  <img src={b.logo_url} alt="" className="w-10 h-10 rounded-xl object-cover" />
                ) : (
                  <div className="w-10 h-10 bg-charcoal-100 rounded-xl flex items-center justify-center"><Building2 size={18} className="text-charcoal-400" /></div>
                )}
                <div>
                  <h3 className="font-bold text-charcoal-900">{b.name_ar || b.name}</h3>
                  <p className="text-xs text-charcoal-400">{b.name}</p>
                </div>
              </div>
              <Badge variant={b.is_active ? 'success' : 'neutral'}>{b.is_active ? 'نشط' : 'معطّل'}</Badge>
            </div>
            <div className="space-y-1.5 text-xs text-charcoal-500 mb-3">
              <p><span className="text-charcoal-400">رقم الحساب:</span> <span dir="ltr" className="font-mono">{b.account_number}</span></p>
              <p><span className="text-charcoal-400">صاحب الحساب:</span> {b.account_holder}</p>
            </div>
            <div className="flex gap-2">
              <Btn variant="ghost" size="sm" onClick={() => toggleActive(b)}>{b.is_active ? 'تعطيل' : 'تفعيل'}</Btn>
              <Btn variant="ghost" size="sm" onClick={() => openEdit(b)}><Pencil size={14} /> تعديل</Btn>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={modal} onClose={() => setModal(false)} title={editing ? 'تعديل البنك' : 'بنك جديد'} size="md">
        <div className="space-y-4">
          <Input label="الاسم (عربي)" value={form.name_ar} onChange={e => setForm({ ...form, name_ar: e.target.value })} />
          <Input label="الاسم (إنجليزي)" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} dir="ltr" />
          <Input label="رابط الشعار" value={form.logo_url} onChange={e => setForm({ ...form, logo_url: e.target.value })} placeholder="https://..." dir="ltr" />
          <Input label="رقم الحساب" value={form.account_number} onChange={e => setForm({ ...form, account_number: e.target.value })} dir="ltr" />
          <Input label="صاحب الحساب" value={form.account_holder} onChange={e => setForm({ ...form, account_holder: e.target.value })} />
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} className="w-4 h-4 rounded" />
            <span className="text-sm text-charcoal-700">نشط</span>
          </label>
          <Btn onClick={handleSubmit} className="w-full">حفظ</Btn>
        </div>
      </Modal>
    </div>
  );
}