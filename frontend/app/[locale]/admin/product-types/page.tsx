"use client"

import { useState } from "react"
import { useTranslations, useLocale } from "next-intl"
import { cn } from "@/lib/utils"
import { useProductTypes, ProductType } from "@/hooks/useProductTypes"
import { ProductTypeForm } from "@/components/admin/productTypes/ProductTypeForm"
import { ProductTypeRow } from "@/components/admin/productTypes/ProductTypeRow"
import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
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
import { Plus, Tags, Loader2 } from "lucide-react"
import { toast } from "sonner"

const ITEMS_PER_PAGE = 10

export default function AdminProductTypesPage() {
    const t = useTranslations("Admin.ProductTypes")
    const {
        productTypes,
        isLoading,
        createProductType,
        updateProductType,
        deleteProductType,
    } = useProductTypes()

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [productTypeToDelete, setProductTypeToDelete] = useState<number | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    const [formDialogOpen, setFormDialogOpen] = useState(false)
    const [productTypeToEdit, setProductTypeToEdit] = useState<ProductType | null>(null)
    const [currentPage, setCurrentPage] = useState(1)

    // Locale awareness
    const locale = useLocale()
    const isRtl = locale === "ar"

    const handleDeleteClick = (productTypeId: number) => {
        setProductTypeToDelete(productTypeId)
        setDeleteDialogOpen(true)
    }

    const handleConfirmDelete = async () => {
        if (!productTypeToDelete) return

        setIsDeleting(true)
        try {
            const success = await deleteProductType(productTypeToDelete)
            if (success) {
                toast.success(t("deleteSuccess"))
                setDeleteDialogOpen(false)
                setProductTypeToDelete(null)
            } else {
                toast.error(t("deleteFailed"))
            }
        } catch {
            toast.error(t("deleteFailed"))
        } finally {
            setIsDeleting(false)
        }
    }

    const handleCreateClick = () => {
        setProductTypeToEdit(null)
        setFormDialogOpen(true)
    }

    const handleEditClick = (productType: ProductType) => {
        setProductTypeToEdit(productType)
        setFormDialogOpen(true)
    }

    const handleFormSubmit = async (data: { name: string; allowedAttributes: string[] }) => {
        const success = productTypeToEdit
            ? await updateProductType(productTypeToEdit.id, data)
            : await createProductType(data)

        if (success) {
            toast.success(productTypeToEdit ? t("updateSuccess") : t("createSuccess"))
            setFormDialogOpen(false)
            setProductTypeToEdit(null)
            return true
        } else {
            toast.error(productTypeToEdit ? t("updateFailed") : t("createFailed"))
            return false
        }
    }

    const handleFormCancel = () => {
        setFormDialogOpen(false)
        setProductTypeToEdit(null)
    }

    // Pagination calculations
    const totalPages = Math.ceil(productTypes.length / ITEMS_PER_PAGE)
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE
    const paginatedProductTypes = productTypes.slice(startIndex, endIndex)

    // Helper function to generate page numbers
    const getPageNumbers = () => {
        const pages: (number | 'ellipsis')[] = []
        const showEllipsis = totalPages > 7

        if (!showEllipsis) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i)
            }
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 4; i++) pages.push(i)
                pages.push('ellipsis')
                pages.push(totalPages)
            } else if (currentPage >= totalPages - 2) {
                pages.push(1)
                pages.push('ellipsis')
                for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i)
            } else {
                pages.push(1)
                pages.push('ellipsis')
                for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i)
                pages.push('ellipsis')
                pages.push(totalPages)
            }
        }
        return pages
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
                        <span className="truncate">{t("createProductType")}</span>
                    </Button>
                </div>
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-4 sm:space-y-6 md:space-y-8 bg-background">
            {/* Header */}
            <div className={cn(
                "flex items-center justify-between",
                isRtl && "flex-row-reverse"
            )}>
                <div className={isRtl ? "text-right" : ""}>
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">{t("title")}</h1>
                    <p className="text-muted-foreground">{t("description")}</p>
                </div>
                <Button onClick={handleCreateClick} className={isRtl ? "flex-row-reverse" : ""}>
                    <Plus className="h-4 w-4 me-2" />
                    {t("createProductType")}
                </Button>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-1">
                <div className="rounded-lg border bg-card p-6 shadow-sm">
                    <div className={cn(
                        "flex items-center justify-between space-y-0 pb-2",
                        isRtl && "flex-row-reverse"
                    )}>
                        <p className="text-sm font-medium text-muted-foreground">
                            {t("totalProductTypes")}
                        </p>
                        <Tags className="h-4 w-4 text-primary" />
                    </div>
                    <div className={cn("space-y-1", isRtl && "text-right")}>
                        <p className="text-2xl font-bold">{productTypes.length}</p>
                        <p className="text-xs text-muted-foreground">{t("allProductTypes")}</p>
                    </div>
                </div>
            </div>

            {/* Product Types Table */}
            {productTypes.length > 0 ? (
                <>
                    <div className="rounded-lg border bg-card shadow-sm overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className={cn("w-[80px]", isRtl && "text-right")}>{t("id")}</TableHead>
                                    <TableHead className={cn("w-[200px]", isRtl && "text-right")}>{t("name")}</TableHead>
                                    <TableHead className={isRtl ? "text-right" : ""}>{t("allowedAttributes")}</TableHead>
                                    <TableHead className={cn("w-[120px] text-center")}>{t("actions")}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedProductTypes.map((productType) => (
                                    <ProductTypeRow
                                        key={productType.id}
                                        productType={productType}
                                        onEdit={handleEditClick}
                                        onDelete={handleDeleteClick}
                                    />
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="mt-8">
                            <Pagination>
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious
                                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                            className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                        />
                                    </PaginationItem>

                                    {getPageNumbers().map((page, index) => (
                                        <PaginationItem key={index}>
                                            {page === 'ellipsis' ? (
                                                <PaginationEllipsis />
                                            ) : (
                                                <PaginationLink
                                                    onClick={() => setCurrentPage(page as number)}
                                                    isActive={currentPage === page}
                                                    className="cursor-pointer"
                                                >
                                                    {page}
                                                </PaginationLink>
                                            )}
                                        </PaginationItem>
                                    ))}

                                    <PaginationItem>
                                        <PaginationNext
                                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                            className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                        />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        </div>
                    )}
                </>
            ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Tags className="h-12 w-12 text-muted-foreground/50 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">{t("noProductTypes")}</h3>
                    <p className="text-muted-foreground mb-4">{t("noProductTypesDescription")}</p>
                    <Button onClick={handleCreateClick}>
                        <Plus className="h-4 w-4 me-2" />
                        {t("createFirstProductType")}
                    </Button>
                </div>
            )}

            {/* Create/Edit Form Dialog */}
            <Dialog open={formDialogOpen} onOpenChange={setFormDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {productTypeToEdit ? t("editProductType") : t("createProductType")}
                        </DialogTitle>
                        <DialogDescription>
                            {productTypeToEdit ? t("editDescription") : t("createDescription")}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="mt-4">
                        <ProductTypeForm
                            productType={productTypeToEdit}
                            onSubmit={handleFormSubmit}
                            onCancel={handleFormCancel}
                        />
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t("deleteTitle")}</DialogTitle>
                        <DialogDescription>
                            {t("deleteDescription")}
                        </DialogDescription>
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
