import { AdminLayout } from "@/components/admin/AdminLayout";
import { StatsCards } from "@/components/admin/StatsCards";
import { SchoolsTable } from "@/components/admin/SchoolsTable";
import { getDashboardStats, getAllSchools } from "@/actions/schools";

export const metadata = {
  title: "Dashboard",
};

export default async function AdminDashboardPage() {
  const [stats, schools] = await Promise.all([
    getDashboardStats(),
    getAllSchools(),
  ]);

  return (
    <AdminLayout
      title="Dashboard"
      description="Overview of all driving school landing pages"
    >
      <StatsCards stats={stats} />
      <SchoolsTable schools={schools} />
    </AdminLayout>
  );
}
