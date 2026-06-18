'use client';

import { useState, useEffect } from 'react';
import { PageHeader, Loading, Table, Modal, Btn, Input, Badge, useToast } from '@/components/ui/shared';
import { fetchBanners, createBanner, updateBanner } from '@/lib/api';
import type { HeroBanner } from '@/lib/types';
import { Plus, Eye, EyeOff, GripVertical, Pencil } from 'lucide-react';

export function BannersPage() {
  const [banners, setBanners] = useState<HeroBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<HeroBanner | null>(null);
  const [form, setForm] = useState({ title: '', subtitle: '', image_url: '', link_url: '', sort_order: '0', is_visible: true });
  const { show, ToastComponent } = useToast();

  const load = async () => {
    try {
      const data = await fetchBanners();
      setBanners(data);
    } catch { show('فشل تحميل البانرات', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openNew = () => {
    setEditing(null);
    setForm({ title: '', subtitle: '', image_url: '', link_url: '', sort_order: '0', is_visible: true });
    setModal(true);
  };

  const openEdit = (b: HeroBanner) => {
    setEditing(b);
    setForm({ title: b.title, subtitle: b.subtitle || '', image_url: b.image_url, link_url: b.link_url || '', sort_order: String(b.sort_order), is_visible: b.is_visible });
    setModal(true);
  };

  const handleSubmit = async () => {
    if (!form.title || !form.image_url) return;
    try {
      const payload = { title: form.title, subtitle: form.subtitle || null, image_url: form.image_url, link_url: form.link_url || null, sort_order: Number(form.sort_order), is_visible: form.is_visible };
      if (editing) {
        await updateBanner(editing.id, payload);
      } else {
        await createBanner(payload as Omit<HeroBanner, 'id' | 'created_at'>);
      }
      show('تم الحفظ');
      setModal(false);
      load();
    } catch { show('فشل الحفظ', 'error'); }
  };

  const toggleVisibility = async (b: HeroBanner) => {
    try {
      await updateBanner(b.id, { is_visible: !b.is_visible });
      show('تم تحديث الظهور');
      load();
    } catch { show('فشل التحديث', 'error'); }
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      {ToastComponent}
      <PageHeader title="البانرات" subtitle={`${banners.length} بانر`}>
        <Btn onClick={openNew}><Plus size={14} /> إضافة بانر</Btn>
      </PageHeader>

      <div className="grid gap-4">
        {banners.map(b => (
          <div key={b.id} className="bg-white border border-charcoal-100 rounded-2xl p-4 flex flex-col sm:flex-row gap-4 items-start">
            <div className="w-full sm:w-48 h-28 bg-charcoal-50 rounded-xl overflow-hidden shrink-0">
              <img src={b.image_url} alt={b.title} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-bold text-charcoal-900">{b.title}</h3>
                  {b.subtitle && <p className="text-sm text-charcoal-500 mt-0.5">{b.subtitle}</p>}
                  {b.link_url && <p className="text-xs text-charcoal-400 mt-1" dir="ltr">{b.link_url}</p>}
                </div>
                <Badge variant={b.is_visible ? 'success' : 'neutral'}>{b.is_visible ? 'ظاهر' : 'مخفي'}</Badge>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <Btn variant="ghost" size="sm" onClick={() => openEdit(b)}><Pencil size={14} /> تعديل</Btn>
                <Btn variant="ghost" size="sm" onClick={() => toggleVisibility(b)}>
                  {b.is_visible ? <EyeOff size={14} /> : <Eye size={14} />}
                  {b.is_visible ? 'إخفاء' : 'إظهار'}
                </Btn>
              </div>
            </div>
            <div className="flex items-center text-charcoal-300"><GripVertical size={18} /></div>
          </div>
        ))}
      </div>

      <Modal isOpen={modal} onClose={() => setModal(false)} title={editing ? 'تعديل البانر' : 'إضافة بانر'} size="lg">
        <div className="space-y-4">
          <Input label="العنوان" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="عنوان البانر" />
          <Input label="العنوان الفرعي" value={form.subtitle} onChange={e => setForm({ ...form, subtitle: e.target.value })} placeholder="عنوان فرعي (اختياري)" />
          <Input label="رابط الصورة" value={form.image_url} onChange={e => setForm({ ...form, image_url: e.target.value })} placeholder="https://..." dir="ltr" />
          <Input label="رابط التوجيه" value={form.link_url} onChange={e => setForm({ ...form, link_url: e.target.value })} placeholder="https://... (اختياري)" dir="ltr" />
          <Input label="ترتيب العرض" type="number" value={form.sort_order} onChange={e => setForm({ ...form, sort_order: e.target.value })} dir="ltr" />
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.is_visible} onChange={e => setForm({ ...form, is_visible: e.target.checked })} className="w-4 h-4 rounded" />
            <span className="text-sm text-charcoal-700">ظاهر للمستخدمين</span>
          </label>
          <Btn onClick={handleSubmit} className="w-full">حفظ</Btn>
        </div>
      </Modal>
    </div>
  );
}