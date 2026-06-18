"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/lib/store";
import { createTransfer } from "@/lib/auth";
import AmountInput from "@/components/ui/AmountInput";
import { Send, CheckCircle, ArrowRight } from "lucide-react";

export default function TransferPage() {
  const { member, navigateTo, showToast } = useAppStore();
  const [step, setStep] = useState<"form" | "confirm">("form");
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("YER");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!member) return null;

  const currencies = [
    { code: "YER", name: "ريال يمني", flag: "🇾🇪", balance: member.pocket_yer },
    { code: "SAR", name: "ريال سعودي", flag: "🇸🇦", balance: member.pocket_sar },
    { code: "USD", name: "دولار", flag: "🇺🇸", balance: member.pocket_usd },
  ];

  const selectedCurrency = currencies.find((c) => c.code === currency)!;

  const handleTransfer = async () => {
    setLoading(true);
    setError("");
    try {
      await createTransfer(
        member.id,
        recipient,
        parseFloat(amount),
        currency,
        summary || "تحويل نقدي"
      );
      showToast("تم التحويل بنجاح!");
      navigateTo("home");
    } catch (err: any) {
      setError(err?.message || "فشل التحويل");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pb-20">
      <AnimatePresence mode="wait">
        {step === "form" ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="px-4 pt-2"
          >
            {/* Recipient */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-text-secondary mb-2 px-1">
                المستلم (معرف الحساب أو رقم الهاتف)
              </label>
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="@username أو 777123456"
                className="w-full bg-gray-bg rounded-2xl px-4 py-4 text-sm text-charcoal placeholder:text-charcoal/30 outline-none border border-gray-border focus:border-charcoal/30 transition-colors"
              />
            </div>

            {/* Currency Selector */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-text-secondary mb-2 px-1">
                العملة
              </label>
              <div className="flex gap-2">
                {currencies.map((c) => (
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
                max={selectedCurrency.balance}
              />
              <p className="text-[10px] text-text-secondary mt-1 px-1">
                الرصيد المتاح: {selectedCurrency.flag}{" "}
                {selectedCurrency.balance.toLocaleString("ar-YE")}
              </p>
            </div>

            {/* Summary */}
            <div className="mb-6">
              <label className="block text-xs font-medium text-text-secondary mb-2 px-1">
                ملاحظة (اختياري)
              </label>
              <input
                type="text"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="أضف ملاحظة للتحويل"
                className="w-full bg-gray-bg rounded-2xl px-4 py-4 text-sm text-charcoal placeholder:text-charcoal/30 outline-none border border-gray-border focus:border-charcoal/30 transition-colors"
              />
            </div>

            {error && (
              <p className="text-xs text-error bg-error/5 rounded-xl px-4 py-3 mb-4">
                {error}
              </p>
            )}

            <button
              onClick={() => {
                if (!recipient || !amount) return;
                setStep("confirm");
              }}
              disabled={!recipient || !amount}
              className="w-full bg-charcoal text-white rounded-2xl py-4 text-sm font-bold hover:bg-charcoal-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              متابعة التحويل
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="confirm"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="px-4 pt-2"
          >
            {/* Confirmation */}
            <div className="bg-white rounded-2xl border border-gray-border p-6 mb-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Send size={28} className="text-success" />
                </div>
                <h3 className="text-lg font-bold text-charcoal">تأكيد التحويل</h3>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-gray-border">
                  <span className="text-xs text-text-secondary">المستلم</span>
                  <span className="text-sm font-medium text-charcoal">{recipient}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-border">
                  <span className="text-xs text-text-secondary">المبلغ</span>
                  <span className="text-lg font-bold text-charcoal">
                    {parseFloat(amount).toLocaleString("ar-YE")} {currency}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-border">
                  <span className="text-xs text-text-secondary">العملة</span>
                  <span className="text-sm text-text-primary">
                    {selectedCurrency.flag} {selectedCurrency.name}
                  </span>
                </div>
                {summary && (
                  <div className="flex justify-between items-center py-3">
                    <span className="text-xs text-text-secondary">ملاحظة</span>
                    <span className="text-sm text-charcoal">{summary}</span>
                  </div>
                )}
              </div>
            </div>

            {error && (
              <p className="text-xs text-error bg-error/5 rounded-xl px-4 py-3 mb-4">
                {error}
              </p>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setStep("form")}
                className="flex-1 bg-gray-bg text-charcoal rounded-2xl py-4 text-sm font-bold hover:bg-gray-200/60 transition-colors"
              >
                تعديل
              </button>
              <button
                onClick={handleTransfer}
                disabled={loading}
                className="flex-1 bg-charcoal text-white rounded-2xl py-4 text-sm font-bold hover:bg-charcoal-medium transition-colors disabled:opacity-40"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    جاري التحويل...
                  </div>
                ) : (
                  "تأكيد"
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
