'use client';

import { useState, useEffect, useCallback } from 'react';
import { Badge, PageHeader, Loading, Modal, Table, useToast, Btn, Input } from '@/components/ui/shared';
import { fetchDeposits, updateDeposit } from '@/lib/api';
import type { DepositTicket } from '@/lib/types';
import { CheckCircle, XCircle, ImageIcon } from 'lucide-react';

const stateLabels: Record<string, string> = { pending: 'معلّق', approved: 'مقبول', rejected: 'مرفوض' };
const stateVariants: Record<string, 'success' | 'warning' | 'danger'> = { pending: 'warning', approved: 'success', rejected: 'danger' };

export function DepositsPage() {
  const [deposits, setDeposits] = useState<DepositTicket[]>([]);
  const [filterState, setFilterState] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<DepositTicket | null>(null);
  const [note, setNote] = useState('');
  const { show, ToastComponent } = useToast();

  const load = useCallback(async () => {
    try {
      const data = await fetchDeposits({ state: filterState || undefined });
      setDeposits(data);
    } catch { show('فشل تحميل الإيداعات', 'error'); }
    finally { setLoading(false); }
  }, [filterState, show]);

  useEffect(() => { load(); }, [load]);

  const handleAction = async (id: string, state: 'approved' | 'rejected') => {
    try {
      await updateDeposit(id, state, note || undefined);
      show(state === 'approved' ? 'تم قبول الإيداع' : 'تم رفض الإيداع');
      setSelected(null);
      setNote('');
      load();
    } catch { show('فشل التحديث', 'error'); }
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      {ToastComponent}
      <PageHeader title="طلبات الإيداع" subtitle={`${deposits.length} طلب`} />

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
          { key: 'created_at', header: 'التاريخ', width: 'w-36', render: (d: DepositTicket) => <span className="text-xs text-charcoal-500">{new Date(d.created_at).toLocaleString('ar-IQ')}</span> },
          { key: 'member', header: 'العضو', width: 'w-32', render: (d: DepositTicket) => <span className="font-medium">{d.member?.display_name || '—'}</span> },
          { key: 'amount', header: 'المبلغ', width: 'w-28', render: (d: DepositTicket) => <span className="font-bold">{d.amount?.toLocaleString()} {d.currency}</span> },
          { key: 'bank_name', header: 'البنك', width: 'w-28', render: (d: DepositTicket) => <span>{d.bank_name || '—'}</span> },
          { key: 'state', header: 'الحالة', width: 'w-24', render: (d: DepositTicket) => <Badge variant={stateVariants[d.state]}>{stateLabels[d.state]}</Badge> },
          { key: 'proof_url', header: 'إثبات', width: 'w-20', render: (d: DepositTicket) => d.proof_url ? <ImageIcon size={16} className="text-charcoal-400" /> : <span className="text-xs text-charcoal-300">—</span> },
        ]}
        data={deposits}
        onRowClick={setSelected}
      />

      <Modal isOpen={!!selected} onClose={() => { setSelected(null); setNote(''); }} title="تفاصيل الإيداع" size="lg">
        {selected && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-charcoal-400 block mb-0.5">المعرف</span><span className="font-mono text-xs" dir="ltr">{selected.id}</span></div>
              <div><span className="text-charcoal-400 block mb-0.5">التاريخ</span><span>{new Date(selected.created_at).toLocaleString('ar-IQ')}</span></div>
              <div><span className="text-charcoal-400 block mb-0.5">العضو</span><span className="font-medium">{selected.member?.display_name}</span></div>
              <div><span className="text-charcoal-400 block mb-0.5">الهاتف</span><span dir="ltr" className="font-mono text-xs">{selected.member?.phone}</span></div>
              <div><span className="text-charcoal-400 block mb-0.5">المبلغ</span><span className="text-lg font-bold">{selected.amount?.toLocaleString()} {selected.currency}</span></div>
              <div><span className="text-charcoal-400 block mb-0.5">البنك</span><span>{selected.bank_name}</span></div>
            </div>

            {selected.proof_url && (
              <div className="border-t border-charcoal-100 pt-3">
                <span className="text-charcoal-400 block mb-2 text-sm">صورة الإثبات</span>
                <img src={selected.proof_url} alt="إثبات" className="max-h-60 rounded-xl border border-charcoal-100 object-contain mx-auto" />
              </div>
            )}

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