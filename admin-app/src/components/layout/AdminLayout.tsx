'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/auth';
import { useSidebarStore } from '@/lib/store';
import { Sidebar, TopBar } from './Sidebar';
import { Loading } from '@/components/ui/shared';
import { LoginPage } from '@/views/login/LoginPage';
import { DashboardPage } from '@/views/dashboard/DashboardPage';
import { MembersPage } from '@/views/members/MembersPage';
import { TransfersPage } from '@/views/transfers/TransfersPage';
import { OrdersPage } from '@/views/orders/OrdersPage';
import { DepositsPage } from '@/views/deposits/DepositsPage';
import { WithdrawalsPage } from '@/views/withdrawals/WithdrawalsPage';
import { RatesPage } from '@/views/rates/RatesPage';
import { PromosPage } from '@/views/promos/PromosPage';
import { BannersPage } from '@/views/banners/BannersPage';
import { CategoriesPage } from '@/views/categories/CategoriesPage';
import { ProvidersPage } from '@/views/providers/ProvidersPage';
import { BanksPage } from '@/views/banks/BanksPage';
import { SupportPage } from '@/views/support/SupportPage';
import { NotificationsPage } from '@/views/notifications/NotificationsPage';
import { SettingsPage } from '@/views/settings/SettingsPage';
import { ActivityPage } from '@/views/activity/ActivityPage';

const pages: Record<string, React.ComponentType> = {
  dashboard: DashboardPage,
  members: MembersPage,
  transfers: TransfersPage,
  orders: OrdersPage,
  deposits: DepositsPage,
  withdrawals: WithdrawalsPage,
  rates: RatesPage,
  promos: PromosPage,
  banners: BannersPage,
  categories: CategoriesPage,
  providers: ProvidersPage,
  banks: BanksPage,
  support: SupportPage,
  notifications: NotificationsPage,
  settings: SettingsPage,
  activity: ActivityPage,
};

export function AdminLayout() {
  const { isAuthenticated, isLoading, checkSession } = useAuthStore();
  const { isCollapsed, toggle, setOpen } = useSidebarStore();
  const [activePage, setActivePage] = useState('dashboard');

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  if (isLoading) return <Loading />;

  if (!isAuthenticated) return <LoginPage />;

  const PageComponent = pages[activePage] || DashboardPage;

  return (
    <div className="min-h-screen bg-charcoal-50/50" dir="rtl">
      <Sidebar activePage={activePage} onNavigate={setActivePage} />
      <div className={`transition-all duration-300 ${isCollapsed ? 'lg:mr-[72px]' : 'lg:mr-64'}`}>
        <TopBar
          activePage={activePage}
          onMenuToggle={toggle}
        />
        <main className="p-4 sm:p-6">
          <PageComponent />
        </main>
      </div>
    </div>
  );
}