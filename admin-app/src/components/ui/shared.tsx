'use client';

import { useState, useEffect, useRef, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  const widthClass = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' }[size];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={overlayRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`bg-white rounded-2xl shadow-2xl w-full ${widthClass} max-h-[90vh] flex flex-col`}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-charcoal-100">
              <h2 className="text-lg font-bold text-charcoal-900">{title}</h2>
              <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-charcoal-50 text-charcoal-500 transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>
            <div className="overflow-y-auto p-6">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Stat Card ─────────────────────────────────────────
interface StatCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  color?: string;
  sub?: string;
}

export function StatCard({ label, value, icon, color = 'bg-charcoal-900', sub }: StatCardProps) {
  return (
    <div className="bg-white border border-charcoal-100 rounded-2xl p-5 flex items-start gap-4 hover:shadow-md transition-shadow">
      <div className={`${color} text-white w-11 h-11 rounded-xl flex items-center justify-center shrink-0`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-charcoal-400 mb-1">{label}</p>
        <p className="text-xl font-bold text-charcoal-900 truncate">{value}</p>
        {sub && <p className="text-xs text-charcoal-400 mt-1">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Badge ─────────────────────────────────────────────
type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

export function Badge({ children, variant = 'neutral' }: { children: ReactNode; variant?: BadgeVariant }) {
  const colors: Record<BadgeVariant, string> = {
    success: 'bg-green-50 text-green-700 border-green-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-red-50 text-red-700 border-red-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200',
    neutral: 'bg-charcoal-50 text-charcoal-600 border-charcoal-200',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colors[variant]}`}>
      {children}
    </span>
  );
}

// ─── Button ────────────────────────────────────────────
interface BtnProps {
  children: ReactNode;
  onClick?: (...args: any[]) => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md';
  disabled?: boolean;
  type?: 'button' | 'submit';
  className?: string;
}

export function Btn({ children, onClick, variant = 'primary', size = 'md', disabled, type = 'button', className = '' }: BtnProps) {
  const base = 'inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all focus:outline-none disabled:opacity-50 disabled:pointer-events-none';
  const variants = {
    primary: 'bg-charcoal-900 text-white hover:bg-charcoal-800 active:scale-[0.97]',
    secondary: 'bg-charcoal-50 text-charcoal-700 hover:bg-charcoal-100 active:scale-[0.97] border border-charcoal-200',
    danger: 'bg-red-600 text-white hover:bg-red-700 active:scale-[0.97]',
    ghost: 'text-charcoal-500 hover:bg-charcoal-50 hover:text-charcoal-700',
  };
  const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2.5 text-sm' };
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </button>
  );
}

// ─── Input ─────────────────────────────────────────────
interface InputProps {
  label?: string;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  placeholder?: string;
  type?: string;
  multiline?: boolean;
  rows?: number;
  options?: { label: string; value: string }[];
  error?: string;
  className?: string;
  dir?: 'rtl' | 'ltr';
}

export function Input({ label, value, onChange, placeholder, type = 'text', multiline, rows = 3, options, error, className = '', dir = 'rtl' }: InputProps) {
  const base = 'w-full px-4 py-2.5 rounded-xl border border-charcoal-200 bg-white text-charcoal-900 text-sm placeholder:text-charcoal-300 focus:outline-none focus:ring-2 focus:ring-charcoal-900/10 focus:border-charcoal-400 transition-all';
  const input = (
    <>
      {options ? (
        <select value={value} onChange={onChange} className={base} dir={dir}>
          <option value="">{placeholder || 'اختر...'}</option>
          {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      ) : multiline ? (
        <textarea value={value} onChange={onChange} placeholder={placeholder} rows={rows} className={base} dir={dir} />
      ) : (
        <input type={type} value={value} onChange={onChange} placeholder={placeholder} className={base} dir={dir} />
      )}
    </>
  );
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && <label className="block text-sm font-medium text-charcoal-700">{label}</label>}
      {input}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

// ─── Loading ───────────────────────────────────────────
export function Loading() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-2 border-charcoal-200 border-t-charcoal-900 rounded-full animate-spin" />
    </div>
  );
}

// ─── Empty State ───────────────────────────────────────
export function EmptyState({ message = 'لا توجد بيانات' }: { message?: string }) {
  return (
    <div className="text-center py-16 text-charcoal-400">
      <svg className="mx-auto mb-3 w-12 h-12 opacity-40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
      </svg>
      <p className="text-sm">{message}</p>
    </div>
  );
}

// ─── Toast ─────────────────────────────────────────────
export function useToast() {
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const show = (message: string, type: 'success' | 'error' = 'success') => setToast({ message, type });

  const ToastComponent = toast ? (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 50, opacity: 0 }}
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] px-5 py-3 rounded-xl text-white text-sm font-medium shadow-lg ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}
    >
      {toast.message}
    </motion.div>
  ) : null;

  return { show, ToastComponent };
}

// ─── SearchBar ─────────────────────────────────────────
export function SearchBar({ value, onChange, placeholder = 'بحث...' }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="relative">
      <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
      </svg>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-charcoal-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-charcoal-900/10 focus:border-charcoal-400 transition-all"
        dir="rtl"
      />
    </div>
  );
}

// ─── Page Header ───────────────────────────────────────
export function PageHeader({ title, subtitle, children }: { title: string; subtitle?: string; children?: ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold text-charcoal-900">{title}</h1>
        {subtitle && <p className="text-sm text-charcoal-400 mt-1">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  );
}

// ─── Table ─────────────────────────────────────────────
interface Col<T> {
  key: string;
  header: string;
  render?: (item: T) => ReactNode;
  width?: string;
}

export function Table<T extends { id: string }>({ columns, data, onRowClick }: { columns: Col<T>[]; data: T[]; onRowClick?: (item: T) => void }) {
  if (!data.length) return <EmptyState />;
  return (
    <div className="overflow-x-auto rounded-xl border border-charcoal-100">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-charcoal-50/80 border-b border-charcoal-100">
            {columns.map((col) => (
              <th key={col.key} className={`px-4 py-3 text-right font-medium text-charcoal-500 ${col.width || ''}`}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-charcoal-100">
          {data.map((item) => (
            <tr
              key={item.id}
              className={`hover:bg-charcoal-50/50 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
              onClick={() => onRowClick?.(item)}
            >
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-3 text-charcoal-700">
                  {col.render ? col.render(item) : String((item as Record<string, unknown>)[col.key] ?? '—')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}