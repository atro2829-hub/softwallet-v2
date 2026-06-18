'use client';

import { useState, useEffect } from 'react';
import { PageHeader, Loading, Table, Modal, Btn, Input, Badge, useToast } from '@/components/ui/shared';
import { fetchCategories, createCategory, updateCategory, deleteCategory } from '@/lib/api';
import type { ServiceCategory } from '@/lib/types';
import { Plus, Pencil, Trash2 } from 'lucide-react';

export function CategoriesPage() {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<ServiceCategory | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ServiceCategory | null>(null);
  const [form, setForm] = useState({ name: '', name_ar: '', icon_url: '', parent_id: '', sort_order: '0', is_active: true });
  const { show, ToastComponent } = useToast();

  const load = async () => {
    try {
      const data = await fetchCategories();
      setCategories(data);
    } catch { show('فشل التحميل', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openNew = () => {
    setEditing(null);
    setForm({ name: '', name_ar: '', icon_url: '', parent_id: '', sort_order: '0', is_active: true });
    setModal(true);
  };

  const openEdit = (c: ServiceCategory) => {
    setEditing(c);
    setForm({ name: c.name, name_ar: c.name_ar, icon_url: c.icon_url || '', parent_id: c.parent_id || '', sort_order: String(c.sort_order), is_active: c.is_active });
    setModal(true);
  };

  const handleSubmit = async () => {
    if (!form.name || !form.name_ar) return;
    try {
      const payload = { name: form.name, name_ar: form.name_ar, icon_url: form.icon_url || null, parent_id: form.parent_id || null, sort_order: Number(form.sort_order), is_active: form.is_active };
      if (editing) {
        await updateCategory(editing.id, payload);
      } else {
        await createCategory(payload);
      }
      show('تم الحفظ');
      setModal(false);
      load();
    } catch { show('فشل الحفظ', 'error'); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteCategory(deleteTarget.id);
      show('تم الحذف');
      setDeleteTarget(null);
      load();
    } catch { show('فشل الحذف', 'error'); }
  };

  const toggleActive = async (c: ServiceCategory) => {
    try {
      await updateCategory(c.id, { is_active: !c.is_active });
      load();
    } catch { show('فشل التحديث', 'error'); }
  };

  if (loading) return <Loading />;

  const roots = categories.filter(c => !c.parent_id);
  const getChildren = (pid: string) => categories.filter(c => c.parent_id === pid);

  return (
    <div className="space-y-6">
      {ToastComponent}
      <PageHeader title="تصنيفات الخدمات" subtitle={`${categories.length} تصنيف`}>
        <Btn onClick={openNew}><Plus size={14} /> إضافة تصنيف</Btn>
      </PageHeader>

      <div className="space-y-2">
        {roots.map(root => (
          <div key={root.id} className="bg-white border border-charcoal-100 rounded-2xl overflow-hidden">
            <div className="flex items-center gap-3 p-4 hover:bg-charcoal-50/50 transition-colors">
              {root.icon_url && <img src={root.icon_url} alt="" className="w-8 h-8 rounded-lg object-cover" />}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-charcoal-900">{root.name_ar || root.name}</span>
                  <span className="text-xs text-charcoal-400">{root.name}</span>
                </div>
              </div>
              <Badge variant={root.is_active ? 'success' : 'neutral'}>{root.is_active ? 'نشط' : 'معطّل'}</Badge>
              <Btn variant="ghost" size="sm" onClick={() => toggleActive(root)}>تبديل</Btn>
              <Btn variant="ghost" size="sm" onClick={() => openEdit(root)}><Pencil size={14} /></Btn>
              <Btn variant="ghost" size="sm" onClick={() => setDeleteTarget(root)}><Trash2 size={14} className="text-red-500" /></Btn>
            </div>
            {getChildren(root.id).length > 0 && (
              <div className="border-t border-charcoal-100 bg-charcoal-50/30">
                {getChildren(root.id).map(child => (
                  <div key={child.id} className="flex items-center gap-3 p-3 pr-10 hover:bg-charcoal-50/50 transition-colors border-b border-charcoal-50 last:border-0">
                    <span className="font-medium text-sm text-charcoal-800">{child.name_ar || child.name}</span>
                    <span className="text-xs text-charcoal-400 flex-1">{child.name}</span>
                    <Badge variant={child.is_active ? 'success' : 'neutral'}>{child.is_active ? 'نشط' : 'معطّل'}</Badge>
                    <Btn variant="ghost" size="sm" onClick={() => openEdit(child)}><Pencil size={14} /></Btn>
                    <Btn variant="ghost" size="sm" onClick={() => setDeleteTarget(child)}><Trash2 size={14} className="text-red-500" /></Btn>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Create/Edit Modal */}
      <Modal isOpen={modal} onClose={() => setModal(false)} title={editing ? 'تعديل التصنيف' : 'تصنيف جديد'} size="md">
        <div className="space-y-4">
          <Input label="الاسم (إنجليزي)" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} dir="ltr" />
          <Input label="الاسم (عربي)" value={form.name_ar} onChange={e => setForm({ ...form, name_ar: e.target.value })} />
          <Input label="رابط الأيقونة" value={form.icon_url} onChange={e => setForm({ ...form, icon_url: e.target.value })} placeholder="https://..." dir="ltr" />
          <Input label="تصنيف أب (فارغ = رئيسي)" value={form.parent_id} onChange={e => setForm({ ...form, parent_id: e.target.value })} dir="ltr" />
          <Input label="الترتيب" type="number" value={form.sort_order} onChange={e => setForm({ ...form, sort_order: e.target.value })} dir="ltr" />
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} className="w-4 h-4 rounded" />
            <span className="text-sm text-charcoal-700">نشط</span>
          </label>
          <Btn onClick={handleSubmit} className="w-full">حفظ</Btn>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="حذف التصنيف" size="sm">
        <p className="text-sm text-charcoal-600 mb-4">هل أنت متأكد من حذف &quot;{deleteTarget?.name_ar}&quot;؟</p>
        <div className="flex gap-2">
          <Btn variant="danger" onClick={handleDelete}>حذف</Btn>
          <Btn variant="secondary" onClick={() => setDeleteTarget(null)}>إلغاء</Btn>
        </div>
      </Modal>
    </div>
  );
}