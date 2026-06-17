import { SuperShell } from "@/components/superadmin/SuperShell";
import { SuperStatsCards } from "@/components/superadmin/SuperStatsCards";
import { ShopsTable } from "@/components/superadmin/ShopsTable";
import { getShopsWithStats, getSuperDashboardStats } from "@/actions/shops";

export const metadata = {
  title: "Shops",
};

export default async function SuperAdminPage() {
  const [stats, shops] = await Promise.all([
    getSuperDashboardStats(),
    getShopsWithStats(),
  ]);

  return (
    <SuperShell title="Shops" description="Manage resellers, billing, and subscriptions">
      <SuperStatsCards stats={stats} />
      <ShopsTable shops={shops} />
    </SuperShell>
  );
}
