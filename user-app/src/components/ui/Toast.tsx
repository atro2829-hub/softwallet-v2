"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/lib/store";
import { CheckCircle, XCircle } from "lucide-react";

export default function Toast() {
  const { toastMessage, hideToast } = useAppStore();

  return (
    <AnimatePresence>
      {toastMessage && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-16 left-4 right-4 z-[100] max-w-lg mx-auto"
        >
          <div className="bg-charcoal text-white rounded-2xl px-4 py-3 flex items-center gap-3 shadow-lg">
            <CheckCircle size={18} className="text-success shrink-0" />
            <p className="text-sm flex-1">{toastMessage}</p>
            <button onClick={hideToast}>
              <XCircle size={16} className="text-white/60" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
