"use client";

import { useAppStore, PageName } from "@/lib/store";
import { Home, Grid3x3, Wallet, User } from "lucide-react";

const navItems: { page: PageName; label: string; icon: typeof Home }[] = [
  { page: "home", label: "الرئيسية", icon: Home },
  { page: "services", label: "الخدمات", icon: Grid3x3 },
  { page: "wallet", label: "المحفظة", icon: Wallet },
  { page: "account", label: "حسابي", icon: User },
];

export default function BottomNav() {
  const { currentPage, navigateTo } = useAppStore();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-border safe-bottom z-50">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = currentPage === item.page;
          const Icon = item.icon;
          return (
            <button
              key={item.page}
              onClick={() => navigateTo(item.page)}
              className={`flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-xl transition-all ${
                isActive
                  ? "text-charcoal"
                  : "text-text-secondary hover:text-charcoal-medium"
              }`}
            >
              <Icon
                size={22}
                strokeWidth={isActive ? 2.5 : 1.8}
              />
              <span className={`text-[10px] font-medium ${isActive ? "font-bold" : ""}`}>
                {item.label}
              </span>
              {isActive && (
                <div className="absolute -top-px w-8 h-0.5 bg-charcoal rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
