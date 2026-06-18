"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAppStore } from "@/lib/store";
import { getTransfers, getAlerts } from "@/lib/auth";
import { formatCurrency, getGreeting, formatDate } from "@/lib/utils";
import { getCurrencyName } from "@/lib/utils";
import BalanceCard from "@/components/ui/BalanceCard";
import QuickAction from "@/components/ui/QuickAction";
import TransferItem from "@/components/ui/TransferItem";
import EmptyState from "@/components/ui/EmptyState";
import {
  Send,
  Plus,
  ArrowDownToLine,
  CreditCard,
  QrCode,
  ArrowLeftRight,
  ChevronLeft,
  Eye,
  EyeOff,
  TrendingUp,
} from "lucide-react";

export default function HomePage() {
  const {
    member,
    transfers,
    setTransfers,
    setAlerts,
    unreadCount,
    navigateTo,
  } = useAppStore();

  const [showBalance, setShowBalance] = useState(true);

  useEffect(() => {
    if (member) {
      getTransfers(member.id, 10).then(setTransfers).catch(() => {});
      getAlerts(member.id).then(setAlerts).catch(() => {});
    }
  }, [member]);

  if (!member) return null;

  const greeting = getGreeting();
  const displayName = member.display_name || "مستخدم";

  return (
    <div className="pb-20">
      {/* Balance Hero Section */}
      <div className="bg-charcoal rounded-b-[32px] px-4 pt-4 pb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-white/60 text-xs">{greeting}</p>
            <h2 className="text-white text-lg font-bold">{displayName}</h2>
          </div>
          <button
            onClick={() => setShowBalance(!showBalance)}
            className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center"
          >
            {showBalance ? (
              <Eye size={18} className="text-white" />
            ) : (
              <EyeOff size={18} className="text-white/60" />
            )}
          </button>
        </div>

        {/* Total Balance */}
        <div className="mb-6">
          <p className="text-white/50 text-[10px] mb-1">الرصيد الإجمالي</p>
          <div className="flex items-baseline gap-2">
            {showBalance ? (
              <>
                <span className="text-white text-3xl font-bold">
                  {formatCurrency(member.pocket_yer, "YER")}
                </span>
              </>
            ) : (
              <span className="text-white text-3xl font-bold">**** ****</span>
            )}
          </div>
        </div>

        {/* Currency Cards Row */}
        <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1 no-scrollbar">
          <div className="shrink-0 bg-white/10 rounded-2xl p-4 min-w-[140px]">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm">🇾🇪</span>
              <span className="text-white/60 text-[10px]">ريال يمني</span>
            </div>
            <p className="text-white text-lg font-bold">
              {showBalance ? formatCurrency(member.pocket_yer, "YER") : "****"}
            </p>
          </div>
          <div className="shrink-0 bg-white/10 rounded-2xl p-4 min-w-[140px]">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm">🇸🇦</span>
              <span className="text-white/60 text-[10px]">ريال سعودي</span>
            </div>
            <p className="text-white text-lg font-bold">
              {showBalance ? formatCurrency(member.pocket_sar, "SAR") : "****"}
            </p>
          </div>
          <div className="shrink-0 bg-white/10 rounded-2xl p-4 min-w-[140px]">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm">🇺🇸</span>
              <span className="text-white/60 text-[10px]">دولار</span>
            </div>
            <p className="text-white text-lg font-bold">
              {showBalance ? formatCurrency(member.pocket_usd, "USD") : "****"}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-4 -mt-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-4 shadow-sm border border-gray-border"
        >
          <div className="grid grid-cols-6 gap-2">
            <QuickAction
              icon={Send}
              label="تحويل"
              bgColor="bg-success/10"
              color="text-success"
              onClick={() => navigateTo("transfer")}
              index={0}
            />
            <QuickAction
              icon={Plus}
              label="إيداع"
              bgColor="bg-blue-50"
              color="text-blue-600"
              onClick={() => navigateTo("deposit")}
              index={1}
            />
            <QuickAction
              icon={ArrowDownToLine}
              label="سحب"
              bgColor="bg-orange-50"
              color="text-orange-600"
              onClick={() => navigateTo("withdraw")}
              index={2}
            />
            <QuickAction
              icon={CreditCard}
              label="دفع"
              bgColor="bg-purple-50"
              color="text-purple-600"
              onClick={() => navigateTo("services")}
              index={3}
            />
            <QuickAction
              icon={QrCode}
              label="مسح QR"
              bgColor="bg-amber-50"
              color="text-amber-600"
              onClick={() => navigateTo("qrscanner")}
              index={4}
            />
            <QuickAction
              icon={ArrowLeftRight}
              label="صرف"
              bgColor="bg-teal-50"
              color="text-teal-600"
              onClick={() => navigateTo("exchange")}
              index={5}
            />
          </div>
        </motion.div>
      </div>

      {/* Recent Transfers */}
      <div className="px-4 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-charcoal">آخر العمليات</h3>
          <button
            onClick={() => navigateTo("wallet")}
            className="flex items-center gap-1 text-xs text-text-secondary hover:text-charcoal"
          >
            عرض الكل
            <ChevronLeft size={14} />
          </button>
        </div>
        <div className="space-y-2">
          {transfers.length > 0 ? (
            transfers.slice(0, 5).map((t) => (
              <TransferItem
                key={t.id}
                id={t.id}
                amount={t.amount}
                currency={t.currency}
                summary={t.summary}
                transferType={t.transfer_type}
                state={t.state}
                executedAt={t.executed_at}
                isSender={t.sender_id === member.id}
              />
            ))
          ) : (
            <EmptyState
              title="لا توجد عمليات"
              description="ستظهر آخر عملياتك هنا"
            />
          )}
        </div>
      </div>
    </div>
  );
}


