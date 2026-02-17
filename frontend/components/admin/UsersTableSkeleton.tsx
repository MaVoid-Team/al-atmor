"use client"

import { useLocale } from "next-intl"
import { Skeleton } from "@/components/ui/skeleton"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

interface UsersTableSkeletonProps {
    rows?: number
}

export default function UsersTableSkeleton({ rows = 10 }: UsersTableSkeletonProps) {
    const locale = useLocale()
    const isRtl = locale === "ar"
    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className={isRtl ? "text-right" : "text-left"}><Skeleton className="h-4 w-8" /></TableHead>
                        <TableHead className={isRtl ? "text-right" : "text-left"}><Skeleton className="h-4 w-32" /></TableHead>
                        <TableHead className={isRtl ? "text-right" : "text-left"}><Skeleton className="h-4 w-24" /></TableHead>
                        <TableHead className={isRtl ? "text-right" : "text-left"}><Skeleton className="h-4 w-24" /></TableHead>
                        <TableHead className={isRtl ? "text-right" : "text-left"}><Skeleton className="h-4 w-16" /></TableHead>
                        <TableHead className="text-end">
                            <Skeleton className="h-4 w-16 ms-auto" />
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {Array.from({ length: rows }).map((_, i) => (
                        <TableRow key={i}>
                            <TableCell className={isRtl ? "text-right" : "text-left"}>
                                <Skeleton className="h-4 w-8" />
                            </TableCell>
                            <TableCell className={isRtl ? "text-right" : "text-left"}>
                                <Skeleton className="h-4 w-48" />
                            </TableCell>
                            <TableCell className={isRtl ? "text-right" : "text-left"}>
                                <Skeleton className="h-4 w-24" />
                            </TableCell>
                            <TableCell className={isRtl ? "text-right" : "text-left"}>
                                <Skeleton className="h-4 w-24" />
                            </TableCell>
                            <TableCell className={isRtl ? "text-right" : "text-left"}>
                                <Skeleton className="h-5 w-20 rounded-full" />
                            </TableCell>
                            <TableCell className="text-end">
                                <div className="flex justify-end gap-2">
                                    <Skeleton className="h-8 w-8 rounded-md" />
                                    <Skeleton className="h-8 w-8 rounded-md" />
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
