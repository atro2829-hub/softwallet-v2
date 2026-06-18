"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAppStore } from "@/lib/store";
import { getAlerts, markAlertSeen } from "@/lib/auth";
import { formatDate } from "@/lib/utils";
import EmptyState from "@/components/ui/EmptyState";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import {
  Bell,
  Check,
  CheckCheck,
  AlertTriangle,
  Info,
  Gift,
  Wallet,
} from "lucide-react";

export default function NotificationsPage() {
  const { member, alerts, setAlerts, showToast } = useAppStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (member) {
      setLoading(true);
      getAlerts(member.id, 50)
        .then(setAlerts)
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [member]);

  const handleMarkAllRead = async () => {
    if (!member) return;
    const unread = alerts.filter((a) => !a.is_seen);
    await Promise.all(unread.map((a) => markAlertSeen(a.id)));
    setAlerts(alerts.map((a) => ({ ...a, is_seen: true })));
    showToast("تم تحديد الكل كمقروء");
  };

  const getAlertIcon = (kind: string) => {
    switch (kind) {
      case "transfer":
        return <Wallet size={16} />;
      case "promo":
        return <Gift size={16} />;
      case "warning":
        return <AlertTriangle size={16} />;
      default:
        return <Info size={16} />;
    }
  };

  const getAlertColor = (kind: string) => {
    switch (kind) {
      case "transfer":
        return "bg-blue-50 text-blue-600";
      case "promo":
        return "bg-amber-50 text-amber-600";
      case "warning":
        return "bg-red-50 text-red-600";
      default:
        return "bg-gray-bg text-charcoal";
    }
  };

  if (!member) return null;

  return (
    <div className="pb-20 px-4 pt-2">
      {/* Header Actions */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-charcoal">الإشعارات</h2>
        {alerts.some((a) => !a.is_seen) && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-1.5 text-xs text-text-secondary hover:text-charcoal"
          >
            <CheckCheck size={14} />
            تحديد الكل كمقروء
          </button>
        )}
      </div>

      {loading ? (
        <LoadingSpinner label="جاري تحميل الإشعارات..." />
      ) : alerts.length > 0 ? (
        <div className="space-y-2 max-h-[75vh] overflow-y-auto">
          {alerts.map((alert, i) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className={`p-4 rounded-2xl border transition-colors ${
                alert.is_seen
                  ? "bg-white border-gray-border"
                  : "bg-charcoal/[0.03] border-charcoal/10"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${getAlertColor(
                    alert.alert_kind
                  )}`}
                >
                  {getAlertIcon(alert.alert_kind)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-sm font-medium text-charcoal truncate">
                      {alert.heading}
                    </h4>
                    {!alert.is_seen && (
                      <div className="w-2 h-2 bg-charcoal rounded-full shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-text-secondary mt-1 line-clamp-2">
                    {alert.content}
                  </p>
                  <p className="text-[10px] text-text-secondary/60 mt-2">
                    {formatDate(alert.dispatched_at)}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="لا توجد إشعارات"
          description="ستصل إشعاراتك هنا"
        />
      )}
    </div>
  );
}
