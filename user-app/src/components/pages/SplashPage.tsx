"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/lib/store";
import { getCurrentUser, onAuthStateChange } from "@/lib/auth";

export default function SplashPage() {
  const { navigateTo, setMember, setIsLoading } = useAppStore();

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        const member = await getCurrentUser();
        if (member) {
          setMember(member);
          navigateTo("home");
        } else {
          navigateTo("login");
        }
      } catch {
        navigateTo("login");
      }
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    onAuthStateChange((member) => {
      if (member) {
        setMember(member);
      }
    });
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        className="min-h-screen bg-white flex flex-col items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-24 h-24 bg-charcoal rounded-[28px] flex items-center justify-center shadow-lg shadow-charcoal/20">
            <span className="text-white text-2xl font-bold">سوفت</span>
          </div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-2xl font-bold text-charcoal"
          >
            سوفت واليت
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-sm text-text-secondary"
          >
            محفظتك الرقمية الذكية
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="absolute bottom-16"
        >
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.3 }}
                className="w-2 h-2 bg-charcoal rounded-full"
              />
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
