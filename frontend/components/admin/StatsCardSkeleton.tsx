import { Skeleton } from "@/components/ui/skeleton"

interface StatsCardSkeletonProps {
    count?: number
    columns?: "3" | "4"
}

export default function StatsCardSkeleton({ count = 3, columns = "3" }: StatsCardSkeletonProps) {
    const gridCols = columns === "3" ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"

    return (
        <div className={`grid gap-3 sm:gap-4 ${gridCols}`}>
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="rounded-lg border bg-card p-4 sm:p-6 shadow-sm min-w-0">
                    <div className="flex items-center justify-between space-y-0 pb-2">
                        <Skeleton className="h-4 w-[100px]" />
                        <Skeleton className="h-4 w-4 rounded-full" />
                    </div>
                    <div className="space-y-1">
                        <Skeleton className="h-8 w-[60px]" />
                        <Skeleton className="h-3 w-[120px]" />
                    </div>
                </div>
            ))}
        </div>
    )
}
