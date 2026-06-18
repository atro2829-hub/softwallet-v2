"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useAppStore } from "@/lib/store";
import { supabase } from "@/lib/supabase";
import AmountInput from "@/components/ui/AmountInput";
import {
  ArrowDownToLine,
  Landmark,
  Wallet,
  Smartphone,
  CheckCircle,
} from "lucide-react";

export default function WithdrawPage() {
  const { member, navigateTo, showToast } = useAppStore();
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("YER");
  const [destination, setDestination] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!member) return null;

  const selectedBalance =
    currency === "YER"
      ? member.pocket_yer
      : currency === "SAR"
      ? member.pocket_sar
      : member.pocket_usd;

  const destinations = [
    { value: "bank", label: "حساب بنكي", icon: Landmark },
    { value: "mobile_wallet", label: "محفظة موبايل", icon: Smartphone },
    { value: "cash_pickup", label: "استلام نقدي", icon: Wallet },
  ];

  const handleSubmit = async () => {
    if (!amount || !destination) return;
    setLoading(true);
    setError("");

    try {
      const { error: insertError } = await supabase
        .from("cashout_tickets")
        .insert({
          member_id: member.id,
          amount: parseFloat(amount),
          currency,
          destination,
          state: "pending",
        });

      if (insertError) throw insertError;
      showToast("تم تقديم طلب السحب بنجاح");
      navigateTo("home");
    } catch (err: any) {
      setError(err?.message || "فشل تقديم الطلب");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pb-20 px-4 pt-2">
      {/* Currency */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-text-secondary mb-2 px-1">
          العملة
        </label>
        <div className="flex gap-2">
          {[
            { code: "YER", flag: "🇾🇪", name: "ريال يمني" },
            { code: "SAR", flag: "🇸🇦", name: "ريال سعودي" },
            { code: "USD", flag: "🇺🇸", name: "دولار" },
          ].map((c) => (
            <button
              key={c.code}
              onClick={() => setCurrency(c.code)}
              className={`flex-1 py-3 rounded-2xl text-xs font-medium border transition-colors flex items-center justify-center gap-1.5 ${
                currency === c.code
                  ? "bg-charcoal text-white border-charcoal"
                  : "bg-white text-text-secondary border-gray-border"
              }`}
            >
              <span>{c.flag}</span>
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Amount */}
      <div className="mb-4">
        <AmountInput
          value={amount}
          onChange={setAmount}
          currency={currency}
          label="المبلغ"
          max={selectedBalance}
        />
        <p className="text-[10px] text-text-secondary mt-1 px-1">
          الرصيد المتاح: {selectedBalance.toLocaleString("ar-YE")} {currency}
        </p>
      </div>

      {/* Destination */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-text-secondary mb-2 px-1">
          وجهة السحب
        </label>
        <div className="space-y-2">
          {destinations.map((d) => {
            const Icon = d.icon;
            return (
              <button
                key={d.value}
                onClick={() => setDestination(d.value)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl border transition-colors ${
                  destination === d.value
                    ? "bg-charcoal/5 border-charcoal/30"
                    : "bg-white border-gray-border"
                }`}
              >
                <div className="w-10 h-10 bg-gray-bg rounded-xl flex items-center justify-center">
                  <Icon size={18} className="text-charcoal" />
                </div>
                <span className="text-sm font-medium text-charcoal">{d.label}</span>
                <div className="mr-auto">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      destination === d.value
                        ? "border-charcoal bg-charcoal"
                        : "border-gray-border"
                    }`}
                  >
                    {destination === d.value && (
                      <CheckCircle size={12} className="text-white" />
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-charcoal/5 rounded-2xl p-4 mb-6">
        <div className="flex items-start gap-2">
          <div className="w-5 h-5 bg-charcoal/10 rounded-full flex items-center justify-center shrink-0 mt-0.5">
            <span className="text-[10px]">i</span>
          </div>
          <div>
            <p className="text-xs text-charcoal font-medium">ملاحظة</p>
            <p className="text-[11px] text-text-secondary mt-1">
              سيتم مراجعة طلب السحب من قبل فريق الدعم وقد يستغرق وقتاً للمعالجة
            </p>
          </div>
        </div>
      </div>

      {error && (
        <p className="text-xs text-error bg-error/5 rounded-xl px-4 py-3 mb-4">{error}</p>
      )}

      <button
        onClick={handleSubmit}
        disabled={!amount || !destination || loading}
        className="w-full bg-charcoal text-white rounded-2xl py-4 text-sm font-bold hover:bg-charcoal-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {loading ? (
          <div className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            جاري التقديم...
          </div>
        ) : (
          "تقديم طلب السحب"
        )}
      </button>
    </div>
  );
}
