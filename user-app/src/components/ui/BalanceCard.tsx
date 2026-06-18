"use client";

import { motion } from "framer-motion";
import { formatCurrency } from "@/lib/utils";

interface BalanceCardProps {
  currency: string;
  amount: number;
  label: string;
  flag: string;
  dark?: boolean;
  index?: number;
}

export default function BalanceCard({ currency, amount, label, flag, dark = false, index = 0 }: BalanceCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`rounded-2xl p-5 ${
        dark
          ? "bg-charcoal text-white"
          : "bg-white border border-gray-border text-charcoal"
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{flag}</span>
          <span className={`text-xs font-medium ${dark ? "text-white/60" : "text-text-secondary"}`}>
            {label}
          </span>
        </div>
        <span className={`text-[10px] px-2 py-1 rounded-lg ${
          dark ? "bg-white/10 text-white/80" : "bg-gray-bg text-text-secondary"
        }`}>
          {currency}
        </span>
      </div>
      <p className={`text-2xl font-bold ${dark ? "text-white" : "text-charcoal"}`}>
        {formatCurrency(amount, currency)}
      </p>
    </motion.div>
  );
}
