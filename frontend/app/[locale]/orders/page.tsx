"use client"

import { useState, useEffect } from "react"
import { useRouter } from "@/i18n/navigation"
import { useTranslations } from "next-intl"
import { useOrders } from "@/hooks/useOrders"
import { useAuth } from "@/context/AuthContext"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Package, Eye, ShoppingBag, ChevronLeft, ChevronRight } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useLocale } from "next-intl"

export default function OrdersPage() {
    const t = useTranslations("Orders")
    const locale = useLocale()
    const router = useRouter()
    const { user } = useAuth()
    const { getUserOrders, isLoading } = useOrders()
    const isRtl = locale === "ar"
    const [orders, setOrders] = useState<any[]>([])
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const limit = 10

    useEffect(() => {
        if (user) {
            fetchOrders()
        }
    }, [page, user])

    const fetchOrders = async () => {
        const response = await getUserOrders(page, limit)
        if (response) {
            setOrders(response.data)
            setTotalPages(response.meta.totalPages)
        }
    }

    const statusColors: Record<string, string> = {
        pending: "bg-muted text-muted-foreground",
        processing: "bg-primary/10 text-primary",
        shipped: "bg-accent/20 text-accent-foreground",
        delivered: "bg-secondary/10 text-secondary-foreground",
        canceled: "bg-destructive/10 text-destructive",
    }

    if (!user) {
        return (
            <div className="container mx-auto px-4 py-16">
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <Package className="h-16 w-16 text-muted-foreground mb-4" />
                        <h2 className="text-xl sm:text-2xl font-bold mb-2">{t("loginRequired")}</h2>
                        <p className="text-muted-foreground mb-6">{t("loginRequiredDescription")}</p>
                        <Button onClick={() => router.push("/auth/login")}>
                            {t("login")}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-3">
                    <ShoppingBag className="h-8 w-8" />
                    {t("title")}
                </h1>
                <p className="text-muted-foreground mt-2">{t("description")}</p>
            </div>

            {/* Orders Table */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>{t("yourOrders")}</CardTitle>
                        <Button onClick={fetchOrders} variant="outline" size="sm">
                            {t("refresh")}
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="p-6 space-y-4">
                            {[...Array(5)].map((_, i) => (
                                <Skeleton key={i} className="h-16 w-full" />
                            ))}
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <Package className="h-16 w-16 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-2">{t("noOrders")}</h3>
                            <p className="text-muted-foreground mb-6">{t("noOrdersDescription")}</p>
                            <Button onClick={() => router.push("/products")}>
                                {t("startShopping")}
                            </Button>
                        </div>
                    ) : (
                        <>
                            {/* Desktop Table */}
                            <div className="hidden md:block">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className={isRtl ? "text-right" : "text-left"}>{t("orderNumber")}</TableHead>
                                            <TableHead className={isRtl ? "text-right" : "text-left"}>{t("date")}</TableHead>
                                            <TableHead className={isRtl ? "text-right" : "text-left"}>{t("statusLabel")}</TableHead>
                                            <TableHead className={isRtl ? "text-right" : "text-left"}>{t("items")}</TableHead>
                                            <TableHead className={isRtl ? "text-right" : "text-left"}>{t("total")}</TableHead>
                                            <TableHead className="text-end">{t("actions")}</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {orders.map((order) => (
                                            <TableRow key={order.id}>
                                                <TableCell className={`font-medium ${isRtl ? "text-right" : "text-left"}`}>#{order.id}</TableCell>
                                                <TableCell className={isRtl ? "text-right" : "text-left"}>
                                                    {new Date(order.createdAt).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell className={isRtl ? "text-right" : "text-left"}>
                                                    <Badge className={statusColors[order.status] || "bg-muted text-muted-foreground"}>
                                                        {t(`status.${order.status}`)}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className={isRtl ? "text-right" : "text-left"}>{order.items?.length || 0}</TableCell>
                                                <TableCell className={`font-semibold ${isRtl ? "text-right" : "text-left"}`}>
                                                    {order.total.toLocaleString()} {t("currency")}
                                                </TableCell>
                                                <TableCell className="text-end">
                                                    <div className="flex justify-end">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => router.push(`/orders/${order.id}`)}
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
                            </div>

                            {/* Mobile Cards */}
                            <div className="md:hidden p-4 space-y-4">
                                {orders.map((order) => (
                                    <Card key={order.id} className="overflow-hidden">
                                        <CardContent className="p-4">
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <p className="font-semibold">#{order.id}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {new Date(order.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <Badge className={statusColors[order.status] || "bg-muted text-muted-foreground"}>
                                                    {t(`status.${order.status}`)}
                                                </Badge>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <p className="text-sm text-muted-foreground">{order.items?.length || 0} {t("items")}</p>
                                                    <p className="font-semibold">{order.total.toLocaleString()} {t("currency")}</p>
                                                </div>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => router.push(`/orders/${order.id}`)}
                                                >
                                                    <Eye className="h-4 w-4 me-2" />
                                                    {t("view")}
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
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
