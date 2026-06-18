'use client';

import { useState, useEffect } from 'react';
import { PageHeader, Loading, Modal, Btn, Input, Table, useToast, Badge } from '@/components/ui/shared';
import { fetchNotices, sendNotice } from '@/lib/api';
import type { AdminNotice } from '@/lib/types';
import { Plus, Send } from 'lucide-react';

export function NotificationsPage() {
  const [notices, setNotices] = useState<AdminNotice[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ title: '', body: '', target: 'all' as 'all' | 'verified' });
  const { show, ToastComponent } = useToast();

  const load = async () => {
    try {
      const data = await fetchNotices();
      setNotices(data);
    } catch { show('فشل التحميل', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleSend = async () => {
    if (!form.title || !form.body) return;
    try {
      await sendNotice(form);
      show('تم إرسال الإشعار');
      setModal(false);
      setForm({ title: '', body: '', target: 'all' });
      load();
    } catch { show('فشل الإرسال', 'error'); }
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      {ToastComponent}
      <PageHeader title="الإشعارات" subtitle={`${notices.length} إشعار`}>
        <Btn onClick={() => setModal(true)}><Plus size={14} /> إرسال إشعار</Btn>
      </PageHeader>

      <Table
        columns={[
          { key: 'created_at', header: 'التاريخ', width: 'w-36', render: (n: AdminNotice) => <span className="text-xs text-charcoal-500">{new Date(n.created_at).toLocaleString('ar-IQ')}</span> },
          { key: 'title', header: 'العنوان', width: 'w-40', render: (n: AdminNotice) => <span className="font-medium">{n.title}</span> },
          { key: 'body', header: 'المحتوى', render: (n: AdminNotice) => <span className="text-xs text-charcoal-600 truncate max-w-64 block">{n.body}</span> },
          { key: 'target', header: 'الاستهداف', width: 'w-28', render: (n: AdminNotice) => <Badge variant={n.target === 'all' ? 'info' : 'success'}>{n.target === 'all' ? 'الكل' : 'المتحققين فقط'}</Badge> },
        ]}
        data={notices}
      />

      <Modal isOpen={modal} onClose={() => setModal(false)} title="إرسال إشعار جديد" size="md">
        <div className="space-y-4">
          <Input label="العنوان" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="عنوان الإشعار" />
          <Input label="المحتوى" value={form.body} onChange={e => setForm({ ...form, body: e.target.value })} placeholder="نص الإشعار..." multiline rows={4} />
          <Input
            label="الاستهداف"
            value={form.target}
            onChange={e => setForm({ ...form, target: e.target.value as 'all' | 'verified' })}
            options={[{ label: 'جميع الأعضاء', value: 'all' }, { label: 'المتحققين فقط', value: 'verified' }]}
          />
          <Btn onClick={handleSend} className="w-full"><Send size={14} /> إرسال</Btn>
        </div>
      </Modal>
    </div>
  );
}