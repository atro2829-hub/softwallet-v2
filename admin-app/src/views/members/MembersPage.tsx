'use client';

import { useState, useEffect, useCallback } from 'react';
import { StatCard, Badge, Btn, SearchBar, PageHeader, Loading, EmptyState, Modal, Input, Table, useToast } from '@/components/ui/shared';
import { fetchMembers, updateMember, adjustBalance } from '@/lib/api';
import type { Member } from '@/lib/types';
import { Users, Snowflake, ShieldCheck, ShieldX, Plus, Minus } from 'lucide-react';

export function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [search, setSearch] = useState('');
  const [filterVerify, setFilterVerify] = useState('');
  const [filterFrozen, setFilterFrozen] = useState('');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Member | null>(null);
  const [balanceModal, setBalanceModal] = useState<Member | null>(null);
  const [balanceAmount, setBalanceAmount] = useState('');
  const [balanceReason, setBalanceReason] = useState('');
  const { show, ToastComponent } = useToast();

  const load = useCallback(async () => {
    try {
      const data = await fetchMembers({
        search: search || undefined,
        verify_state: filterVerify || undefined,
        is_frozen: filterFrozen === 'true' ? true : filterFrozen === 'false' ? false : undefined,
      });
      setMembers(data);
    } catch { show('فشل تحميل الأعضاء', 'error'); }
    finally { setLoading(false); }
  }, [search, filterVerify, filterFrozen, show]);

  useEffect(() => { load(); }, [load]);

  const handleFreeze = async (m: Member) => {
    try {
      await updateMember(m.id, { is_frozen: !m.is_frozen });
      show(m.is_frozen ? 'تم إلغاء التجميد' : 'تم تجميد العضو');
      load();
    } catch { show('فشل تحديث الحالة', 'error'); }
  };

  const handleVerify = async (m: Member, state: 'verified' | 'rejected') => {
    try {
      await updateMember(m.id, { verify_state: state });
      show('تم تحديث حالة التحقق');
      setSelected(null);
      load();
    } catch { show('فشل التحديث', 'error'); }
  };

  const handleBalanceAdjust = async () => {
    if (!balanceModal || !balanceAmount || !balanceReason) return;
    try {
      await adjustBalance(balanceModal.id, Number(balanceAmount), balanceReason);
      show('تم تعديل الرصيد');
      setBalanceModal(null);
      setBalanceAmount('');
      setBalanceReason('');
      load();
    } catch { show('فشل تعديل الرصيد', 'error'); }
  };

  if (loading) return <Loading />;

  const verified = members.filter(m => m.verify_state === 'verified').length;
  const frozen = members.filter(m => m.is_frozen).length;

  return (
    <div className="space-y-6">
      {ToastComponent}
      <PageHeader title="الأعضاء" subtitle={`${members.length} عضو مسجّل`} />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="إجمالي الأعضاء" value={members.length} icon={<Users size={20} />} />
        <StatCard label="متحققين" value={verified} icon={<ShieldCheck size={20} />} color="bg-emerald-600" />
        <StatCard label="مجمّدين" value={frozen} icon={<Snowflake size={20} />} color="bg-red-600" />
      </div>

      {/* Filters */}
      <div className="bg-white border border-charcoal-100 rounded-2xl p-4">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="sm:col-span-2">
            <SearchBar value={search} onChange={setSearch} />
          </div>
          <select
            value={filterVerify}
            onChange={e => setFilterVerify(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-charcoal-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-charcoal-900/10"
          >
            <option value="">كل حالات التحقق</option>
            <option value="pending">قيد الانتظار</option>
            <option value="verified">متاحق</option>
            <option value="rejected">مرفوض</option>
          </select>
          <select
            value={filterFrozen}
            onChange={e => setFilterFrozen(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-charcoal-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-charcoal-900/10"
          >
            <option value="">كل الحالات</option>
            <option value="false">نشط</option>
            <option value="true">مجمّد</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <Table
        columns={[
          { key: 'display_name', header: 'الاسم', width: 'w-32', render: (m: Member) => <span className="font-medium text-charcoal-900">{m.display_name}</span> },
          { key: 'pocket_yer', header: '@بوكيت', width: 'w-28', render: (m: Member) => <span className="text-charcoal-500 text-xs font-mono" dir="ltr">@{m.pocket_yer}</span> },
          { key: 'phone', header: 'الهاتف', width: 'w-28', render: (m: Member) => <span dir="ltr" className="text-xs">{m.phone || '—'}</span> },
          { key: 'balance', header: 'الرصيد', width: 'w-24', render: (m: Member) => <span className="font-medium">{m.balance?.toLocaleString() ?? '0'}</span> },
          { key: 'verify_state', header: 'التحقق', width: 'w-24', render: (m: Member) => (
            <Badge variant={m.verify_state === 'verified' ? 'success' : m.verify_state === 'rejected' ? 'danger' : 'warning'}>
              {m.verify_state === 'verified' ? 'متاحق' : m.verify_state === 'rejected' ? 'مرفوض' : 'معلّق'}
            </Badge>
          )},
          { key: 'is_frozen', header: 'الحالة', width: 'w-24', render: (m: Member) => (
            <Badge variant={m.is_frozen ? 'danger' : 'success'}>
              {m.is_frozen ? 'مجمّد' : 'نشط'}
            </Badge>
          )},
        ]}
        data={members}
        onRowClick={setSelected}
      />

      {/* Member Detail Modal */}
      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title="تفاصيل العضو" size="lg">
        {selected && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-charcoal-400 block mb-0.5">الاسم</span><span className="font-medium">{selected.display_name}</span></div>
              <div><span className="text-charcoal-400 block mb-0.5">البريد</span><span className="font-mono text-xs" dir="ltr">{selected.email}</span></div>
              <div><span className="text-charcoal-400 block mb-0.5">الهاتف</span><span className="font-mono text-xs" dir="ltr">{selected.phone || '—'}</span></div>
              <div><span className="text-charcoal-400 block mb-0.5">@بوكيت</span><span className="font-mono text-xs" dir="ltr">@{selected.pocket_yer}</span></div>
              <div><span className="text-charcoal-400 block mb-0.5">الرصيد</span><span className="font-bold text-lg">{selected.balance?.toLocaleString() ?? '0'}</span></div>
              <div><span className="text-charcoal-400 block mb-0.5">account_tag</span><span className="font-mono text-xs" dir="ltr">{selected.account_tag}</span></div>
              <div><span className="text-charcoal-400 block mb-0.5">تاريخ التسجيل</span><span>{new Date(selected.created_at).toLocaleDateString('ar-IQ')}</span></div>
              <div><span className="text-charcoal-400 block mb-0.5">مدير</span><span>{selected.is_manager ? 'نعم' : 'لا'}</span></div>
            </div>
            <div className="flex flex-wrap gap-2 pt-3 border-t border-charcoal-100">
              <Btn variant="secondary" size="sm" onClick={() => setBalanceModal(selected)}>
                <Plus size={14} /> تعديل الرصيد
              </Btn>
              {selected.verify_state === 'pending' && (
                <>
                  <Btn size="sm" onClick={() => handleVerify(selected, 'verified')}><ShieldCheck size={14} /> قبول</Btn>
                  <Btn size="sm" variant="danger" onClick={() => handleVerify(selected, 'rejected')}><ShieldX size={14} /> رفض</Btn>
                </>
              )}
              <Btn size="sm" variant={selected.is_frozen ? 'secondary' : 'danger'} onClick={() => handleFreeze(selected)}>
                <Snowflake size={14} /> {selected.is_frozen ? 'إلغاء التجميد' : 'تجميد'}
              </Btn>
            </div>
          </div>
        )}
      </Modal>

      {/* Balance Modal */}
      <Modal isOpen={!!balanceModal} onClose={() => setBalanceModal(null)} title="تعديل الرصيد" size="sm">
        {balanceModal && (
          <div className="space-y-4">
            <p className="text-sm text-charcoal-500">الرصيد الحالي: <span className="font-bold text-charcoal-900">{balanceModal.balance?.toLocaleString()}</span></p>
            <div className="flex gap-2">
              <button onClick={() => setBalanceAmount(String(Math.abs(Number(balanceAmount || 0))))} className={`flex-1 py-2 rounded-xl text-sm font-medium border-2 transition-all ${balanceAmount.startsWith('-') ? 'border-charcoal-200 text-charcoal-400' : 'border-charcoal-900 text-charcoal-900 bg-charcoal-50'}`}>
                <Plus size={14} className="inline ml-1" /> إضافة
              </button>
              <button onClick={() => setBalanceAmount('-' + Math.abs(Number(balanceAmount || 0)))} className={`flex-1 py-2 rounded-xl text-sm font-medium border-2 transition-all ${balanceAmount.startsWith('-') ? 'border-red-500 text-red-600 bg-red-50' : 'border-charcoal-200 text-charcoal-400'}`}>
                <Minus size={14} className="inline ml-1" /> خصم
              </button>
            </div>
            <Input label="المبلغ" type="number" value={balanceAmount} onChange={e => setBalanceAmount(e.target.value)} placeholder="0" dir="ltr" />
            <Input label="السبب" value={balanceReason} onChange={e => setBalanceReason(e.target.value)} placeholder="سبب التعديل" />
            <Btn onClick={handleBalanceAdjust} className="w-full">تأكيد</Btn>
          </div>
        )}
      </Modal>
    </div>
  );
}