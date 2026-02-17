"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, DollarSign, ShoppingCart, Clock } from "lucide-react"
import { useTranslations } from "next-intl"
import { Skeleton } from "@/components/ui/skeleton"

interface StatsGridProps {
    totalOrders: number
    totalRevenue: number
    averageOrderValue: number
    pendingOrders: number
    isLoading?: boolean
}

export function StatsGrid({
    totalOrders,
    totalRevenue,
    averageOrderValue,
    pendingOrders,
    isLoading = false,
}: StatsGridProps) {
    const t = useTranslations("AdminAnalytics")

    const stats = [
        {
            title: t("totalOrders"),
            value: totalOrders.toLocaleString(),
            icon: ShoppingCart,
            color: "text-primary",
            bgColor: "bg-primary/10",
        },
        {
            title: t("totalRevenue"),
            value: `${totalRevenue.toLocaleString()} ${t("currency")}`,
            icon: DollarSign,
            color: "text-secondary",
            bgColor: "bg-secondary/10",
        },
        {
            title: t("averageOrderValue"),
            value: `${averageOrderValue.toLocaleString()} ${t("currency")}`,
            icon: Package,
            color: "text-muted-foreground",
            bgColor: "bg-accent/10",
        },
        {
            title: t("pendingOrders"),
            value: pendingOrders.toLocaleString(),
            icon: Clock,
            color: "text-accent-foreground",
            bgColor: "bg-accent/20",
        },
    ]

    if (isLoading) {
        return (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                    <Card key={i}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-4 rounded" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-32" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        )
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => {
                const Icon = stat.icon
                return (
                    <Card key={stat.title} className="hover:shadow-lg transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {stat.title}
                            </CardTitle>
                            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                                <Icon className={`h-4 w-4 ${stat.color}`} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                        </CardContent>
                    </Card>
                )
            })}
        </div>
    )
}
