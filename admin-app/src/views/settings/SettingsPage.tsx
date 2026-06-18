'use client';

import { useState, useEffect } from 'react';
import { PageHeader, Loading, Btn, Input, useToast, Badge } from '@/components/ui/shared';
import { fetchConfig, upsertConfig } from '@/lib/api';
import type { PlatformConfig } from '@/lib/types';
import { Save, Power, PowerOff, AlertTriangle } from 'lucide-react';

export function SettingsPage() {
  const [config, setConfig] = useState<PlatformConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { show, ToastComponent } = useToast();

  const getValue = (key: string) => config.find(c => c.key === key)?.value || '';
  const isTrue = (key: string) => getValue(key) === 'true';

  const load = async () => {
    try {
      const data = await fetchConfig();
      setConfig(data);
    } catch { show('فشل التحميل', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const updateValue = async (key: string, value: string) => {
    setSaving(true);
    try {
      await upsertConfig(key, value);
      show('تم الحفظ');
      load();
    } catch { show('فشل الحفظ', 'error'); }
    finally { setSaving(false); }
  };

  const toggleBool = (key: string) => {
    const newVal = isTrue(key) ? 'false' : 'true';
    updateValue(key, newVal);
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      {ToastComponent}
      <PageHeader title="الإعدادات" subtitle="إعدادات المنصة العامة" />

      {/* Maintenance */}
      <div className="bg-white border border-charcoal-100 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
            <AlertTriangle size={18} className="text-amber-600" />
          </div>
          <div>
            <h3 className="font-bold text-charcoal-900">وضع الصيانة</h3>
            <p className="text-xs text-charcoal-400">تفعيل الصيانة يمنع المستخدمين من استخدام التطبيق</p>
          </div>
        </div>
        <div className="flex items-center justify-between p-4 bg-charcoal-50 rounded-xl">
          <div>
            <p className="text-sm font-medium text-charcoal-700">وضع الصيانة</p>
            <p className="text-xs text-charcoal-400 mt-0.5">maintenance</p>
          </div>
          <button
            onClick={() => toggleBool('maintenance')}
            disabled={saving}
            className={`relative w-14 h-7 rounded-full transition-colors ${isTrue('maintenance') ? 'bg-red-500' : 'bg-charcoal-200'}`}
          >
            <span className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-all ${isTrue('maintenance') ? 'left-0.5' : 'right-0.5'}`} />
          </button>
        </div>
      </div>

      {/* Kill Switch */}
      <div className="bg-white border border-charcoal-100 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
            <PowerOff size={18} className="text-red-600" />
          </div>
          <div>
            <h3 className="font-bold text-charcoal-900">مفتاح الإيقاف</h3>
            <p className="text-xs text-charcoal-400">إيقاف فوري لجميع العمليات</p>
          </div>
        </div>
        <div className="flex items-center justify-between p-4 bg-red-50/50 rounded-xl border border-red-100">
          <div>
            <p className="text-sm font-medium text-charcoal-700">kill_switch</p>
            <p className="text-xs text-charcoal-400 mt-0.5">يمنع جميع العمليات فوراً</p>
          </div>
          <button
            onClick={() => toggleBool('kill_switch')}
            disabled={saving}
            className={`relative w-14 h-7 rounded-full transition-colors ${isTrue('kill_switch') ? 'bg-red-600' : 'bg-charcoal-200'}`}
          >
            <span className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-all ${isTrue('kill_switch') ? 'left-0.5' : 'right-0.5'}`} />
          </button>
        </div>
      </div>

      {/* App Settings */}
      <div className="bg-white border border-charcoal-100 rounded-2xl p-6">
        <h3 className="font-bold text-charcoal-900 mb-4">إعدادات التطبيق</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-charcoal-50 rounded-xl">
            <div>
              <p className="text-sm font-medium text-charcoal-700">app_settings</p>
              <p className="text-xs text-charcoal-400 mt-0.5">إعدادات JSON للتطبيق</p>
            </div>
          </div>
          <textarea
            defaultValue={getValue('app_settings')}
            onBlur={(e) => updateValue('app_settings', e.target.value)}
            rows={8}
            dir="ltr"
            className="w-full px-4 py-3 rounded-xl border border-charcoal-200 text-sm font-mono bg-white focus:outline-none focus:ring-2 focus:ring-charcoal-900/10"
          />
          <Btn onClick={() => { const el = document.querySelector('textarea'); if (el) updateValue('app_settings', (el as HTMLTextAreaElement).value); }} disabled={saving}>
            <Save size={14} /> حفظ الإعدادات
          </Btn>
        </div>
      </div>

      {/* Card Styles */}
      <div className="bg-white border border-charcoal-100 rounded-2xl p-6">
        <h3 className="font-bold text-charcoal-900 mb-4">أنماط البطاقات</h3>
        <div className="flex items-center justify-between p-4 bg-charcoal-50 rounded-xl">
          <div>
            <p className="text-sm font-medium text-charcoal-700">card_styles</p>
            <p className="text-xs text-charcoal-400 mt-0.5">أنماط بطاقات المستخدم (JSON)</p>
          </div>
        </div>
        <textarea
          defaultValue={getValue('card_styles')}
          onBlur={(e) => updateValue('card_styles', e.target.value)}
          rows={6}
          dir="ltr"
          className="w-full mt-3 px-4 py-3 rounded-xl border border-charcoal-200 text-sm font-mono bg-white focus:outline-none focus:ring-2 focus:ring-charcoal-900/10"
        />
      </div>
    </div>
  );
}