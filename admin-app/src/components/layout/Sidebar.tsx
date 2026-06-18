'use client';

import { useSidebarStore } from '@/lib/store';
import { useAuthStore } from '@/lib/auth';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, ArrowLeftRight, ShoppingBag, ArrowDownToLine, ArrowUpFromLine,
  Calculator, Tag, Image, FolderTree, Building2, MessageSquare, Bell, Settings,
  History, LogOut, X, ChevronLeft, Wallet
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'لوحة التحكم', icon: <LayoutDashboard size={20} /> },
  { id: 'members', label: 'الأعضاء', icon: <Users size={20} /> },
  { id: 'transfers', label: 'التحويلات', icon: <ArrowLeftRight size={20} /> },
  { id: 'orders', label: 'طلبات الخدمات', icon: <ShoppingBag size={20} /> },
  { id: 'deposits', label: 'إيداعات معلّقة', icon: <ArrowDownToLine size={20} /> },
  { id: 'withdrawals', label: 'سحوبات معلّقة', icon: <ArrowUpFromLine size={20} /> },
  { id: 'rates', label: 'أسعار الصرف', icon: <Calculator size={20} /> },
  { id: 'promos', label: 'أكواد الخصم والهدية', icon: <Tag size={20} /> },
  { id: 'banners', label: 'البانرات', icon: <Image size={20} /> },
  { id: 'categories', label: 'تصنيفات الخدمات', icon: <FolderTree size={20} /> },
  { id: 'providers', label: 'مزودو الخدمات', icon: <Building2 size={20} /> },
  { id: 'banks', label: 'البنوك الشريكة', icon: <Wallet size={20} /> },
  { id: 'support', label: 'الدعم الفني', icon: <MessageSquare size={20} /> },
  { id: 'notifications', label: 'الإشعارات', icon: <Bell size={20} /> },
  { id: 'settings', label: 'الإعدادات', icon: <Settings size={20} /> },
  { id: 'activity', label: 'سجل النشاطات', icon: <History size={20} /> },
];

interface SidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
}

export function Sidebar({ activePage, onNavigate }: SidebarProps) {
  const { isOpen, isCollapsed, toggle, setOpen } = useSidebarStore();
  const { admin, logout } = useAuthStore();

  const handleNav = (id: string) => {
    onNavigate(id);
    setOpen(false);
  };

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-40 lg:hidden"
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 right-0 z-50 h-full bg-charcoal-900 text-white flex flex-col transition-all duration-300
          ${isCollapsed ? 'w-[72px]' : 'w-64'}
          ${isOpen ? 'translate-x-0' : 'translate-x-full'} lg:translate-x-0`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 h-16 border-b border-white/10 shrink-0">
          {!isCollapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-base font-bold truncate"
            >
              سوفت واليت
            </motion.span>
          )}
          <button onClick={toggle} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors">
            {isCollapsed ? <ChevronLeft size={18} /> : <X size={18} className="lg:hidden" />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                  ${isActive ? 'bg-white/15 text-white' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
                title={isCollapsed ? item.label : undefined}
              >
                <span className="shrink-0">{item.icon}</span>
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-white/10 p-3 space-y-1">
          {!isCollapsed && admin && (
            <div className="px-3 py-2 mb-2">
              <p className="text-sm font-medium text-white truncate">{admin.display_name}</p>
              <p className="text-xs text-white/40 truncate">{admin.email}</p>
            </div>
          )}
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut size={20} />
            {!isCollapsed && <span>تسجيل الخروج</span>}
          </button>
        </div>
      </aside>
    </>
  );
}

export function TopBar({ activePage, onMenuToggle }: { activePage: string; onMenuToggle: () => void }) {
  const { admin } = useAuthStore();
  const current = navItems.find(n => n.id === activePage);

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-charcoal-100 px-4 sm:px-6 h-16 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button onClick={onMenuToggle} className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl hover:bg-charcoal-50 transition-colors">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-charcoal-700">
            <path d="M3 12h18M3 6h18M3 18h18"/>
          </svg>
        </button>
        <h2 className="text-lg font-bold text-charcoal-900">{current?.label || ''}</h2>
      </div>
      {admin && (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-charcoal-900 text-white flex items-center justify-center text-sm font-bold">
            {admin.display_name.charAt(0)}
          </div>
        </div>
      )}
    </header>
  );
}