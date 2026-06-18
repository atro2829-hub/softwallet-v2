"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useAppStore } from "@/lib/store";
import { supabase } from "@/lib/supabase";
import AmountInput from "@/components/ui/AmountInput";
import { Upload, Landmark, CheckCircle, Camera } from "lucide-react";

export default function DepositPage() {
  const { member, navigateTo, showToast } = useAppStore();
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("YER");
  const [method, setMethod] = useState("");
  const [proofImage, setProofImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!member) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProofImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!amount || !method) return;
    setLoading(true);
    setError("");

    try {
      let proofUrl = null;
      if (proofImage) {
        const fileExt = proofImage.name.split(".").pop();
        const filePath = `deposits/${member.id}/${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("proofs")
          .upload(filePath, proofImage);
        if (!uploadError) {
          const { data: urlData } = supabase.storage
            .from("proofs")
            .getPublicUrl(filePath);
          proofUrl = urlData?.publicUrl;
        }
      }

      const { error: insertError } = await supabase
        .from("deposit_tickets")
        .insert({
          member_id: member.id,
          amount: parseFloat(amount),
          currency,
          method,
          proof_image: proofUrl,
          state: "pending",
        });

      if (insertError) throw insertError;

      showToast("تم تقديم طلب الإيداع بنجاح");
      navigateTo("home");
    } catch (err: any) {
      setError(err?.message || "فشل تقديم الطلب");
    } finally {
      setLoading(false);
    }
  };

  const methods = [
    { value: "bank_transfer", label: "تحويل بنكي", icon: Landmark },
    { value: "cash_deposit", label: "إيداع نقدي", icon: Upload },
    { value: "mobile_transfer", label: "تحويل موبايل", icon: Camera },
  ];

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
        <AmountInput value={amount} onChange={setAmount} currency={currency} label="المبلغ" />
      </div>

      {/* Method */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-text-secondary mb-2 px-1">
          طريقة الإيداع
        </label>
        <div className="space-y-2">
          {methods.map((m) => {
            const Icon = m.icon;
            return (
              <button
                key={m.value}
                onClick={() => setMethod(m.value)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl border transition-colors ${
                  method === m.value
                    ? "bg-charcoal/5 border-charcoal/30"
                    : "bg-white border-gray-border"
                }`}
              >
                <div className="w-10 h-10 bg-gray-bg rounded-xl flex items-center justify-center">
                  <Icon size={18} className="text-charcoal" />
                </div>
                <span className="text-sm font-medium text-charcoal">{m.label}</span>
                <div className="mr-auto">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      method === m.value ? "border-charcoal bg-charcoal" : "border-gray-border"
                    }`}
                  >
                    {method === m.value && <CheckCircle size={12} className="text-white" />}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Proof Upload */}
      <div className="mb-6">
        <label className="block text-xs font-medium text-text-secondary mb-2 px-1">
          إثبات الدفع (اختياري)
        </label>
        {preview ? (
          <div className="relative rounded-2xl overflow-hidden border border-gray-border">
            <img src={preview} alt="معاينة" className="w-full h-40 object-cover" />
            <button
              onClick={() => {
                setProofImage(null);
                setPreview(null);
              }}
              className="absolute top-2 right-2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center"
            >
              <span className="text-white text-xs">✕</span>
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center py-8 bg-gray-bg rounded-2xl border border-dashed border-gray-border cursor-pointer hover:border-charcoal/30 transition-colors">
            <Upload size={24} className="text-text-secondary mb-2" />
            <span className="text-xs text-text-secondary">اضغط لرفع صورة الإثبات</span>
            <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          </label>
        )}
      </div>

      {error && (
        <p className="text-xs text-error bg-error/5 rounded-xl px-4 py-3 mb-4">{error}</p>
      )}

      <button
        onClick={handleSubmit}
        disabled={!amount || !method || loading}
        className="w-full bg-charcoal text-white rounded-2xl py-4 text-sm font-bold hover:bg-charcoal-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {loading ? (
          <div className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            جاري التقديم...
          </div>
        ) : (
          "تقديم طلب الإيداع"
        )}
      </button>
    </div>
  );
}
