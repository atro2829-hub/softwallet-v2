'use client';

import { useState, useEffect, useCallback } from 'react';
import { Badge, PageHeader, Loading, Modal, Table, useToast, Btn, Input } from '@/components/ui/shared';
import { fetchCashouts, updateCashout } from '@/lib/api';
import type { CashoutTicket } from '@/lib/types';
import { CheckCircle, XCircle } from 'lucide-react';

const stateLabels: Record<string, string> = { pending: 'معلّق', approved: 'مقبول', rejected: 'مرفوض' };
const stateVariants: Record<string, 'success' | 'warning' | 'danger'> = { pending: 'warning', approved: 'success', rejected: 'danger' };

export function WithdrawalsPage() {
  const [cashouts, setCashouts] = useState<CashoutTicket[]>([]);
  const [filterState, setFilterState] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<CashoutTicket | null>(null);
  const [note, setNote] = useState('');
  const { show, ToastComponent } = useToast();

  const load = useCallback(async () => {
    try {
      const data = await fetchCashouts({ state: filterState || undefined });
      setCashouts(data);
    } catch { show('فشل تحميل السحوبات', 'error'); }
    finally { setLoading(false); }
  }, [filterState, show]);

  useEffect(() => { load(); }, [load]);

  const handleAction = async (id: string, state: 'approved' | 'rejected') => {
    try {
      await updateCashout(id, state, note || undefined);
      show(state === 'approved' ? 'تم قبول السحب' : 'تم رفض السحب');
      setSelected(null);
      setNote('');
      load();
    } catch { show('فشل التحديث', 'error'); }
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      {ToastComponent}
      <PageHeader title="طلبات السحب" subtitle={`${cashouts.length} طلب`} />

      <div className="bg-white border border-charcoal-100 rounded-2xl p-4">
        <select value={filterState} onChange={e => setFilterState(e.target.value)} className="px-3 py-2.5 rounded-xl border border-charcoal-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-charcoal-900/10">
          <option value="">كل الحالات</option>
          <option value="pending">معلّق</option>
          <option value="approved">مقبول</option>
          <option value="rejected">مرفوض</option>
        </select>
      </div>

      <Table
        columns={[
          { key: 'created_at', header: 'التاريخ', width: 'w-36', render: (c: CashoutTicket) => <span className="text-xs text-charcoal-500">{new Date(c.created_at).toLocaleString('ar-IQ')}</span> },
          { key: 'member', header: 'العضو', width: 'w-32', render: (c: CashoutTicket) => <span className="font-medium">{c.member?.display_name || '—'}</span> },
          { key: 'amount', header: 'المبلغ', width: 'w-28', render: (c: CashoutTicket) => <span className="font-bold text-red-600">{c.amount?.toLocaleString()} {c.currency}</span> },
          { key: 'bank_name', header: 'البنك', width: 'w-24', render: (c: CashoutTicket) => <span>{c.bank_name}</span> },
          { key: 'account_holder', header: 'صاحب الحساب', width: 'w-28', render: (c: CashoutTicket) => <span className="text-xs">{c.account_holder}</span> },
          { key: 'state', header: 'الحالة', width: 'w-24', render: (c: CashoutTicket) => <Badge variant={stateVariants[c.state]}>{stateLabels[c.state]}</Badge> },
        ]}
        data={cashouts}
        onRowClick={setSelected}
      />

      <Modal isOpen={!!selected} onClose={() => { setSelected(null); setNote(''); }} title="تفاصيل السحب" size="md">
        {selected && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-charcoal-400 block mb-0.5">المعرف</span><span className="font-mono text-xs" dir="ltr">{selected.id}</span></div>
              <div><span className="text-charcoal-400 block mb-0.5">التاريخ</span><span>{new Date(selected.created_at).toLocaleString('ar-IQ')}</span></div>
              <div><span className="text-charcoal-400 block mb-0.5">العضو</span><span className="font-medium">{selected.member?.display_name}</span></div>
              <div><span className="text-charcoal-400 block mb-0.5">الهاتف</span><span dir="ltr" className="font-mono text-xs">{selected.member?.phone}</span></div>
              <div><span className="text-charcoal-400 block mb-0.5">المبلغ</span><span className="text-lg font-bold text-red-600">{selected.amount?.toLocaleString()} {selected.currency}</span></div>
              <div><span className="text-charcoal-400 block mb-0.5">البنك</span><span>{selected.bank_name}</span></div>
              <div><span className="text-charcoal-400 block mb-0.5">رقم الحساب</span><span dir="ltr" className="font-mono text-xs">{selected.account_number}</span></div>
              <div><span className="text-charcoal-400 block mb-0.5">صاحب الحساب</span><span>{selected.account_holder}</span></div>
            </div>

            {selected.state === 'pending' && (
              <div className="border-t border-charcoal-100 pt-3 space-y-3">
                <Input label="ملاحظة الإدارة" value={note} onChange={e => setNote(e.target.value)} placeholder="ملاحظة اختيارية..." />
                <div className="flex gap-2">
                  <Btn onClick={() => handleAction(selected.id, 'approved')}><CheckCircle size={14} /> قبول</Btn>
                  <Btn variant="danger" onClick={() => handleAction(selected.id, 'rejected')}><XCircle size={14} /> رفض</Btn>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}