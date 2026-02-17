"use client"

import { useTranslations } from 'next-intl'
import { useAdmin } from '@/hooks/useAdmin'
import { Users, ShoppingCart, Package, DollarSign } from 'lucide-react'
import StatsCardSkeleton from '@/components/admin/StatsCardSkeleton'

export default function AdminDashboard() {
    const t = useTranslations('Admin.Dashboard')
    const tCommon = useTranslations('Common')
    const { users, isLoading, pagination, stats, isStatsLoading } = useAdmin()

    const statsCards = [
        {
            title: t('totalUsers'),
            value: pagination.totalItems.toString(),
            description: t('activeUsersDescription'),
            icon: Users,
            iconColor: 'text-primary',
        },
        {
            title: t('totalOrders'),
            value: stats?.totalOrders.toString() || '0',
            description: t('ordersThisMonth'),
            icon: ShoppingCart,
            iconColor: 'text-primary',
        },
        {
            title: t('totalProducts'),
            value: stats?.totalProducts.toString() || '0',
            description: t('productsInInventory'),
            icon: Package,
            iconColor: 'text-primary',
        },
        {
            title: t('revenue'),
            value: stats?.totalRevenue ? `${tCommon('currency')} ${stats.totalRevenue.toLocaleString()}` : `${tCommon('currency')} 0`,
            description: t('revenueThisMonth'),
            icon: DollarSign,
            iconColor: 'text-primary',
        },
    ]

    return (
        <div className="space-y-4 sm:space-y-6 md:space-y-8 bg-background">
            <div className="space-y-2">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">{t('title')}</h1>
                <p className="text-xs sm:text-sm text-muted-foreground break-words">
                    {t('description')}
                </p>
            </div>

            {isLoading || isStatsLoading ? (
                <StatsCardSkeleton count={4} columns="4" />
            ) : (
                <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                    {statsCards.map((stat) => {
                        const Icon = stat.icon
                        return (
                            <div
                                key={stat.title}
                                className="rounded-lg border bg-card p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow min-w-0"
                            >
                                <div className="flex items-center justify-between space-y-0 pb-2">
                                    <p className="text-sm font-medium text-muted-foreground">
                                        {stat.title}
                                    </p>
                                    <Icon className={`h-4 w-4 ${stat.iconColor}`} />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-lg sm:text-2xl font-bold truncate">{stat.value}</p>
                                    <p className="text-xs text-muted-foreground">{stat.description}</p>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
