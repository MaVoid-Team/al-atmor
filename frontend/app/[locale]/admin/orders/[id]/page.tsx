"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams } from "next/navigation"
import { useRouter } from "@/i18n/navigation"
import { useTranslations } from "next-intl"
import { useOrders } from "@/hooks/useOrders"
import { OrderDetails } from "@/components/orders/OrderDetails"
import { Button } from "@/components/ui/button"
import { ArrowLeft, RefreshCw } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

export default function AdminOrderDetailsPage() {
    const t = useTranslations("AdminOrders")
    const router = useRouter()
    const params = useParams()
    const orderId = parseInt(params.id as string)
    const { getAdminOrderById, updateOrder, isLoading } = useOrders()

    const [order, setOrder] = useState<any>(null)
    const [refreshKey, setRefreshKey] = useState(0)

    const fetchOrder = useCallback(async () => {
        const data = await getAdminOrderById(orderId)
        if (data) {
            setOrder(data)
        }
    }, [getAdminOrderById, orderId])

    useEffect(() => {
        fetchOrder()
    }, [orderId, refreshKey])

    const handleStatusUpdate = async (orderId: number, status: string, paymentStatus?: string) => {
        const updates: { status?: string; paymentStatus?: string } = {}

        if (status) updates.status = status
        if (paymentStatus) updates.paymentStatus = paymentStatus

        const result = await updateOrder(orderId, updates)
        if (result) {
            // Refresh order data after successful update
            setRefreshKey(prev => prev + 1)
        } else {
            throw new Error("Failed to update order")
        }
    }

    const handleRefresh = () => {
        setRefreshKey(prev => prev + 1)
    }

    return (
        <div className="flex-1 space-y-6">
            {/* Header with Back Button */}
            <div className="flex items-center justify-between">
                <Button variant="ghost" onClick={() => router.push("/admin/orders")}>
                    <ArrowLeft className="h-4 w-4 me-2" />
                    {t("backToOrders")}
                </Button>
                <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
                    <RefreshCw className={`h-4 w-4 me-2 ${isLoading ? 'animate-spin' : ''}`} />
                    {t("refresh")}
                </Button>
            </div>

            {/* Order Details */}
            {isLoading && !order ? (
                <div className="space-y-4">
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-64 w-full" />
                </div>
            ) : order ? (
                <OrderDetails
                    order={order}
                    isAdmin={true}
                    onStatusUpdate={handleStatusUpdate}
                    onOrderUpdated={handleRefresh}
                />
            ) : (
                <div className="flex flex-col items-center justify-center py-12">
                    <p className="text-muted-foreground">{t("orderNotFound")}</p>
                </div>
            )}
        </div>
    )
}
