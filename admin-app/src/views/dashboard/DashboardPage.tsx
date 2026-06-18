'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, ArrowLeftRight, ArrowDownToLine, ShoppingBag, TrendingUp } from 'lucide-react';
import { StatCard, Loading, PageHeader } from '@/components/ui/shared';
import { fetchDashboardStats, fetchTransfers, fetchDeposits, fetchOrders } from '@/lib/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import type { Transfer } from '@/lib/types';

interface DashboardStats {
  totalMembers: number;
  todayTransfers: number;
  todayTransferAmount: number;
  pendingDeposits: number;
  activeOrders: number;
}

export function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentTransfers, setRecentTransfers] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [s, t] = await Promise.all([
        fetchDashboardStats(),
        fetchTransfers().then(res => res.slice(0, 8)),
      ]);
      setStats(s);
      setRecentTransfers(t);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;
  if (!stats) return <p className="text-center py-10 text-charcoal-400">فشل تحميل البيانات</p>;

  const chartData = recentTransfers.map(t => ({
    name: t.sender?.display_name?.substring(0, 8) || '—',
    amount: t.amount,
  }));

  return (
    <div className="space-y-6">
      <PageHeader title="لوحة التحكم" subtitle="نظرة عامة على المنصة" />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
          <StatCard
            label="إجمالي الأعضاء"
            value={stats.totalMembers.toLocaleString('ar-IQ')}
            icon={<Users size={20} />}
          />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <StatCard
            label="تحويلات اليوم"
            value={stats.todayTransfers}
            sub={`${stats.todayTransferAmount.toLocaleString()} IQD`}
            icon={<ArrowLeftRight size={20} />}
            color="bg-emerald-600"
          />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <StatCard
            label="إيداعات معلّقة"
            value={stats.pendingDeposits}
            icon={<ArrowDownToLine size={20} />}
            color="bg-amber-600"
          />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <StatCard
            label="طلبات نشطة"
            value={stats.activeOrders}
            icon={<ShoppingBag size={20} />}
            color="bg-blue-600"
          />
        </motion.div>
      </div>

      {/* Chart */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white border border-charcoal-100 rounded-2xl p-5"
      >
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={18} className="text-charcoal-500" />
          <h3 className="font-bold text-charcoal-900">آخر التحويلات</h3>
        </div>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 11, fill: '#888' }} />
              <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 11, fill: '#888' }} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: '1px solid #e5e5e5', fontSize: 13 }}
                formatter={(value) => [`${Number(value).toLocaleString()} IQD`, 'المبلغ']}
              />
              <Bar dataKey="amount" fill="#1A1A1A" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-center text-charcoal-400 py-10 text-sm">لا توجد تحويلات حتى الآن</p>
        )}
      </motion.div>

      {/* Recent Transfers Table */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="bg-white border border-charcoal-100 rounded-2xl p-5"
      >
        <h3 className="font-bold text-charcoal-900 mb-4">آخر العمليات</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-charcoal-100">
                <th className="text-right py-2 text-charcoal-500 font-medium px-3">المرسل</th>
                <th className="text-right py-2 text-charcoal-500 font-medium px-3">المستلم</th>
                <th className="text-right py-2 text-charcoal-500 font-medium px-3">المبلغ</th>
                <th className="text-right py-2 text-charcoal-500 font-medium px-3">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal-50">
              {recentTransfers.map((t) => (
                <tr key={t.id} className="hover:bg-charcoal-50/50">
                  <td className="py-2.5 px-3 text-charcoal-700">{t.sender?.display_name || '—'}</td>
                  <td className="py-2.5 px-3 text-charcoal-700">{t.receiver?.display_name || '—'}</td>
                  <td className="py-2.5 px-3 font-medium text-charcoal-900">{t.amount?.toLocaleString()} {t.currency}</td>
                  <td className="py-2.5 px-3">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium
                      ${t.state === 'done' ? 'bg-green-50 text-green-700' : t.state === 'pending' ? 'bg-amber-50 text-amber-700' : t.state === 'failed' ? 'bg-red-50 text-red-700' : 'bg-charcoal-100 text-charcoal-600'}`}
                    >
                      {t.state === 'done' ? 'مكتمل' : t.state === 'pending' ? 'معلّق' : t.state === 'failed' ? 'فاشل' : 'مرتجع'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}