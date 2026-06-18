"use client";

import { motion } from "framer-motion";
import { X, AlertCircle } from "lucide-react";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
}

export default function EmptyState({ icon, title, description }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-8 text-center"
    >
      {icon || (
        <div className="w-16 h-16 bg-gray-bg rounded-2xl flex items-center justify-center mb-4">
          <AlertCircle size={28} className="text-text-secondary" />
        </div>
      )}
      <p className="text-sm font-medium text-charcoal">{title}</p>
      {description && (
        <p className="text-xs text-text-secondary mt-1 max-w-[240px]">{description}</p>
      )}
    </motion.div>
  );
}
