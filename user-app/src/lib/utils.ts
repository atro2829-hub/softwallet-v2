export function formatCurrency(amount: number, currency: string): string {
  const formatted = new Intl.NumberFormat("ar-YE", {
    minimumFractionDigits: 0,
    maximumFractionDigits: currency === "YER" ? 0 : 2,
  }).format(amount);

  const symbols: Record<string, string> = {
    YER: "ر.ي",
    SAR: "ر.س",
    USD: "$",
  };

  return `${formatted} ${symbols[currency] || currency}`;
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "الآن";
  if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
  if (diffHours < 24) return `منذ ${diffHours} ساعة`;
  if (diffDays < 7) return `منذ ${diffDays} يوم`;

  return date.toLocaleDateString("ar-YE", {
    year: "numeric",
    member: "2-digit",
    day: "2-digit",
  });
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "صباح الخير";
  if (hour < 17) return "مساء الخير";
  return "مساء الخير";
}

export function currencyFlag(currency: string): string {
  const flags: Record<string, string> = {
    YER: "🇾🇪",
    SAR: "🇸🇦",
    USD: "🇺🇸",
  };
  return flags[currency] || "💰";
}

export function getCurrencyName(currency: string): string {
  const names: Record<string, string> = {
    YER: "ريال يمني",
    SAR: "ريال سعودي",
    USD: "دولار أمريكي",
  };
  return names[currency] || currency;
}
