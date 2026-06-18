'use client';

import { useState, useEffect, useCallback } from 'react';
import { PageHeader, Loading, Table, Badge, SearchBar, useToast } from '@/components/ui/shared';
import { fetchActivity } from '@/lib/api';
import type { ActivityTrail } from '@/lib/types';

export function ActivityPage() {
  const [activities, setActivities] = useState<(ActivityTrail & { member: { id: string; display_name: string; pocket_yer: string } | null })[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState('');
  const [search, setSearch] = useState('');
  const { show, ToastComponent } = useToast();

  const load = useCallback(async () => {
    try {
      const data = await fetchActivity({ action: filterAction || undefined });
      setActivities(data as any);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [filterAction]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <Loading />;

  const filtered = search
    ? activities.filter(a => a.member?.display_name?.includes(search) || a.member?.pocket_yer?.includes(search) || a.action?.includes(search))
    : activities;

  const actionColors: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'neutral'> = {
    transfer: 'info',
    deposit: 'success',
    cashout: 'warning',
    register: 'neutral',
    login: 'neutral',
    verify: 'success',
    freeze: 'danger',
  };

  return (
    <div className="space-y-6">
      <PageHeader title="سجل النشاطات" subtitle={`${filtered.length} نشاط`} />

      <div className="bg-white border border-charcoal-100 rounded-2xl p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <SearchBar value={search} onChange={setSearch} />
          <select value={filterAction} onChange={e => setFilterAction(e.target.value)} className="px-3 py-2.5 rounded-xl border border-charcoal-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-charcoal-900/10">
            <option value="">كل الأفعال</option>
            <option value="transfer">تحويل</option>
            <option value="deposit">إيداع</option>
            <option value="cashout">سحب</option>
            <option value="register">تسجيل</option>
            <option value="login">دخول</option>
            <option value="verify">تحقق</option>
            <option value="freeze">تجميد</option>
          </select>
        </div>
      </div>

      <div className="max-h-[70vh] overflow-y-auto">
        <Table
          columns={[
            { key: 'created_at', header: 'الوقت', width: 'w-44', render: (a: any) => <span className="text-xs text-charcoal-500 whitespace-nowrap">{new Date(a.created_at).toLocaleString('ar-IQ')}</span> },
            { key: 'member', header: 'العضو', width: 'w-32', render: (a: any) => <span className="font-medium">{a.member?.display_name || '—'}</span> },
            { key: 'pocket_yer', header: '@بوكيت', width: 'w-24', render: (a: any) => <span className="text-xs font-mono text-charcoal-500" dir="ltr">@{a.member?.pocket_yer || '—'}</span> },
            { key: 'action', header: 'الفعل', width: 'w-24', render: (a: any) => <Badge variant={actionColors[a.action] || 'neutral'}>{a.action}</Badge> },
            { key: 'details', header: 'التفاصيل', render: (a: any) => <span className="text-xs text-charcoal-500 truncate max-w-64 block">{a.details || '—'}</span> },
          ]}
          data={filtered}
        />
      </div>
    </div>
  );
}