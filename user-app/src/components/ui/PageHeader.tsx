"use client";

import { useAppStore } from "@/lib/store";
import { PageName } from "@/lib/store";
import { ArrowRight } from "lucide-react";

interface PageHeaderProps {
  title: string;
  showBack?: boolean;
  backTo?: PageName;
  rightAction?: React.ReactNode;
}

export default function PageHeader({ title, showBack = false, backTo, rightAction }: PageHeaderProps) {
  const { goBack, navigateTo } = useAppStore();

  const handleBack = () => {
    if (backTo) navigateTo(backTo);
    else goBack();
  };

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white">
      <div className="flex items-center gap-3">
        {showBack && (
          <button
            onClick={handleBack}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-bg hover:bg-gray-200/60 transition-colors"
          >
            <ArrowRight size={18} className="text-charcoal" />
          </button>
        )}
        <h1 className="text-lg font-bold text-charcoal">{title}</h1>
      </div>
      {rightAction && <div>{rightAction}</div>}
    </div>
  );
}
