'use client';

import { useState, useEffect } from 'react';
import { PageHeader, Loading, Table, Modal, Btn, Input, Badge, useToast } from '@/components/ui/shared';
import { fetchProviders, createProvider, updateProvider, fetchCategories } from '@/lib/api';
import type { ServiceProvider, ServiceCategory } from '@/lib/types';
import { Plus, Pencil } from 'lucide-react';

export function ProvidersPage() {
  const [providers, setProviders] = useState<(ServiceProvider & { category: ServiceCategory | null })[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<ServiceProvider | null>(null);
  const [form, setForm] = useState({ category_id: '', name: '', description: '', is_active: true });
  const { show, ToastComponent } = useToast();

  const load = async () => {
    try {
      const [p, c] = await Promise.all([fetchProviders(), fetchCategories()]);
      setProviders(p);
      setCategories(c);
    } catch { show('فشل التحميل', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openNew = () => {
    setEditing(null);
    setForm({ category_id: '', name: '', description: '', is_active: true });
    setModal(true);
  };

  const openEdit = (p: ServiceProvider) => {
    setEditing(p);
    setForm({ category_id: p.category_id, name: p.name, description: p.description || '', is_active: p.is_active });
    setModal(true);
  };

  const handleSubmit = async () => {
    if (!form.category_id || !form.name) return;
    try {
      const payload = { category_id: form.category_id, name: form.name, description: form.description || null, is_active: form.is_active };
      if (editing) {
        await updateProvider(editing.id, payload);
      } else {
        await createProvider(payload as Omit<ServiceProvider, 'id' | 'created_at'>);
      }
      show('تم الحفظ');
      setModal(false);
      load();
    } catch { show('فشل الحفظ', 'error'); }
  };

  const toggleActive = async (p: ServiceProvider) => {
    try {
      await updateProvider(p.id, { is_active: !p.is_active });
      load();
    } catch { show('فشل التحديث', 'error'); }
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      {ToastComponent}
      <PageHeader title="مزودو الخدمات" subtitle={`${providers.length} مزود`}>
        <Btn onClick={openNew}><Plus size={14} /> إضافة مزود</Btn>
      </PageHeader>

      <Table
        columns={[
          { key: 'name', header: 'الاسم', render: (p: ServiceProvider & { category: ServiceCategory | null }) => <span className="font-medium">{p.name}</span> },
          { key: 'category', header: 'التصنيف', width: 'w-32', render: (p: ServiceProvider & { category: ServiceCategory | null }) => <span>{p.category?.name_ar || p.category?.name || '—'}</span> },
          { key: 'description', header: 'الوصف', render: (p: ServiceProvider & { category: ServiceCategory | null }) => <span className="text-xs text-charcoal-500 truncate max-w-48 block">{p.description || '—'}</span> },
          { key: 'is_active', header: 'الحالة', width: 'w-24', render: (p: ServiceProvider & { category: ServiceCategory | null }) => <Badge variant={p.is_active ? 'success' : 'neutral'}>{p.is_active ? 'نشط' : 'معطّل'}</Badge> },
          { key: 'actions', header: '', width: 'w-32', render: (p: ServiceProvider & { category: ServiceCategory | null }) => (
            <div className="flex gap-1" onClick={e => e.stopPropagation()}>
              <Btn variant="ghost" size="sm" onClick={() => toggleActive(p)}>{p.is_active ? 'تعطيل' : 'تفعيل'}</Btn>
              <Btn variant="ghost" size="sm" onClick={() => openEdit(p)}><Pencil size={14} /></Btn>
            </div>
          )},
        ]}
        data={providers}
      />

      <Modal isOpen={modal} onClose={() => setModal(false)} title={editing ? 'تعديل المزود' : 'مزود جديد'} size="md">
        <div className="space-y-4">
          <Input
            label="التصنيف"
            value={form.category_id}
            onChange={e => setForm({ ...form, category_id: e.target.value })}
            options={categories.map(c => ({ label: c.name_ar || c.name, value: c.id }))}
          />
          <Input label="الاسم" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="اسم المزود" />
          <Input label="الوصف" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="وصف اختياري" multiline />
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