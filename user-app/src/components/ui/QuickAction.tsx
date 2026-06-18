"use client";

import { motion } from "framer-motion";
import { LucideIcon, ArrowLeft } from "lucide-react";

interface QuickActionProps {
  icon: LucideIcon;
  label: string;
  color?: string;
  bgColor?: string;
  onClick: () => void;
  index?: number;
}

export default function QuickAction({
  icon: Icon,
  label,
  color = "text-charcoal",
  bgColor = "bg-gray-bg",
  onClick,
  index = 0,
}: QuickActionProps) {
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.1 + index * 0.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="flex flex-col items-center gap-2"
    >
      <div className={`w-14 h-14 rounded-2xl ${bgColor} flex items-center justify-center`}>
        <Icon size={22} className={color} />
      </div>
      <span className="text-[11px] font-medium text-text-secondary">{label}</span>
    </motion.button>
  );
}
