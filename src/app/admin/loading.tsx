import { AdminShell } from "@/components/admin/AdminShell";
import { Skeleton } from "@/components/ui/Skeleton";

export default function AdminDashboardLoading() {
    return (
        <AdminShell title="Dashboard" description="Manage your client landing pages">
            {/* Stats cards */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-8 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="mt-3 h-8 w-16" />
                        <Skeleton className="mt-2 h-3 w-20" />
                    </div>
                ))}
            </div>

            {/* Pages table */}
            <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
                <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
                    <Skeleton className="h-4 w-32" />
                </div>
                <div className="divide-y divide-gray-200">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex items-center justify-between gap-4 px-4 py-4">
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-4 w-40" />
                                <Skeleton className="h-3 w-24" />
                            </div>
                            <Skeleton className="h-8 w-20 rounded-lg" />
                        </div>
                    ))}
                </div>
            </div>
        </AdminShell>
    );
}
