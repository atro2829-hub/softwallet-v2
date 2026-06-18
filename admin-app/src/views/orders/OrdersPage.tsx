'use client';

import { useState, useEffect, useCallback } from 'react';
import { Badge, PageHeader, Loading, Modal, Table, useToast, Btn, SearchBar } from '@/components/ui/shared';
import { fetchOrders, updateOrder } from '@/lib/api';
import type { ServiceOrder } from '@/lib/types';
import { CheckCircle, XCircle, Eye } from 'lucide-react';

const stateLabels: Record<string, string> = { pending: 'معلّق', approved: 'مقبول', rejected: 'مرفوض', done: 'مكتمل', cancelled: 'ملغي' };
const stateVariants: Record<string, 'success' | 'warning' | 'danger' | 'neutral' | 'info'> = { pending: 'warning', approved: 'info', rejected: 'danger', done: 'success', cancelled: 'neutral' };

export function OrdersPage() {
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [filterState, setFilterState] = useState('');
  const [filterKind, setFilterKind] = useState('');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ServiceOrder | null>(null);
  const { show, ToastComponent } = useToast();

  const load = useCallback(async () => {
    try {
      const data = await fetchOrders({ state: filterState || undefined, kind: filterKind || undefined });
      setOrders(data);
    } catch { show('فشل تحميل الطلبات', 'error'); }
    finally { setLoading(false); }
  }, [filterState, filterKind, show]);

  useEffect(() => { load(); }, [load]);

  const handleAction = async (id: string, state: 'approved' | 'rejected' | 'done' | 'cancelled') => {
    try {
      await updateOrder(id, state);
      show('تم تحديث الطلب');
      setSelected(null);
      load();
    } catch { show('فشل التحديث', 'error'); }
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      {ToastComponent}
      <PageHeader title="طلبات الخدمات" subtitle={`${orders.length} طلب`} />

      <div className="bg-white border border-charcoal-100 rounded-2xl p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <select value={filterState} onChange={e => setFilterState(e.target.value)} className="px-3 py-2.5 rounded-xl border border-charcoal-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-charcoal-900/10">
            <option value="">كل الحالات</option>
            {Object.entries(stateLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <input value={filterKind} onChange={e => setFilterKind(e.target.value)} placeholder="نوع الخدمة..." className="px-3 py-2.5 rounded-xl border border-charcoal-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-charcoal-900/10" dir="rtl" />
        </div>
      </div>

      <Table
        columns={[
          { key: 'created_at', header: 'التاريخ', width: 'w-36', render: (o: ServiceOrder) => <span className="text-xs text-charcoal-500">{new Date(o.created_at).toLocaleString('ar-IQ')}</span> },
          { key: 'member', header: 'العضو', width: 'w-32', render: (o: ServiceOrder) => <span className="font-medium">{o.member?.display_name || '—'}</span> },
          { key: 'kind', header: 'النوع', width: 'w-28', render: (o: ServiceOrder) => <span>{o.kind}</span> },
          { key: 'details', header: 'التفاصيل', render: (o: ServiceOrder) => <span className="text-xs text-charcoal-500 truncate max-w-48 block">{o.details || '—'}</span> },
          { key: 'state', header: 'الحالة', width: 'w-24', render: (o: ServiceOrder) => <Badge variant={stateVariants[o.state]}>{stateLabels[o.state] || o.state}</Badge> },
        ]}
        data={orders}
        onRowClick={setSelected}
      />

      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title="تفاصيل الطلب" size="md">
        {selected && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-charcoal-400 block mb-0.5">المعرف</span><span className="font-mono text-xs" dir="ltr">{selected.id}</span></div>
              <div><span className="text-charcoal-400 block mb-0.5">التاريخ</span><span>{new Date(selected.created_at).toLocaleString('ar-IQ')}</span></div>
              <div><span className="text-charcoal-400 block mb-0.5">العضو</span><span className="font-medium">{selected.member?.display_name}</span></div>
              <div><span className="text-charcoal-400 block mb-0.5">النوع</span><span>{selected.kind}</span></div>
              <div className="col-span-2"><span className="text-charcoal-400 block mb-0.5">التفاصيل</span><p className="bg-charcoal-50 p-3 rounded-xl text-sm">{selected.details || 'لا توجد تفاصيل'}</p></div>
              <div><span className="text-charcoal-400 block mb-0.5">الحالة</span><Badge variant={stateVariants[selected.state]}>{stateLabels[selected.state]}</Badge></div>
            </div>
            {selected.state === 'pending' && (
              <div className="flex gap-2 pt-3 border-t border-charcoal-100">
                <Btn size="sm" onClick={() => handleAction(selected.id, 'approved')}><CheckCircle size={14} /> قبول</Btn>
                <Btn size="sm" variant="danger" onClick={() => handleAction(selected.id, 'rejected')}><XCircle size={14} /> رفض</Btn>
              </div>
            )}
            {selected.state === 'approved' && (
              <div className="flex gap-2 pt-3 border-t border-charcoal-100">
                <Btn size="sm" onClick={() => handleAction(selected.id, 'done')}><CheckCircle size={14} /> إتمام</Btn>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}