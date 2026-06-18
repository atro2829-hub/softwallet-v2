"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useAppStore, PageName } from "@/lib/store";
import AppBar from "@/components/ui/AppBar";
import BottomNav from "@/components/ui/BottomNav";
import Toast from "@/components/ui/Toast";
import PageHeader from "@/components/ui/PageHeader";
import SplashPage from "@/components/pages/SplashPage";
import LoginPage from "@/components/pages/LoginPage";
import HomePage from "@/components/pages/HomePage";
import ServicesPage from "@/components/pages/ServicesPage";
import WalletPage from "@/components/pages/WalletPage";
import TransferPage from "@/components/pages/TransferPage";
import DepositPage from "@/components/pages/DepositPage";
import WithdrawPage from "@/components/pages/WithdrawPage";
import ExchangePage from "@/components/pages/ExchangePage";
import QRScannerPage from "@/components/pages/QRScannerPage";
import NotificationsPage from "@/components/pages/NotificationsPage";
import SettingsPage from "@/components/pages/SettingsPage";
import SupportPage from "@/components/pages/SupportPage";
import AccountPage from "@/components/pages/AccountPage";

const mainPages: PageName[] = ["home", "services", "wallet", "account"];

const pageTitles: Record<string, string> = {
  transfer: "تحويل أموال",
  deposit: "إيداع",
  withdraw: "سحب",
  exchange: "صرف العملات",
  qrscanner: "مسح QR",
  notifications: "الإشعارات",
  settings: "الإعدادات",
  support: "الدعم الفني",
};

function getPageComponent(page: PageName) {
  switch (page) {
    case "splash":
      return <SplashPage />;
    case "login":
    case "signup":
      return <LoginPage />;
    case "home":
      return <HomePage />;
    case "services":
      return <ServicesPage />;
    case "wallet":
      return <WalletPage />;
    case "transfer":
      return <TransferPage />;
    case "deposit":
      return <DepositPage />;
    case "withdraw":
      return <WithdrawPage />;
    case "exchange":
      return <ExchangePage />;
    case "qrscanner":
      return <QRScannerPage />;
    case "notifications":
      return <NotificationsPage />;
    case "settings":
      return <SettingsPage />;
    case "support":
      return <SupportPage />;
    case "account":
      return <AccountPage />;
    default:
      return <HomePage />;
  }
}

export default function AppPage() {
  const { currentPage, isAuthenticated } = useAppStore();

  const showAppBar = currentPage !== "splash" && currentPage !== "login" && currentPage !== "signup";
  const showBottomNav = mainPages.includes(currentPage);
  const showPageHeader = !mainPages.includes(currentPage) && currentPage !== "splash" && currentPage !== "login" && currentPage !== "signup";

  return (
    <div className="min-h-screen bg-gray-bg max-w-lg mx-auto relative">
      <Toast />

      {showAppBar && <AppBar />}

      {showPageHeader && (
        <PageHeader
          title={pageTitles[currentPage] || ""}
          showBack={true}
        />
      )}

      <main className={showBottomNav ? "pb-20" : ""}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {getPageComponent(currentPage)}
          </motion.div>
        </AnimatePresence>
      </main>

      {showBottomNav && <BottomNav />}
    </div>
  );
}
