"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useAppStore } from "@/lib/store";
import { signOut, updateProfile } from "@/lib/auth";
import {
  ChevronLeft,
  Moon,
  Sun,
  Globe,
  Shield,
  Lock,
  LogOut,
  Bell,
  ChevronUp,
  Info,
  HelpCircle,
  MessageCircle,
} from "lucide-react";

export default function SettingsPage() {
  const { member, navigateTo, showToast, setMember } = useAppStore();
  const [appearance, setAppearance] = useState(member?.appearance || "light");

  const handleSignOut = async () => {
    try {
      await signOut();
      setMember(null);
      navigateTo("login");
      showToast("تم تسجيل الخروج");
    } catch {
      showToast("فشل تسجيل الخروج");
    }
  };

  const toggleAppearance = async () => {
    const newAppearance = appearance === "light" ? "dark" : "light";
    setAppearance(newAppearance);
    if (member) {
      try {
        await updateProfile(member.id, { appearance: newAppearance });
      } catch {}
    }
  };

  if (!member) return null;

  const settingsGroups = [
    {
      title: "عام",
      items: [
        {
          icon: <Globe size={18} />,
          label: "اللغة",
          value: "العربية",
          action: () => {},
        },
        {
          icon: appearance === "light" ? <Sun size={18} /> : <Moon size={18} />,
          label: "المظهر",
          value: appearance === "light" ? "فاتح" : "داكن",
          action: toggleAppearance,
        },
        {
          icon: <Bell size={18} />,
          label: "الإشعارات",
          value: "",
          action: () => showToast("إعدادات الإشعارات"),
        },
      ],
    },
    {
      title: "الأمان",
      items: [
        {
          icon: <Shield size={18} />,
          label: "تغيير كلمة المرور",
          value: "",
          action: () => showToast("تغيير كلمة المرور"),
        },
        {
          icon: <Lock size={18} />,
          label: "رمز PIN",
          value: member.security_pin ? "مفعّل" : "غير مفعل",
          action: () => showToast("إعدادات رمز PIN"),
        },
      ],
    },
    {
      title: "المساعدة",
      items: [
        {
          icon: <HelpCircle size={18} />,
          label: "مركز المساعدة",
          value: "",
          action: () => showToast("مركز المساعدة"),
        },
        {
          icon: <MessageCircle size={18} />,
          label: "تواصل معنا",
          value: "",
          action: () => navigateTo("support"),
        },
        {
          icon: <Info size={18} />,
          label: "عن سوفت واليت",
          value: "الإصدار 2.0.0",
          action: () => {},
        },
      ],
    },
  ];

  return (
    <div className="pb-20 px-4 pt-2">
      {settingsGroups.map((group, gi) => (
        <div key={gi} className="mb-6">
          <h3 className="text-xs font-bold text-text-secondary mb-3 px-1">
            {group.title}
          </h3>
          <div className="bg-white rounded-2xl border border-gray-border overflow-hidden">
            {group.items.map((item, ii) => (
              <button
                key={ii}
                onClick={item.action}
                className={`w-full flex items-center gap-3 px-4 py-4 hover:bg-gray-50 transition-colors ${
                  ii < group.items.length - 1 ? "border-b border-gray-border" : ""
                }`}
              >
                <div className="w-9 h-9 bg-gray-bg rounded-xl flex items-center justify-center text-charcoal">
                  {item.icon}
                </div>
                <span className="text-sm font-medium text-charcoal flex-1 text-right">
                  {item.label}
                </span>
                <div className="flex items-center gap-2">
                  {item.value && (
                    <span className="text-xs text-text-secondary">{item.value}</span>
                  )}
                  <ChevronLeft size={14} className="text-text-secondary" />
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* Sign Out */}
      <button
        onClick={handleSignOut}
        className="w-full flex items-center justify-center gap-2 py-4 bg-error/5 rounded-2xl text-sm font-bold text-error hover:bg-error/10 transition-colors"
      >
        <LogOut size={18} />
        تسجيل الخروج
      </button>
    </div>
  );
}
