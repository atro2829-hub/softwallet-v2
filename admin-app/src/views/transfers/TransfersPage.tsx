'use client';

import { useState, useEffect, useCallback } from 'react';
import { Badge, SearchBar, PageHeader, Loading, Modal, Table, useToast, Btn } from '@/components/ui/shared';
import { fetchTransfers } from '@/lib/api';
import type { Transfer } from '@/lib/types';

const stateLabels: Record<string, string> = { pending: 'معلّق', done: 'مكتمل', failed: 'فاشل', reversed: 'مرتجع' };
const stateVariants: Record<string, 'success' | 'warning' | 'danger' | 'neutral'> = { pending: 'warning', done: 'success', failed: 'danger', reversed: 'neutral' };

export function TransfersPage() {
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [search, setSearch] = useState('');
  const [filterState, setFilterState] = useState('');
  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo, setFilterTo] = useState('');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Transfer | null>(null);
  const { show, ToastComponent } = useToast();

  const load = useCallback(async () => {
    try {
      const data = await fetchTransfers({
        state: filterState || undefined,
        from: filterFrom || undefined,
        to: filterTo || undefined,
      });
      if (search) {
        const q = search.toLowerCase();
        const filtered = data.filter(t =>
          t.sender?.display_name?.toLowerCase().includes(q) ||
          t.receiver?.display_name?.toLowerCase().includes(q) ||
          t.sender?.pocket_yer?.toLowerCase().includes(q) ||
          t.receiver?.pocket_yer?.toLowerCase().includes(q)
        );
        setTransfers(filtered);
      } else {
        setTransfers(data);
      }
    } catch { show('فشل تحميل التحويلات', 'error'); }
    finally { setLoading(false); }
  }, [search, filterState, filterFrom, filterTo, show]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      {ToastComponent}
      <PageHeader title="التحويلات" subtitle={`${transfers.length} تحويل`} />

      <div className="bg-white border border-charcoal-100 rounded-2xl p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="lg:col-span-1">
            <SearchBar value={search} onChange={setSearch} />
          </div>
          <select value={filterState} onChange={e => setFilterState(e.target.value)} className="px-3 py-2.5 rounded-xl border border-charcoal-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-charcoal-900/10">
            <option value="">كل الحالات</option>
            <option value="pending">معلّق</option>
            <option value="done">مكتمل</option>
            <option value="failed">فاشل</option>
            <option value="reversed">مرتجع</option>
          </select>
          <input type="date" value={filterFrom} onChange={e => setFilterFrom(e.target.value)} className="px-3 py-2.5 rounded-xl border border-charcoal-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-charcoal-900/10" dir="ltr" />
          <input type="date" value={filterTo} onChange={e => setFilterTo(e.target.value)} className="px-3 py-2.5 rounded-xl border border-charcoal-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-charcoal-900/10" dir="ltr" />
          <div className="flex gap-2">
            {(filterState || filterFrom || filterTo) && (
              <Btn variant="ghost" size="sm" onClick={() => { setFilterState(''); setFilterFrom(''); setFilterTo(''); }}>مسح الفلاتر</Btn>
            )}
          </div>
        </div>
      </div>

      <Table
        columns={[
          { key: 'created_at', header: 'التاريخ', width: 'w-36', render: (t: Transfer) => <span className="text-xs text-charcoal-500">{new Date(t.created_at).toLocaleString('ar-IQ')}</span> },
          { key: 'sender', header: 'المرسل', width: 'w-32', render: (t: Transfer) => <span className="font-medium">{t.sender?.display_name || '—'}</span> },
          { key: 'receiver', header: 'المستلم', width: 'w-32', render: (t: Transfer) => <span className="font-medium">{t.receiver?.display_name || '—'}</span> },
          { key: 'amount', header: 'المبلغ', width: 'w-28', render: (t: Transfer) => <span className="font-bold">{t.amount?.toLocaleString()} {t.currency}</span> },
          { key: 'state', header: 'الحالة', width: 'w-24', render: (t: Transfer) => <Badge variant={stateVariants[t.state] || 'neutral'}>{stateLabels[t.state] || t.state}</Badge> },
          { key: 'note', header: 'ملاحظة', width: 'w-28', render: (t: Transfer) => <span className="text-xs text-charcoal-400 truncate max-w-28 block">{t.note || '—'}</span> },
        ]}
        data={transfers}
        onRowClick={setSelected}
      />

      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title="تفاصيل التحويل" size="md">
        {selected && (
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div><span className="text-charcoal-400 block mb-0.5">المعرف</span><span className="font-mono text-xs" dir="ltr">{selected.id}</span></div>
              <div><span className="text-charcoal-400 block mb-0.5">التاريخ</span><span>{new Date(selected.created_at).toLocaleString('ar-IQ')}</span></div>
              <div><span className="text-charcoal-400 block mb-0.5">المرسل</span><span className="font-medium">{selected.sender?.display_name || '—'} <span className="text-xs text-charcoal-400">({selected.sender?.pocket_yer})</span></span></div>
              <div><span className="text-charcoal-400 block mb-0.5">المستلم</span><span className="font-medium">{selected.receiver?.display_name || '—'} <span className="text-xs text-charcoal-400">({selected.receiver?.pocket_yer})</span></span></div>
              <div><span className="text-charcoal-400 block mb-0.5">المبلغ</span><span className="text-lg font-bold">{selected.amount?.toLocaleString()} {selected.currency}</span></div>
              <div><span className="text-charcoal-400 block mb-0.5">الحالة</span><Badge variant={stateVariants[selected.state]}>{stateLabels[selected.state]}</Badge></div>
            </div>
            {selected.note && <div className="pt-2 border-t border-charcoal-100"><span className="text-charcoal-400 block mb-0.5">ملاحظة</span><p>{selected.note}</p></div>}
          </div>
        )}
      </Modal>
    </div>
  );
}