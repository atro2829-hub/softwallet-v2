"use client";

import { formatCurrency, formatDate } from "@/lib/utils";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";

interface TransferItemProps {
  id: string;
  amount: number;
  currency: string;
  summary: string | null;
  transferType: string;
  state: string;
  executedAt: string;
  isSender: boolean;
  onClick?: () => void;
}

export default function TransferItem({
  amount,
  currency,
  summary,
  transferType,
  state,
  executedAt,
  isSender,
  onClick,
}: TransferItemProps) {
  const isPending = state === "pending";
  const isFailed = state === "failed";

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3 bg-white rounded-2xl hover:bg-gray-50 transition-colors"
    >
      <div
        className={`w-11 h-11 rounded-xl flex items-center justify-center ${
          isSender ? "bg-error/10" : "bg-success/10"
        }`}
      >
        {isSender ? (
          <ArrowUpRight size={20} className="text-error" />
        ) : (
          <ArrowDownLeft size={20} className="text-success" />
        )}
      </div>
      <div className="flex-1 text-right">
        <p className="text-sm font-medium text-charcoal truncate">
          {summary || (isSender ? "تحويل صادر" : "تحويل وارد")}
        </p>
        <p className="text-[11px] text-text-secondary mt-0.5">
          {formatDate(executedAt)}
        </p>
      </div>
      <div className="text-left">
        <p
          className={`text-sm font-bold ${
            isPending
              ? "text-warning"
              : isFailed
              ? "text-error"
              : isSender
              ? "text-error"
              : "text-success"
          }`}
        >
          {isSender ? "-" : "+"}
          {formatCurrency(amount, currency)}
        </p>
      </div>
    </button>
  );
}
