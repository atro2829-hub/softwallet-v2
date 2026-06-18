"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useAppStore } from "@/lib/store";
import { signIn, signUp } from "@/lib/auth";
import { Mail, Lock, User, Eye, EyeOff, ArrowLeft } from "lucide-react";

export default function LoginPage() {
  const { navigateTo, showToast, setIsLoading } = useAppStore();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setIsLoading(true);

    try {
      if (isLogin) {
        const data = await signIn(email, password);
        if (data.user) {
          const { getCurrentUser } = await import("@/lib/auth");
          const member = await getCurrentUser();
          if (member) {
            useAppStore.getState().setMember(member);
          }
          navigateTo("home");
          showToast("مرحباً بك!");
        }
      } else {
        if (!displayName.trim()) {
          setError("الرجاء إدخال الاسم");
          setLoading(false);
          setIsLoading(false);
          return;
        }
        await signUp(email, password, displayName);
        showToast("تم إنشاء الحساب بنجاح! يرجى تسجيل الدخول");
        setIsLogin(true);
      }
    } catch (err: any) {
      const msg = err?.message || "حدث خطأ غير متوقع";
      if (msg.includes("Invalid login")) {
        setError("البريد أو كلمة المرور غير صحيحة");
      } else if (msg.includes("already registered")) {
        setError("هذا البريد مسجل مسبقاً");
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      className="min-h-screen bg-white flex flex-col"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="safe-top px-4 pt-6 pb-2">
        <div className="w-14 h-14 bg-charcoal rounded-2xl flex items-center justify-center mb-6">
          <span className="text-white text-lg font-bold">سوفت</span>
        </div>
        <h1 className="text-2xl font-bold text-charcoal">
          {isLogin ? "تسجيل الدخول" : "إنشاء حساب جديد"}
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          {isLogin
            ? "أدخل بياناتك للوصول إلى حسابك"
            : "أنشئ حسابك وابدأ استخدام سوفت واليت"}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex-1 px-4 pt-6">
        <div className="space-y-4">
          {!isLogin && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <label className="block text-xs font-medium text-text-secondary mb-2 px-1">
                الاسم الكامل
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="أدخل اسمك الكامل"
                  className="w-full bg-gray-bg rounded-2xl pr-12 pl-4 py-4 text-sm text-charcoal placeholder:text-charcoal/30 outline-none border border-gray-border focus:border-charcoal/30 transition-colors"
                />
                <User size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary" />
              </div>
            </motion.div>
          )}

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-2 px-1">
              البريد الإلكتروني
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                dir="ltr"
                className="w-full bg-gray-bg rounded-2xl pr-12 pl-4 py-4 text-sm text-charcoal placeholder:text-charcoal/30 outline-none border border-gray-border focus:border-charcoal/30 transition-colors text-left"
              />
              <Mail size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-2 px-1">
              كلمة المرور
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="أدخل كلمة المرور"
                dir="ltr"
                className="w-full bg-gray-bg rounded-2xl pr-12 pl-12 py-4 text-sm text-charcoal placeholder:text-charcoal/30 outline-none border border-gray-border focus:border-charcoal/30 transition-colors text-left"
              />
              <Lock size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-error bg-error/5 rounded-xl px-4 py-3"
            >
              {error}
            </motion.p>
          )}

          <button
            type="submit"
            disabled={loading || !email || !password}
            className="w-full bg-charcoal text-white rounded-2xl py-4 text-sm font-bold hover:bg-charcoal-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed mt-4"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>جاري التحقق...</span>
              </div>
            ) : isLogin ? (
              "تسجيل الدخول"
            ) : (
              "إنشاء الحساب"
            )}
          </button>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-text-secondary">
            {isLogin ? "ليس لديك حساب؟" : "لديك حساب بالفعل؟"}{" "}
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError("");
              }}
              className="text-charcoal font-bold hover:underline"
            >
              {isLogin ? "إنشاء حساب" : "تسجيل الدخول"}
            </button>
          </p>
        </div>
      </form>

      <div className="px-4 pb-8 pt-4">
        <p className="text-center text-[10px] text-text-secondary">
          بالتسجيل أنت توافق على شروط الاستخدام وسياسة الخصوصية
        </p>
      </div>
    </motion.div>
  );
}
