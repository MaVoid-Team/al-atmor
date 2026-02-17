"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { useRouter } from "@/i18n/navigation"
import { useTranslations } from "next-intl"
import { useOrders } from "@/hooks/useOrders"
import { useAuth } from "@/context/AuthContext"
import { OrderDetails } from "@/components/orders/OrderDetails"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Package } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

export default function UserOrderDetailsPage() {
    const t = useTranslations("Orders")
    const router = useRouter()
    const params = useParams()
    const { user } = useAuth()
    const orderId = parseInt(params.id as string)
    const { getOrderById, isLoading } = useOrders()

    const [order, setOrder] = useState<any>(null)

    useEffect(() => {
        if (user) {
            fetchOrder()
        }
    }, [orderId, user])

    const fetchOrder = async () => {
        const data = await getOrderById(orderId)
        if (data) {
            setOrder(data)
        }
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
            {/* Back Button */}
            <Button variant="ghost" onClick={() => router.push("/orders")} className="mb-6">
                <ArrowLeft className="h-4 w-4 me-2" />
                {t("backToOrders")}
            </Button>

            {/* Order Details */}
            {isLoading ? (
                <div className="space-y-4">
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-64 w-full" />
                </div>
            ) : order ? (
                <OrderDetails order={order} isAdmin={false} />
            ) : (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <p className="text-muted-foreground">{t("orderNotFound")}</p>
                        <Button onClick={() => router.push("/orders")} className="mt-4">
                            {t("backToOrders")}
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
