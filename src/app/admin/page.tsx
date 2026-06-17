import { AdminShell } from "@/components/admin/AdminShell";
import { ShopStatsCards } from "@/components/admin/ShopStatsCards";
import { PagesTable } from "@/components/admin/PagesTable";
import { getShopDashboardStats, getShopPages } from "@/actions/pages";

export const metadata = {
  title: "Dashboard",
};

export default async function AdminDashboardPage() {
  const [stats, pages] = await Promise.all([
    getShopDashboardStats(),
    getShopPages(),
  ]);

  return (
    <AdminShell title="Dashboard" description="Manage your client landing pages">
      <ShopStatsCards stats={stats} />
      <PagesTable pages={pages} />
    </AdminShell>
  );
}
