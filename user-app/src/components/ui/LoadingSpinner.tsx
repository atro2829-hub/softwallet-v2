"use client";

import { motion } from "framer-motion";

interface LoadingSpinnerProps {
  size?: number;
  label?: string;
}

export default function LoadingSpinner({ size = 32, label }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-8">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="w-8 h-8 border-2 border-charcoal/20 border-t-charcoal rounded-full"
        style={{ width: size, height: size }}
      />
      {label && <p className="text-sm text-text-secondary">{label}</p>}
    </div>
  );
}
