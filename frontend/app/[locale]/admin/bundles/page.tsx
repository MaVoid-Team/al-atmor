"use client"

import { useState, useEffect, useCallback } from "react"
import { useTranslations } from "next-intl"
import { useBundles, BundlesFilters } from "@/hooks/useBundles"
import { useRouter } from "@/i18n/navigation"
import { BundleCard } from "@/components/admin/BundleCard"
import StatsCardSkeleton from "@/components/admin/StatsCardSkeleton"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Search, RefreshCw } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { useDebounce } from "@/hooks/useDebounce"

export default function AdminBundlesPage() {
    const t = useTranslations("Admin.Bundles")
    const router = useRouter()
    const { bundles, isLoading, deleteBundle, pagination, fetchBundles, hasNextPage, hasPreviousPage, itemsPerPage } = useBundles()

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [bundleToDelete, setBundleToDelete] = useState<number | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    // Search and filter state
    const [searchQuery, setSearchQuery] = useState("")
    const [activeOnly, setActiveOnly] = useState(false)
    const [page, setPage] = useState(1)
    const [refreshKey, setRefreshKey] = useState(0)

    // Debounce search query
    const debouncedSearch = useDebounce(searchQuery, 500)

    // Reset to first page when search changes
    useEffect(() => {
        setPage(1)
    }, [debouncedSearch, activeOnly])

    // Fetch bundles when filters change
    useEffect(() => {
        const filters: BundlesFilters = {
            search: debouncedSearch || undefined,
            activeOnly: activeOnly || undefined,
        }
        fetchBundles(page, itemsPerPage, filters)
    }, [page, debouncedSearch, activeOnly, refreshKey, fetchBundles, itemsPerPage])

    const handleSearchChange = (value: string) => {
        setSearchQuery(value)
    }

    const handleRefresh = useCallback(() => {
        setRefreshKey(prev => prev + 1)
    }, [])

    const goToPage = (newPage: number) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            setPage(newPage)
        }
    }

    const handleDeleteClick = (bundleId: number) => {
        setBundleToDelete(bundleId)
        setDeleteDialogOpen(true)
    }

    const handleConfirmDelete = async () => {
        if (!bundleToDelete) return

        setIsDeleting(true)
        try {
            const success = await deleteBundle(bundleToDelete)
            if (success) {
                toast.success(t("deleteSuccess"))
                setDeleteDialogOpen(false)
                setBundleToDelete(null)
                handleRefresh()
            } else {
                toast.error(t("deleteFailed"))
            }
        } catch (error) {
            toast.error(t("deleteFailed"))
        } finally {
            setIsDeleting(false)
        }
    }

    const handleCreateBundle = () => {
        router.push("/admin/bundles/create")
    }

    if (isLoading && bundles.length === 0) {
        return (
            <div className="space-y-4 sm:space-y-6 md:space-y-8 bg-background">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                    <div>
                        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">{t("title")}</h1>
                        <p className="text-xs sm:text-sm text-muted-foreground">{t("pageDescription")}</p>
                    </div>
                    <Button disabled className="w-full sm:w-auto">
                        <Plus className="h-4 w-4 me-2" />
                        <span className="truncate">{t("createBundle")}</span>
                    </Button>
                </div>
                <StatsCardSkeleton count={3} columns="3" />
            </div>
        )
    }

    return (
        <div className="space-y-4 sm:space-y-6 md:space-y-8 bg-background">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">{t("title")}</h1>
                    <p className="text-xs sm:text-sm text-muted-foreground">{t("pageDescription")}</p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={handleRefresh} variant="outline" disabled={isLoading}>
                        <RefreshCw className={`h-4 w-4 me-2 ${isLoading ? 'animate-spin' : ''}`} />
                        {t("refresh")}
                    </Button>
                    <Button onClick={handleCreateBundle} className="w-full sm:w-auto">
                        <Plus className="h-4 w-4 me-2" />
                        <span className="truncate">{t("createBundle")}</span>
                    </Button>
                </div>
            </div>

            {/* Search and Filters */}
            <Card>
                <CardHeader>
                    <CardTitle>{t("filters")}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute start-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder={t("searchPlaceholder")}
                                value={searchQuery}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                className="ps-9"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Switch
                                id="activeOnly"
                                checked={activeOnly}
                                onCheckedChange={setActiveOnly}
                            />
                            <Label htmlFor="activeOnly">{t("activeOnly")}</Label>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Bundles Grid */}
            {bundles.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-muted-foreground mb-4">{t("noBundles")}</p>
                    <Button onClick={handleCreateBundle}>
                        <Plus className="h-4 w-4 me-2" />
                        {t("createFirstBundle")}
                    </Button>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                        {bundles.map((bundle) => (
                            <BundleCard
                                key={bundle.id}
                                bundle={bundle}
                                onDelete={handleDeleteClick}
                            />
                        ))}
                    </div>

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                        <div className="mt-8">
                            <div className="mb-4 text-sm text-muted-foreground text-center">
                                {t("showingResults", {
                                    from: (pagination.page - 1) * itemsPerPage + 1,
                                    to: Math.min(pagination.page * itemsPerPage, pagination.total),
                                    total: pagination.total,
                                })}
                            </div>

                            <Pagination>
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious
                                            onClick={() => goToPage(pagination.page - 1)}
                                            className={!hasPreviousPage ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                        >
                                            {t('previous')}
                                        </PaginationPrevious>
                                    </PaginationItem>

                                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => {
                                        const isFirstPage = page === 1
                                        const isLastPage = page === pagination.totalPages
                                        const isCurrentPage = page === pagination.page
                                        const isNearCurrent = Math.abs(page - pagination.page) <= 1

                                        if (isFirstPage || isLastPage || isCurrentPage || isNearCurrent) {
                                            return (
                                                <PaginationItem key={page}>
                                                    <PaginationLink
                                                        onClick={() => goToPage(page)}
                                                        isActive={pagination.page === page}
                                                        className="cursor-pointer"
                                                    >
                                                        {page}
                                                    </PaginationLink>
                                                </PaginationItem>
                                            )
                                        } else if (page === pagination.page - 2 || page === pagination.page + 2) {
                                            return (
                                                <PaginationItem key={page}>
                                                    <PaginationEllipsis />
                                                </PaginationItem>
                                            )
                                        }
                                        return null
                                    })}

                                    <PaginationItem>
                                        <PaginationNext
                                            onClick={() => goToPage(pagination.page + 1)}
                                            className={!hasNextPage ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                        >
                                            {t('next')}
                                        </PaginationNext>
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>

                            <div className="text-center mt-4 text-sm text-muted-foreground">
                                {t("pageOf", {
                                    current: pagination.page,
                                    total: pagination.totalPages,
                                })}
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t("deleteBundle")}</DialogTitle>
                        <DialogDescription>{t("deleteConfirmation")}</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setDeleteDialogOpen(false)}
                            disabled={isDeleting}
                        >
                            {t("cancel")}
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleConfirmDelete}
                            disabled={isDeleting}
                        >
                            {isDeleting ? t("deleting") : t("delete")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
