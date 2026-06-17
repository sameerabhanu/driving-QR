import { AdminShell } from "@/components/admin/AdminShell";
import { ExpiringPagesPanel } from "@/components/admin/ExpiringPagesPanel";
import { getShopExpiringPagesByMonth } from "@/actions/pages";
import { getMonthKey } from "@/lib/utils";

export const metadata = {
    title: "Expiring Pages",
};

interface ExpiringPageProps {
    searchParams: Promise<{ expMonth?: string }>;
}

export default async function ExpiringPagesRoute({ searchParams }: ExpiringPageProps) {
    const { expMonth } = await searchParams;

    const now = new Date();
    const defaultMonth = getMonthKey(new Date(now.getFullYear(), now.getMonth() + 1, 1));
    const monthKey = expMonth ?? defaultMonth;

    const expiringPages = await getShopExpiringPagesByMonth(monthKey);

    return (
        <AdminShell
            title="Expiring Pages"
            description="Track and renew pages by their expiry month"
        >
            <ExpiringPagesPanel monthKey={monthKey} pages={expiringPages} />
        </AdminShell>
    );
}
