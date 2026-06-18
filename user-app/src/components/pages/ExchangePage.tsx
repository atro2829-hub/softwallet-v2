"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useAppStore } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";
import AmountInput from "@/components/ui/AmountInput";
import { ArrowLeftRight, TrendingUp, RefreshCw } from "lucide-react";

interface Rate {
  source: string;
  target: string;
  rate: number;
}

export default function ExchangePage() {
  const { member, navigateTo, showToast } = useAppStore();
  const [fromCurrency, setFromCurrency] = useState("YER");
  const [toCurrency, setToCurrency] = useState("SAR");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Demo rates
  const rates: Record<string, Record<string, number>> = {
    YER: { SAR: 0.0078, USD: 0.004 },
    SAR: { YER: 128.5, USD: 0.267 },
    USD: { YER: 250, SAR: 3.75 },
  };

  if (!member) return null;

  const rate = rates[fromCurrency]?.[toCurrency] || 0;
  const convertedAmount = amount ? (parseFloat(amount) * rate).toFixed(2) : "0";

  const currencies = [
    { code: "YER", name: "ريال يمني", flag: "🇾🇪" },
    { code: "SAR", name: "ريال سعودي", flag: "🇸🇦" },
    { code: "USD", name: "دولار أمريكي", flag: "🇺🇸" },
  ];

  const swapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    setAmount("");
  };

  const handleExchange = async () => {
    if (!amount || parseFloat(amount) <= 0) return;
    setLoading(true);
    setError("");

    try {
      showToast("تم تقديم طلب الصرف بنجاح - قيد المراجعة");
      navigateTo("home");
    } catch (err: any) {
      setError(err?.message || "فشل طلب الصرف");
    } finally {
      setLoading(false);
    }
  };

  const fromInfo = currencies.find((c) => c.code === fromCurrency)!;
  const toInfo = currencies.find((c) => c.code === toCurrency)!;

  return (
    <div className="pb-20 px-4 pt-2">
      {/* Rate Display */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-charcoal rounded-2xl p-5 mb-6"
      >
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp size={16} className="text-white/60" />
          <span className="text-white/60 text-[10px]">سعر الصرف الحالي</span>
        </div>
        <div className="flex items-center justify-center gap-4">
          <span className="text-white/80 text-sm">{fromInfo.flag} 1 {fromCurrency}</span>
          <span className="text-white font-bold text-lg">=</span>
          <span className="text-white text-sm font-bold">
            {rate.toFixed(4)} {toInfo.flag} {toCurrency}
          </span>
        </div>
      </motion.div>

      {/* From */}
      <div className="bg-white rounded-2xl border border-gray-border p-4 mb-2">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-text-secondary">من</span>
          <div className="flex gap-1.5">
            {currencies.map((c) => (
              <button
                key={c.code}
                onClick={() => setFromCurrency(c.code)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-medium transition-colors ${
                  fromCurrency === c.code
                    ? "bg-charcoal text-white"
                    : "bg-gray-bg text-text-secondary"
                }`}
              >
                {c.flag} {c.code}
              </button>
            ))}
          </div>
        </div>
        <AmountInput value={amount} onChange={setAmount} placeholder="0" />
      </div>

      {/* Swap Button */}
      <div className="flex justify-center my-2">
        <motion.button
          whileTap={{ rotate: 180 }}
          onClick={swapCurrencies}
          className="w-10 h-10 bg-white border border-gray-border rounded-full flex items-center justify-center shadow-sm"
        >
          <ArrowLeftRight size={18} className="text-charcoal" />
        </motion.button>
      </div>

      {/* To */}
      <div className="bg-white rounded-2xl border border-gray-border p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-text-secondary">إلى</span>
          <div className="flex gap-1.5">
            {currencies.map((c) => (
              <button
                key={c.code}
                onClick={() => setToCurrency(c.code)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-medium transition-colors ${
                  toCurrency === c.code
                    ? "bg-charcoal text-white"
                    : "bg-gray-bg text-text-secondary"
                }`}
              >
                {c.flag} {c.code}
              </button>
            ))}
          </div>
        </div>
        <div className="bg-gray-bg rounded-2xl p-4 border border-gray-border">
          <p className="text-3xl font-bold text-charcoal text-center">
            {convertedAmount} <span className="text-sm text-text-secondary">{toCurrency}</span>
          </p>
        </div>
      </div>

      {error && (
        <p className="text-xs text-error bg-error/5 rounded-xl px-4 py-3 mb-4">{error}</p>
      )}

      <button
        onClick={handleExchange}
        disabled={!amount || parseFloat(amount) <= 0 || loading}
        className="w-full bg-charcoal text-white rounded-2xl py-4 text-sm font-bold hover:bg-charcoal-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {loading ? (
          <div className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            جاري الصرف...
          </div>
        ) : (
          "تأكيد الصرف"
        )}
      </button>
    </div>
  );
}
