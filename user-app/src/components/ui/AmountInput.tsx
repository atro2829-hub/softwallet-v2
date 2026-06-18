"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface AmountInputProps {
  value: string;
  onChange: (value: string) => void;
  currency?: string;
  placeholder?: string;
  label?: string;
  max?: number;
}

export default function AmountInput({
  value,
  onChange,
  currency,
  placeholder = "0",
  label,
  max,
}: AmountInputProps) {
  const [showKeypad, setShowKeypad] = useState(false);

  const handleChange = (val: string) => {
    const cleaned = val.replace(/[^0-9.]/g, "");
    if (max && parseFloat(cleaned) > max) return;
    onChange(cleaned);
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-medium text-text-secondary mb-2 px-1">
          {label}
        </label>
      )}
      <div className="relative bg-gray-bg rounded-2xl p-4 border border-gray-border focus-within:border-charcoal/30 transition-colors">
        <input
          type="text"
          inputMode="decimal"
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={placeholder}
          className="w-full text-3xl font-bold text-charcoal bg-transparent outline-none placeholder:text-charcoal/20 text-center"
        />
        {currency && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-text-secondary">
            {currency}
          </span>
        )}
      </div>
    </div>
  );
}
