"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "@/i18n/navigation"
import { useTranslations, useLocale } from "next-intl"
import { useOrders, Order } from "@/hooks/useOrders"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Search, Eye, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useDebounce } from "@/hooks/useDebounce"

export default function AdminOrdersPage() {
    const t = useTranslations("AdminOrders")
    const locale = useLocale()
    const isRtl = locale === "ar"
    const router = useRouter()
    const { getAllOrders, isLoading } = useOrders()

    const [orders, setOrders] = useState<Order[]>([])
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [refreshKey, setRefreshKey] = useState(0)
    const limit = 10

    // Debounce search query value
    const debouncedSearch = useDebounce(searchQuery, 500)

    const handleSearchChange = (value: string) => {
        setSearchQuery(value)
    }

    const handleStatusChange = (value: string) => {
        setStatusFilter(value)
        setPage(1) // Reset to first page on filter change
    }

    const handleRefresh = useCallback(() => {
        setRefreshKey(prev => prev + 1)
    }, [])

    // Reset to first page when search changes
    useEffect(() => {
        setPage(1)
    }, [debouncedSearch])

    useEffect(() => {
        fetchOrders()
    }, [page, debouncedSearch, statusFilter, refreshKey])

    const fetchOrders = async () => {
        const response = await getAllOrders(page, limit, {
            search: debouncedSearch || undefined,
            status: statusFilter !== "all" ? statusFilter : undefined,
        })
        if (response) {
            setOrders(response.data)
            setTotalPages(response.meta.totalPages)
        }
    }

    const statusColors: Record<string, string> = {
        pending: "bg-muted text-muted-foreground",
        processing: "bg-primary/10 text-primary",
        completed: "bg-secondary/10 text-secondary-foreground",
        canceled: "bg-destructive/10 text-destructive",
    }

    const paymentStatusColors: Record<string, string> = {
        unpaid: "bg-destructive/10 text-destructive",
        paid: "bg-secondary/10 text-secondary-foreground",
        refunded: "bg-muted text-muted-foreground",
    }

    return (
        <div className="flex-1 space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                <div>
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">{t("title")}</h2>
                    <p className="text-xs sm:text-sm text-muted-foreground">{t("description")}</p>
                </div>
                <Button onClick={handleRefresh} variant="outline" className="w-full sm:w-auto" disabled={isLoading}>
                    <RefreshCw className={`h-4 w-4 me-2 ${isLoading ? 'animate-spin' : ''}`} />
                    {t("refresh")}
                </Button>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle>{t("filters")}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder={t("searchPlaceholder")}
                                value={searchQuery}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={handleStatusChange}>
                            <SelectTrigger className="w-full sm:w-[180px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{t("allStatuses")}</SelectItem>
                                <SelectItem value="pending">{t("status.pending")}</SelectItem>
                                <SelectItem value="processing">{t("status.processing")}</SelectItem>
                                <SelectItem value="completed">{t("status.completed")}</SelectItem>
                                <SelectItem value="canceled">{t("status.canceled")}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Orders Table */}
            <Card>
                <CardContent className="p-0 overflow-x-auto">
                    {isLoading ? (
                        <div className="p-6 space-y-4">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="flex items-center gap-4">
                                    <Skeleton className="h-12 w-full" />
                                </div>
                            ))}
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <p className="text-muted-foreground">{t("noOrders")}</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className={isRtl ? "text-right" : "text-left"}>{t("orderNumber")}</TableHead>
                                    <TableHead className={isRtl ? "text-right" : "text-left"}>{t("customer")}</TableHead>
                                    <TableHead className={isRtl ? "text-right" : "text-left"}>{t("date")}</TableHead>
                                    <TableHead className={isRtl ? "text-right" : "text-left"}>{t("statusLabel")}</TableHead>
                                    <TableHead className={isRtl ? "text-right" : "text-left"}>{t("paymentLabel")}</TableHead>
                                    <TableHead className={isRtl ? "text-right" : "text-left"}>{t("total")}</TableHead>
                                    <TableHead className="text-end">{t("actions")}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {orders.map((order) => (
                                    <TableRow key={order.id}>
                                        <TableCell className={`font-medium ${isRtl ? "text-right" : "text-left"}`}>#{order.id}</TableCell>
                                        <TableCell className={isRtl ? "text-right" : "text-left"}>
                                            <div>
                                                <p className="text-sm text-muted-foreground">{order.user?.email || t("guest")}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell className={isRtl ? "text-right" : "text-left"}>
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className={isRtl ? "text-right" : "text-left"}>
                                            <Badge className={statusColors[order.status] || "bg-muted text-muted-foreground"}>
                                                {t(`status.${order.status}`)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className={isRtl ? "text-right" : "text-left"}>
                                            <Badge className={paymentStatusColors[order.paymentStatus] || "bg-muted text-muted-foreground"}>
                                                {t(`paymentStatus.${order.paymentStatus}`)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className={`font-semibold ${isRtl ? "text-right" : "text-left"}`}>
                                            {parseFloat(order.total).toLocaleString()} {t("currency")}
                                        </TableCell>
                                        <TableCell className="text-end">
                                            <div className="flex justify-end">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => router.push(`/admin/orders/${order.id}`)}
                                                >
                                                    <Eye className="h-4 w-4 me-2" />
                                                    {t("view")}
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-muted-foreground">
                        {t("page")} {page} {t("of")} {totalPages}
                    </p>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page === 1}
                        >
                            <ChevronLeft className="h-4 w-4 me-2" />
                            {t("previous")}
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                        >
                            {t("next")}
                            <ChevronRight className="h-4 w-4 ms-2" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}
