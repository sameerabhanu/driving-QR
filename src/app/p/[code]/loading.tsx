import { Spinner } from "@/components/ui/Skeleton";

export default function PublicPageLoading() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50">
            <Spinner className="h-10 w-10" />
            <p className="text-sm text-gray-500">Loading…</p>
        </div>
    );
}
