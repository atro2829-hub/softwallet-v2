'use client';

import { useState, useEffect } from 'react';
import { PageHeader, Loading, Table, Modal, Btn, Input, useToast } from '@/components/ui/shared';
import { fetchRates, upsertRate } from '@/lib/api';
import type { RateConfig } from '@/lib/types';
import { Plus, RefreshCw } from 'lucide-react';

export function RatesPage() {
  const [rates, setRates] = useState<RateConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ from_currency: '', to_currency: '', rate: '' });
  const [editing, setEditing] = useState<RateConfig | null>(null);
  const { show, ToastComponent } = useToast();

  const load = async () => {
    try {
      const data = await fetchRates();
      setRates(data);
    } catch { show('فشل تحميل الأسعار', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async () => {
    if (!form.from_currency || !form.to_currency || !form.rate) return;
    try {
      await upsertRate({ from_currency: form.from_currency, to_currency: form.to_currency, rate: Number(form.rate) });
      show('تم حفظ السعر');
      setModal(false);
      setForm({ from_currency: '', to_currency: '', rate: '' });
      setEditing(null);
      load();
    } catch { show('فشل الحفظ', 'error'); }
  };

  const openEdit = (r: RateConfig) => {
    setEditing(r);
    setForm({ from_currency: r.from_currency, to_currency: r.to_currency, rate: String(r.rate) });
    setModal(true);
  };

  const openNew = () => {
    setEditing(null);
    setForm({ from_currency: '', to_currency: '', rate: '' });
    setModal(true);
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      {ToastComponent}
      <PageHeader title="أسعار الصرف" subtitle={`${rates.length} سعر`}>
        <Btn onClick={openNew}><Plus size={14} /> إضافة سعر</Btn>
      </PageHeader>

      <Table
        columns={[
          { key: 'from_currency', header: 'من', width: 'w-32', render: (r: RateConfig) => <span className="font-medium">{r.from_currency}</span> },
          { key: 'to_currency', header: 'إلى', width: 'w-32', render: (r: RateConfig) => <span className="font-medium">{r.to_currency}</span> },
          { key: 'rate', header: 'السعر', width: 'w-32', render: (r: RateConfig) => <span className="font-bold text-lg">{r.rate}</span> },
          { key: 'updated_at', header: 'آخر تحديث', render: (r: RateConfig) => <span className="text-xs text-charcoal-400">{new Date(r.updated_at).toLocaleString('ar-IQ')}</span> },
          { key: 'actions', header: '', width: 'w-24', render: (r: RateConfig) => (
            <Btn variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); openEdit(r); }}><RefreshCw size={14} /></Btn>
          )},
        ]}
        data={rates}
        onRowClick={openEdit}
      />

      <Modal isOpen={modal} onClose={() => setModal(false)} title={editing ? 'تعديل السعر' : 'إضافة سعر'} size="sm">
        <div className="space-y-4">
          <Input label="العملة المصدر" value={form.from_currency} onChange={e => setForm({ ...form, from_currency: e.target.value.toUpperCase() })} placeholder="USD" dir="ltr" />
          <Input label="العملة الهدف" value={form.to_currency} onChange={e => setForm({ ...form, to_currency: e.target.value.toUpperCase() })} placeholder="IQD" dir="ltr" />
          <Input label="السعر" type="number" value={form.rate} onChange={e => setForm({ ...form, rate: e.target.value })} placeholder="0" dir="ltr" />
          <Btn onClick={handleSubmit} className="w-full">حفظ</Btn>
        </div>
      </Modal>
    </div>
  );
}