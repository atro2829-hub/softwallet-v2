'use client';

import { useState } from 'react';
import { useAuthStore } from '@/lib/auth';
import { motion } from 'framer-motion';
import { Wallet } from 'lucide-react';

export function LoginPage() {
  const { login, error, isLoading } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    login(email, password);
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4" dir="rtl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-charcoal-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Wallet className="text-white" size={30} />
          </div>
          <h1 className="text-2xl font-bold text-charcoal-900">سوفت واليت</h1>
          <p className="text-sm text-charcoal-400 mt-1">لوحة الإدارة</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-charcoal-700 mb-1.5">البريد الإلكتروني</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@softwallet.app"
              required
              dir="ltr"
              className="w-full px-4 py-3 rounded-xl border border-charcoal-200 text-sm bg-white text-charcoal-900 placeholder:text-charcoal-300 focus:outline-none focus:ring-2 focus:ring-charcoal-900/10 focus:border-charcoal-400 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-charcoal-700 mb-1.5">كلمة المرور</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              dir="ltr"
              className="w-full px-4 py-3 rounded-xl border border-charcoal-200 text-sm bg-white text-charcoal-900 placeholder:text-charcoal-300 focus:outline-none focus:ring-2 focus:ring-charcoal-900/10 focus:border-charcoal-400 transition-all"
            />
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-red-600 bg-red-50 px-4 py-2.5 rounded-xl border border-red-100"
            >
              {error}
            </motion.p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-charcoal-900 text-white rounded-xl font-medium text-sm hover:bg-charcoal-800 transition-colors disabled:opacity-50 active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              'تسجيل الدخول'
            )}
          </button>
        </form>

        <p className="text-xs text-charcoal-300 text-center mt-6">
          Softwallet Admin Panel v2.0
        </p>
      </motion.div>
    </div>
  );
}