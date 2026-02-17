"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { useProducts } from "@/hooks/useProducts"
import { useRouter } from "@/i18n/navigation"
import { ProductCard } from "@/components/products/ProductCard"
import StatsCardSkeleton from "@/components/admin/StatsCardSkeleton"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
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
import { toast } from "sonner"

export default function AdminProductsPage() {
    const t = useTranslations("Admin.Products")
    const router = useRouter()
    const { products, isLoading, deleteProduct, pagination, goToPage, hasNextPage, hasPreviousPage } = useProducts()

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [productToDelete, setProductToDelete] = useState<number | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    const handleDeleteClick = (productId: number) => {
        setProductToDelete(productId)
        setDeleteDialogOpen(true)
    }

    const handleConfirmDelete = async () => {
        if (!productToDelete) return

        setIsDeleting(true)
        try {
            const success = await deleteProduct(productToDelete)
            if (success) {
                toast.success(t("deleteSuccess"))
                setDeleteDialogOpen(false)
                setProductToDelete(null)
            } else {
                toast.error(t("deleteFailed"))
            }
        } catch (error) {
            toast.error(t("deleteFailed"))
        } finally {
            setIsDeleting(false)
        }
    }

    const handleCreateProduct = () => {
        router.push("/admin/products/create")
    }

    if (isLoading) {
        return (
            <div className="space-y-4 sm:space-y-6 md:space-y-8 bg-background">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                    <div>
                        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">{t("title")}</h1>
                        <p className="text-xs sm:text-sm text-muted-foreground">{t("description")}</p>
                    </div>
                    <Button disabled className="w-full sm:w-auto">
                        <Plus className="h-4 w-4 me-2" />
                        <span className="truncate">{t("createProduct")}</span>
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
                    <p className="text-xs sm:text-sm text-muted-foreground">{t("description")}</p>
                </div>
                <Button onClick={handleCreateProduct} className="w-full sm:w-auto">
                    <Plus className="h-4 w-4 me-2" />
                    <span className="truncate">{t("createProduct")}</span>
                </Button>
            </div>

            {/* Products Grid */}
            {products.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-muted-foreground mb-4">{t("noProducts")}</p>
                    <Button onClick={handleCreateProduct}>
                        <Plus className="h-4 w-4 me-2" />
                        {t("createFirstProduct")}
                    </Button>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                        {products.map((product) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                isAdmin={true}
                                onDelete={handleDeleteClick}
                            />
                        ))}
                    </div>

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                        <div className="mt-8">
                            <div className="mb-4 text-sm text-muted-foreground text-center">
                                {t("showingResults", {
                                    from: (pagination.currentPage - 1) * pagination.itemsPerPage + 1,
                                    to: Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems),
                                    total: pagination.totalItems,
                                })}
                            </div>

                            <Pagination>
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious
                                            onClick={() => goToPage(pagination.currentPage - 1)}
                                            className={!hasPreviousPage ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                        >
                                            {t('previous')}
                                        </PaginationPrevious>
                                    </PaginationItem>

                                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => {
                                        // Show first page, last page, current page, and pages around current
                                        const isFirstPage = page === 1
                                        const isLastPage = page === pagination.totalPages
                                        const isCurrentPage = page === pagination.currentPage
                                        const isNearCurrent = Math.abs(page - pagination.currentPage) <= 1

                                        if (isFirstPage || isLastPage || isCurrentPage || isNearCurrent) {
                                            return (
                                                <PaginationItem key={page}>
                                                    <PaginationLink
                                                        onClick={() => goToPage(page)}
                                                        isActive={pagination.currentPage === page}
                                                        className="cursor-pointer"
                                                    >
                                                        {page}
                                                    </PaginationLink>
                                                </PaginationItem>
                                            )
                                        } else if (page === pagination.currentPage - 2 || page === pagination.currentPage + 2) {
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
                                            onClick={() => goToPage(pagination.currentPage + 1)}
                                            className={!hasNextPage ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                        >
                                            {t('next')}
                                        </PaginationNext>
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>

                            <div className="text-center mt-4 text-sm text-muted-foreground">
                                {t("pageOf", {
                                    current: pagination.currentPage,
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
                        <DialogTitle>{t("deleteProduct")}</DialogTitle>
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
