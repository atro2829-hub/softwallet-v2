"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAppStore } from "@/lib/store";
import { getTransfers } from "@/lib/auth";
import { formatCurrency, getCurrencyName } from "@/lib/utils";
import TransferItem from "@/components/ui/TransferItem";
import EmptyState from "@/components/ui/EmptyState";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { Filter, ArrowDownLeft, ArrowUpRight, Clock } from "lucide-react";

type FilterType = "all" | "sent" | "received";

export default function WalletPage() {
  const { member, transfers, setTransfers } = useAppStore();
  const [filter, setFilter] = useState<FilterType>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (member) {
      setLoading(true);
      getTransfers(member.id, 50)
        .then(setTransfers)
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [member]);

  if (!member) return null;

  const filteredTransfers = transfers.filter((t) => {
    if (filter === "sent") return t.sender_id === member.id;
    if (filter === "received") return t.receiver_id === member.id;
    return true;
  });

  const totalSent = transfers
    .filter((t) => t.sender_id === member.id)
    .reduce((sum, t) => sum + t.amount, 0);
  const totalReceived = transfers
    .filter((t) => t.receiver_id === member.id)
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="pb-20">
      {/* Balance Cards */}
      <div className="px-4 pt-2 pb-4">
        <div className="bg-charcoal rounded-2xl p-5 mb-3">
          <p className="text-white/50 text-[10px] mb-2">رصيدك الحالي</p>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <span className="text-lg">🇾🇪</span>
              <p className="text-white text-lg font-bold mt-1">
                {formatCurrency(member.pocket_yer, "YER")}
              </p>
              <p className="text-white/40 text-[9px]">ريال يمني</p>
            </div>
            <div className="text-center border-r border-l border-white/10">
              <span className="text-lg">🇸🇦</span>
              <p className="text-white text-lg font-bold mt-1">
                {formatCurrency(member.pocket_sar, "SAR")}
              </p>
              <p className="text-white/40 text-[9px]">ريال سعودي</p>
            </div>
            <div className="text-center">
              <span className="text-lg">🇺🇸</span>
              <p className="text-white text-lg font-bold mt-1">
                {formatCurrency(member.pocket_usd, "USD")}
              </p>
              <p className="text-white/40 text-[9px]">دولار</p>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl p-4 border border-gray-border">
            <div className="flex items-center gap-2 mb-2">
              <ArrowUpRight size={14} className="text-error" />
              <span className="text-[10px] text-text-secondary">إجمالي المرسل</span>
            </div>
            <p className="text-sm font-bold text-error">
              {formatCurrency(totalSent, "YER")}
            </p>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-gray-border">
            <div className="flex items-center gap-2 mb-2">
              <ArrowDownLeft size={14} className="text-success" />
              <span className="text-[10px] text-text-secondary">إجمالي المستلم</span>
            </div>
            <p className="text-sm font-bold text-success">
              {formatCurrency(totalReceived, "YER")}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="px-4 mb-3">
        <div className="flex gap-2 bg-white rounded-2xl p-1.5 border border-gray-border">
          {[
            { key: "all" as FilterType, label: "الكل" },
            { key: "sent" as FilterType, label: "مرسل" },
            { key: "received" as FilterType, label: "مستلم" },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`flex-1 py-2 rounded-xl text-xs font-medium transition-colors ${
                filter === f.key
                  ? "bg-charcoal text-white"
                  : "text-text-secondary hover:bg-gray-bg"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Transfer List */}
      <div className="px-4">
        {loading ? (
          <LoadingSpinner label="جاري تحميل العمليات..." />
        ) : filteredTransfers.length > 0 ? (
          <div className="space-y-2 max-h-[60vh] overflow-y-auto">
            {filteredTransfers.map((t) => (
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
            ))}
          </div>
        ) : (
          <EmptyState
            title="لا توجد عمليات"
            description={filter === "all" ? "لم تقم بأي عملية بعد" : `لا توجد عمليات ${filter === "sent" ? "مرسلة" : "مستلمة"}`}
          />
        )}
      </div>
    </div>
  );
}
