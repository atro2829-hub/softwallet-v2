"use client";

import { useAppStore } from "@/lib/store";
import { Bell, ChevronRight } from "lucide-react";

export default function AppBar() {
  const { member, navigateTo, unreadCount } = useAppStore();

  return (
    <header className="sticky top-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-b border-gray-border safe-top z-40">
      <div className="flex items-center justify-between px-4 py-3 max-w-lg mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-charcoal rounded-xl flex items-center justify-center">
            <span className="text-white text-sm font-bold">سوفت</span>
          </div>
          <div>
            <h1 className="text-sm font-bold text-charcoal">سوفت واليت</h1>
            {member && (
              <p className="text-[10px] text-text-secondary">
                {member.display_name || member.email || "مرحباً"}
              </p>
            )}
          </div>
        </div>
        <button
          onClick={() => navigateTo("notifications")}
          className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-gray-bg hover:bg-gray-200/60 transition-colors"
        >
          <Bell size={20} className="text-charcoal" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -left-1 w-5 h-5 bg-error rounded-full flex items-center justify-center">
              <span className="text-[9px] text-white font-bold">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
