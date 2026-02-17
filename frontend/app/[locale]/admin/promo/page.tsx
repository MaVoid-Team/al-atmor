"use client"

import { useState, useCallback } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Plus } from "lucide-react"
import { PromoStatsCards } from "@/components/admin/promoCodes/PromoStatsCards"
import { PromoCodesTable } from "@/components/admin/promoCodes/PromoCodesTable"
import { CreatePromoDialog } from "@/components/admin/promoCodes/CreatePromoDialog"

export default function PromoCodesPage() {
    const t = useTranslations("Admin.PromoCodes")
    const [showCreateDialog, setShowCreateDialog] = useState(false)
    const [refreshKey, setRefreshKey] = useState(0)

    // Trigger refresh for both table and stats
    const handleRefresh = useCallback(() => {
        setRefreshKey(prev => prev + 1)
    }, [])

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">{t("title")}</h1>
                    <p className="text-xs sm:text-sm text-muted-foreground break-words">{t("description")}</p>
                </div>
                <Button onClick={() => setShowCreateDialog(true)} size="sm" className="sm:size-default whitespace-nowrap">
                    <Plus className="h-4 w-4 me-2" />
                    {t("createPromo")}
                </Button>
            </div>

            {/* Stats Cards */}
            <PromoStatsCards refreshKey={refreshKey} />

            {/* Promo Codes Table */}
            <Card>
                <CardContent className="p-6">
                    <PromoCodesTable onRefresh={handleRefresh} refreshKey={refreshKey} />
                </CardContent>
            </Card>

            {/* Create Dialog */}
            <CreatePromoDialog
                open={showCreateDialog}
                onOpenChange={setShowCreateDialog}
                onSuccess={handleRefresh}
            />
        </div>
    )
}
