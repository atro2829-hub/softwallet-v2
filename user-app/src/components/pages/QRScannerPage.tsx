"use client";

import { motion } from "framer-motion";
import { useAppStore } from "@/lib/store";
import { QrCode, Copy, Share2, X } from "lucide-react";

export default function QRScannerPage() {
  const { member, navigateTo, showToast } = useAppStore();

  return (
    <div className="pb-20 px-4 pt-2">
      <div className="bg-white rounded-2xl border border-gray-border p-6 mb-4">
        <div className="flex flex-col items-center py-8">
          {/* QR Code Placeholder */}
          <div className="w-56 h-56 bg-gray-bg rounded-3xl border-2 border-dashed border-gray-border flex items-center justify-center mb-4">
            <QrCode size={80} className="text-charcoal/20" />
          </div>
          <p className="text-sm font-medium text-charcoal mb-1">المسح عبر الكاميرا</p>
          <p className="text-xs text-text-secondary">قم بمسح رمز QR لإجراء عملية</p>
        </div>
      </div>

      {/* My QR Code */}
      <div className="bg-white rounded-2xl border border-gray-border p-6">
        <h3 className="text-sm font-bold text-charcoal mb-4">رمزي الشخصي</h3>

        {member?.account_tag && (
          <div className="flex flex-col items-center">
            <div className="w-44 h-44 bg-charcoal rounded-2xl flex items-center justify-center mb-4">
              <QrCode size={100} className="text-white" />
            </div>
            <p className="text-sm font-medium text-charcoal mb-2">
              @{member.account_tag}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(member.account_tag || "");
                  showToast("تم نسخ المعرف");
                }}
                className="flex items-center gap-2 px-4 py-2 bg-gray-bg rounded-xl text-xs font-medium text-charcoal"
              >
                <Copy size={14} />
                نسخ
              </button>
              <button
                onClick={() => showToast("تم مشاركة المعرف")}
                className="flex items-center gap-2 px-4 py-2 bg-charcoal rounded-xl text-xs font-medium text-white"
              >
                <Share2 size={14} />
                مشاركة
              </button>
            </div>
          </div>
        )}

        {!member?.account_tag && (
          <p className="text-center text-xs text-text-secondary">
            لم يتم تعيين معرف حساب بعد
          </p>
        )}
      </div>
    </div>
  );
}
