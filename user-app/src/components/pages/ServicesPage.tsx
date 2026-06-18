"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useAppStore } from "@/lib/store";
import PageHeader from "@/components/ui/PageHeader";
import {
  Phone,
  Wifi,
  Zap,
  ShoppingBag,
  Gamepad2,
  Gift,
  Plane,
  Heart,
  QrCode,
  ChevronLeft,
} from "lucide-react";

interface ServiceCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
}

interface ServiceProvider {
  id: string;
  name: string;
  category: string;
}

const categories: ServiceCategory[] = [
  { id: "recharge", name: "شحن رصيد", icon: <Phone size={22} />, color: "bg-blue-50 text-blue-600" },
  { id: "internet", name: "إنترنت", icon: <Wifi size={22} />, color: "bg-purple-50 text-purple-600" },
  { id: "electricity", name: "كهرباء", icon: <Zap size={22} />, color: "bg-yellow-50 text-yellow-600" },
  { id: "shopping", name: "تسوق", icon: <ShoppingBag size={22} />, color: "bg-pink-50 text-pink-600" },
  { id: "gaming", name: "ألعاب", icon: <Gamepad2 size={22} />, color: "bg-green-50 text-green-600" },
  { id: "gifts", name: "قسائم", icon: <Gift size={22} />, color: "bg-red-50 text-red-600" },
  { id: "travel", name: "سفر", icon: <Plane size={22} />, color: "bg-teal-50 text-teal-600" },
  { id: "charity", name: "تبرعات", icon: <Heart size={22} />, color: "bg-rose-50 text-rose-600" },
];

const providers: Record<string, ServiceProvider[]> = {
  recharge: [
    { id: "mt", name: "أمنيات", category: "recharge" },
    { id: "ys", name: "يمن سات", category: "recharge" },
    { id: "saba", name: "سبأفون", category: "recharge" },
  ],
  internet: [
    { id: "mt-net", name: "أمنيات إنترنت", category: "internet" },
    { id: "ys-net", name: "يمن سات إنترنت", category: "internet" },
  ],
  electricity: [
    { id: "public", name: "كهرباء عامة", category: "electricity" },
  ],
  shopping: [
    { id: "amazon", name: "أمازون", category: "shopping" },
  ],
  gaming: [
    { id: "pubg", name: "PUBG", category: "gaming" },
    { id: "freefire", name: "Free Fire", category: "gaming" },
  ],
};

export default function ServicesPage() {
  const { navigateTo, showToast } = useAppStore();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [recipientNumber, setRecipientNumber] = useState("");
  const [loading, setLoading] = useState(false);

  const currentProviders = selectedCategory ? providers[selectedCategory] || [] : [];

  const handleOrder = async () => {
    if (!selectedCategory || !selectedProvider || !amount) return;
    setLoading(true);
    try {
      showToast("تم تقديم الطلب بنجاح - قيد المعالجة");
      setSelectedCategory(null);
      setSelectedProvider(null);
      setAmount("");
      setRecipientNumber("");
    } catch {
      showToast("فشل تقديم الطلب");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pb-20">
      {/* Categories Grid */}
      {!selectedCategory && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="px-4 pt-2"
        >
          <h2 className="text-sm font-bold text-charcoal mb-4">الخدمات المتاحة</h2>
          <div className="grid grid-cols-4 gap-3">
            {categories.map((cat, i) => (
              <motion.button
                key={cat.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(cat.id)}
                className="flex flex-col items-center gap-2"
              >
                <div className={`w-14 h-14 rounded-2xl ${cat.color} flex items-center justify-center`}>
                  {cat.icon}
                </div>
                <span className="text-[10px] font-medium text-text-secondary">{cat.name}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Providers List */}
      {selectedCategory && !selectedProvider && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="px-4 pt-2"
        >
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => setSelectedCategory(null)}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-bg"
            >
              <ChevronLeft size={18} className="text-charcoal" />
            </button>
            <h2 className="text-sm font-bold text-charcoal">
              {categories.find((c) => c.id === selectedCategory)?.name}
            </h2>
          </div>

          <div className="space-y-2">
            {currentProviders.length > 0 ? (
              currentProviders.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedProvider(p.id)}
                  className="w-full flex items-center gap-3 px-4 py-4 bg-white rounded-2xl border border-gray-border hover:bg-gray-50 transition-colors"
                >
                  <div className="w-10 h-10 bg-gray-bg rounded-xl flex items-center justify-center">
                    <span className="text-sm font-bold text-charcoal">
                      {p.name.charAt(0)}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-charcoal">{p.name}</span>
                  <ChevronLeft size={16} className="text-text-secondary mr-auto" />
                </button>
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-sm text-text-secondary">لا توجد خدمات متاحة حالياً</p>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Order Form */}
      {selectedCategory && selectedProvider && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="px-4 pt-2"
        >
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => setSelectedProvider(null)}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-bg"
            >
              <ChevronLeft size={18} className="text-charcoal" />
            </button>
            <h2 className="text-sm font-bold text-charcoal">
              {currentProviders.find((p) => p.id === selectedProvider)?.name}
            </h2>
          </div>

          <div className="bg-white rounded-2xl border border-gray-border p-5 mb-4">
            <div className="mb-4">
              <label className="block text-xs font-medium text-text-secondary mb-2">
                رقم المستفيد
              </label>
              <input
                type="tel"
                value={recipientNumber}
                onChange={(e) => setRecipientNumber(e.target.value)}
                placeholder="7XXXXXXXX"
                dir="ltr"
                className="w-full bg-gray-bg rounded-2xl px-4 py-4 text-sm text-charcoal placeholder:text-charcoal/30 outline-none border border-gray-border focus:border-charcoal/30 transition-colors text-left"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-text-secondary mb-2">
                المبلغ
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="w-full bg-gray-bg rounded-2xl px-4 py-4 text-2xl font-bold text-charcoal placeholder:text-charcoal/20 outline-none border border-gray-border focus:border-charcoal/30 transition-colors text-center"
              />
            </div>
          </div>

          <button
            onClick={handleOrder}
            disabled={!amount || !recipientNumber || loading}
            className="w-full bg-charcoal text-white rounded-2xl py-4 text-sm font-bold hover:bg-charcoal-medium transition-colors disabled:opacity-40"
          >
            {loading ? "جاري التقديم..." : "تأكيد الطلب"}
          </button>
        </motion.div>
      )}
    </div>
  );
}
