"use client"

import { useMemo } from "react"
import { useTranslations } from "next-intl"
import { AdminUser } from "@/hooks/useAdmin"
import { Users, Shield, UserCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import StatsCardSkeleton from "@/components/admin/StatsCardSkeleton"

interface UserStatsCardsProps {
    users: AdminUser[]
    isLoading?: boolean
}

export default function UserStatsCards({ users, isLoading }: UserStatsCardsProps) {
    const t = useTranslations("Admin.Users")

    // Show skeleton when loading
    if (isLoading) {
        return <StatsCardSkeleton count={3} columns="3" />
    }

    // Calculate statistics
    const stats = useMemo(() => {
        const adminCount = users.filter(user => user.role === "admin").length
        const customerCount = users.filter(user => user.role === "customer").length
        const totalCount = users.length

        return {
            total: totalCount,
            admin: adminCount,
            customer: customerCount,
        }
    }, [users])

    const statCards = [
        {
            title: t("stats.totalUsers"),
            value: stats.total.toString(),
            icon: Users,
            iconColor: "text-primary",
        },
        {
            title: t("stats.adminUsers"),
            value: stats.admin.toString(),
            icon: Shield,
            iconColor: "text-destructive",
        },
        {
            title: t("stats.customerUsers"),
            value: stats.customer.toString(),
            icon: UserCircle,
            iconColor: "text-secondary",
        },
    ]

    return (
        <div className="grid gap-4 md:grid-cols-3 mb-6">
            {statCards.map((stat) => {
                const Icon = stat.icon
                return (
                    <Card key={stat.title} className="border shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                {stat.title}
                            </CardTitle>
                            <div className="p-2 rounded-full">
                                <Icon className={`h-6 w-6 ${stat.iconColor}`} />
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

