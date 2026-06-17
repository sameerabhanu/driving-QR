import { AdminShell } from "@/components/admin/AdminShell";
import { ShopStatsCards } from "@/components/admin/ShopStatsCards";
import { PagesTable } from "@/components/admin/PagesTable";
import { ExpiringPagesPanel } from "@/components/admin/ExpiringPagesPanel";
import {
  getShopDashboardStats,
  getShopPages,
  getShopExpiringPagesByMonth,
} from "@/actions/pages";
import { getMonthKey } from "@/lib/utils";

export const metadata = {
  title: "Dashboard",
};

interface AdminDashboardPageProps {
  searchParams: Promise<{ expMonth?: string }>;
}

export default async function AdminDashboardPage({ searchParams }: AdminDashboardPageProps) {
  const { expMonth } = await searchParams;

  const now = new Date();
  const defaultMonth = getMonthKey(new Date(now.getFullYear(), now.getMonth() + 1, 1));
  const monthKey = expMonth ?? defaultMonth;

  const [stats, pages, expiringPages] = await Promise.all([
    getShopDashboardStats(),
    getShopPages(),
    getShopExpiringPagesByMonth(monthKey),
  ]);

  return (
    <AdminShell title="Dashboard" description="Manage your client landing pages">
      <ShopStatsCards stats={stats} />
      <ExpiringPagesPanel monthKey={monthKey} pages={expiringPages} />
      <PagesTable pages={pages} />
    </AdminShell>
  );
}
