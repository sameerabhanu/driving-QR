import { Spinner } from "@/components/ui/Skeleton";

export default function RootLoading() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <Spinner className="h-10 w-10" />
        </div>
    );
}
