"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useAppStore } from "@/lib/store";
import { updateProfile } from "@/lib/auth";
import { formatCurrency } from "@/lib/utils";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Shield,
  Camera,
  Edit3,
  CheckCircle,
  Clock,
  XCircle,
  Settings,
  ChevronLeft,
  Copy,
  BadgeCheck,
} from "lucide-react";

export default function AccountPage() {
  const { member, navigateTo, showToast, setMember } = useAppStore();
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState(member?.display_name || "");
  const [email, setEmail] = useState(member?.email || "");
  const [mobile, setMobile] = useState(member?.mobile || "");
  const [saving, setSaving] = useState(false);

  if (!member) return null;

  const handleSave = async () => {
    if (!member) return;
    setSaving(true);
    try {
      const updated = await updateProfile(member.id, {
        display_name: displayName,
        email,
        mobile,
      });
      setMember(updated);
      setEditing(false);
      showToast("تم تحديث البيانات بنجاح");
    } catch {
      showToast("فشل تحديث البيانات");
    } finally {
      setSaving(false);
    }
  };

  const verifyStateConfig = {
    pending: { label: "قيد المراجعة", icon: <Clock size={14} />, color: "text-warning bg-warning/10" },
    verified: { label: "مؤكد", icon: <CheckCircle size={14} />, color: "text-success bg-success/10" },
    rejected: { label: "مرفوض", icon: <XCircle size={14} />, color: "text-error bg-error/10" },
  };

  const verifyInfo = verifyStateConfig[member.verify_state as keyof typeof verifyStateConfig] || verifyStateConfig.pending;

  return (
    <div className="pb-20 px-4 pt-2">
      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-gray-border p-6 mb-4"
      >
        <div className="flex items-center gap-4 mb-5">
          <div className="w-16 h-16 bg-charcoal rounded-2xl flex items-center justify-center">
            {member.profile_photo ? (
              <img
                src={member.profile_photo}
                alt=""
                className="w-full h-full object-cover rounded-2xl"
              />
            ) : (
              <span className="text-white text-2xl font-bold">
                {(member.display_name || "م").charAt(0)}
              </span>
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-charcoal">
              {member.display_name || "مستخدم"}
            </h2>
            {member.account_tag && (
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-xs text-text-secondary">
                  @{member.account_tag}
                </span>
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(member.account_tag || "");
                    showToast("تم نسخ المعرف");
                  }}
                >
                  <Copy size={12} className="text-text-secondary" />
                </button>
              </div>
            )}
            <div className="flex items-center gap-1.5 mt-1.5">
              <div className={`flex items-center gap-1 px-2 py-0.5 rounded-lg ${verifyInfo.color}`}>
                {verifyInfo.icon}
                <span className="text-[10px] font-medium">{verifyInfo.label}</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setEditing(!editing)}
            className="w-10 h-10 bg-gray-bg rounded-xl flex items-center justify-center"
          >
            <Edit3 size={16} className="text-charcoal" />
          </button>
        </div>

        {/* Balances */}
        <div className="grid grid-cols-3 gap-3 p-4 bg-gray-bg rounded-xl">
          <div className="text-center">
            <span className="text-sm">🇾🇪</span>
            <p className="text-xs font-bold text-charcoal mt-1">
              {formatCurrency(member.pocket_yer, "YER")}
            </p>
          </div>
          <div className="text-center">
            <span className="text-sm">🇸🇦</span>
            <p className="text-xs font-bold text-charcoal mt-1">
              {formatCurrency(member.pocket_sar, "SAR")}
            </p>
          </div>
          <div className="text-center">
            <span className="text-sm">🇺🇸</span>
            <p className="text-xs font-bold text-charcoal mt-1">
              {formatCurrency(member.pocket_usd, "USD")}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Edit Form */}
      {editing && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-white rounded-2xl border border-gray-border p-4 mb-4"
        >
          <h3 className="text-sm font-bold text-charcoal mb-4">تعديل البيانات</h3>

          <div className="space-y-3">
            <div>
              <label className="block text-xs text-text-secondary mb-1">الاسم</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-gray-bg rounded-xl px-3 py-3 text-sm outline-none border border-gray-border focus:border-charcoal/30"
              />
            </div>
            <div>
              <label className="block text-xs text-text-secondary mb-1">البريد</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                dir="ltr"
                className="w-full bg-gray-bg rounded-xl px-3 py-3 text-sm outline-none border border-gray-border focus:border-charcoal/30 text-left"
              />
            </div>
            <div>
              <label className="block text-xs text-text-secondary mb-1">الهاتف</label>
              <input
                type="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                dir="ltr"
                className="w-full bg-gray-bg rounded-xl px-3 py-3 text-sm outline-none border border-gray-border focus:border-charcoal/30 text-left"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <button
              onClick={() => setEditing(false)}
              className="flex-1 py-3 bg-gray-bg rounded-xl text-sm font-medium text-charcoal"
            >
              إلغاء
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 py-3 bg-charcoal rounded-xl text-sm font-bold text-white disabled:opacity-40"
            >
              {saving ? "جاري الحفظ..." : "حفظ"}
            </button>
          </div>
        </motion.div>
      )}

      {/* Info List */}
      <div className="bg-white rounded-2xl border border-gray-border overflow-hidden mb-4">
        {[
          {
            icon: <Mail size={16} />,
            label: "البريد",
            value: member.email || "غير محدد",
          },
          {
            icon: <Phone size={16} />,
            label: "الهاتف",
            value: member.mobile || "غير محدد",
          },
          {
            icon: <MapPin size={16} />,
            label: "المنطقة",
            value: member.region || "غير محدد",
          },
          {
            icon: <Shield size={16} />,
            label: "مستوى الحساب",
            value: member.account_tier || "basic",
          },
          {
            icon: <BadgeCheck size={16} />,
            label: "الدور",
            value: member.access_role || "member",
          },
        ].map((item, i) => (
          <div
            key={i}
            className={`flex items-center gap-3 px-4 py-4 ${
              i < 4 ? "border-b border-gray-border" : ""
            }`}
          >
            <div className="w-8 h-8 bg-gray-bg rounded-lg flex items-center justify-center text-charcoal">
              {item.icon}
            </div>
            <span className="text-xs text-text-secondary">{item.label}</span>
            <span className="text-xs font-medium text-charcoal mr-auto">
              {item.value}
            </span>
          </div>
        ))}
      </div>

      {/* Quick Links */}
      <div className="space-y-2">
        <button
          onClick={() => navigateTo("settings")}
          className="w-full flex items-center gap-3 px-4 py-4 bg-white rounded-2xl border border-gray-border hover:bg-gray-50 transition-colors"
        >
          <div className="w-9 h-9 bg-gray-bg rounded-xl flex items-center justify-center">
            <Settings size={18} className="text-charcoal" />
          </div>
          <span className="text-sm font-medium text-charcoal">الإعدادات</span>
          <ChevronLeft size={16} className="text-text-secondary mr-auto" />
        </button>

        <button
          onClick={() => navigateTo("support")}
          className="w-full flex items-center gap-3 px-4 py-4 bg-white rounded-2xl border border-gray-border hover:bg-gray-50 transition-colors"
        >
          <div className="w-9 h-9 bg-gray-bg rounded-xl flex items-center justify-center">
            <span className="text-lg">💬</span>
          </div>
          <span className="text-sm font-medium text-charcoal">الدعم الفني</span>
          <ChevronLeft size={16} className="text-text-secondary mr-auto" />
        </button>
      </div>
    </div>
  );
}
