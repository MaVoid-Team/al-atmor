"use client"

import { useEffect } from "react"
import { useTranslations } from "next-intl"
import { useLocale } from "next-intl"
import { useDiscounts } from "@/hooks/useDiscounts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TicketPercent, TrendingUp, Users } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface PromoStatsCardsProps {
    refreshKey?: number
}

export function PromoStatsCards({ refreshKey = 0 }: PromoStatsCardsProps) {
    const t = useTranslations("Admin.PromoCodes")
    const locale = useLocale()
    const isRtl = locale === "ar"
    const { discounts, isLoading, fetchDiscounts } = useDiscounts()

    // Fetch discounts on mount and when refreshKey changes
    useEffect(() => {
        fetchDiscounts(1, 100, false) // Fetch all discounts for accurate stats
    }, [fetchDiscounts, refreshKey])

    // Calculate stats
    const totalPromoCodes = discounts.length
    const activePromoCodes = discounts.filter((d) => d.active).length
    const totalUsages = discounts.reduce((sum, d) => sum + d.usedCount, 0)

    const statsCards = [
        {
            title: t("stats.totalPromoCodes"),
            value: totalPromoCodes.toString(),
            description: t("stats.totalPromoCodesDescription"),
            icon: TicketPercent,
            iconColor: "text-primary",
        },
        {
            title: t("stats.activePromoCodes"),
            value: activePromoCodes.toString(),
            description: t("stats.activePromoCodesDescription"),
            icon: TrendingUp,
            iconColor: "text-primary",
        },
        {
            title: t("stats.totalUsages"),
            value: totalUsages.toString(),
            description: t("stats.totalUsagesDescription"),
            icon: Users,
            iconColor: "text-primary",
        },
    ]

    if (isLoading) {
        return (
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
                {[1, 2, 3].map((i) => (
                    <Card key={i}>
                        <CardHeader className="pb-2">
                            <Skeleton className="h-4 w-24" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-16" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        )
    }

    return (
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
            {statsCards.map((stat) => {
                const Icon = stat.icon
                return (
                    <Card key={stat.title} className="hover:shadow-md transition-shadow min-w-0">
                        <CardHeader className={`flex flex-row items-center justify-between pb-2 space-y-0 ${isRtl ? 'flex-row-reverse' : ''}`}>
                            <CardTitle className={`text-sm font-medium text-muted-foreground ${isRtl ? 'text-right' : ''}`}>
                                {stat.title}
                            </CardTitle>
                            <Icon className={`h-4 w-4 ${stat.iconColor}`} />
                        </CardHeader>
                        <CardContent className={isRtl ? 'text-right' : ''}>
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                        </CardContent>
                    </Card>
                )
            })}
        </div>
    )
}
