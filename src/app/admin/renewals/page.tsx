import { AdminLayout } from "@/components/admin/AdminLayout";
import { RenewalsClient } from "@/components/admin/RenewalsClient";
import { getSchoolsExpiringInMonth } from "@/actions/schools";

export const metadata = {
  title: "Renewals",
};

interface RenewalsPageProps {
  searchParams: Promise<{ month?: string }>;
}

export default async function RenewalsPage({ searchParams }: RenewalsPageProps) {
  const params = await searchParams;
  const selectedMonth = params.month ? parseInt(params.month, 10) : new Date().getMonth();

  const validMonth = selectedMonth >= 0 && selectedMonth <= 11 ? selectedMonth : new Date().getMonth();
  const schools = await getSchoolsExpiringInMonth(validMonth);

  return (
    <AdminLayout
      title="Renewals"
      description="Track schools expiring each month"
    >
      <RenewalsClient schools={schools} selectedMonth={validMonth} />
    </AdminLayout>
  );
}
