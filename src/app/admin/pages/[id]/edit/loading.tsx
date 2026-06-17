import { AdminShell } from "@/components/admin/AdminShell";
import { Skeleton } from "@/components/ui/Skeleton";

export default function EditPageLoading() {
    return (
        <AdminShell title="Edit Page" description="Update this client landing page">
            <div className="max-w-2xl space-y-6">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-11 w-full rounded-lg" />
                    </div>
                ))}
                <Skeleton className="h-12 w-40 rounded-lg" />
            </div>
        </AdminShell>
    );
}
