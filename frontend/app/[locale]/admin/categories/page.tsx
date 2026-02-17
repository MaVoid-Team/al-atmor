"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { useCategories, Category } from "@/hooks/useCategories"
import { CategoryCard } from "@/components/admin/CategoryCard"
import { CategoryForm } from "@/components/admin/CategoryForm"
import StatsCardSkeleton from "@/components/admin/StatsCardSkeleton"
import { Button } from "@/components/ui/button"
import { Plus, FolderTree } from "lucide-react"
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

const CATEGORIES_PER_PAGE = 6

export default function AdminCategoriesPage() {
    const t = useTranslations("Admin.Categories")
    const { categories, isLoading, createCategory, updateCategory, deleteCategory } = useCategories()

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    const [formDialogOpen, setFormDialogOpen] = useState(false)
    const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null)
    const [currentPage, setCurrentPage] = useState(1)

    const handleDeleteClick = (categoryId: number) => {
        setCategoryToDelete(categoryId)
        setDeleteDialogOpen(true)
    }

    const handleConfirmDelete = async () => {
        if (!categoryToDelete) return

        setIsDeleting(true)
        try {
            const success = await deleteCategory(categoryToDelete)
            if (success) {
                toast.success(t("deleteSuccess"))
                setDeleteDialogOpen(false)
                setCategoryToDelete(null)
            } else {
                toast.error(t("deleteFailed"))
            }
        } catch (error) {
            toast.error(t("deleteFailed"))
        } finally {
            setIsDeleting(false)
        }
    }

    const handleCreateClick = () => {
        setCategoryToEdit(null)
        setFormDialogOpen(true)
    }

    const handleEditClick = (category: Category) => {
        setCategoryToEdit(category)
        setFormDialogOpen(true)
    }

    const handleFormSubmit = async (formData: FormData) => {
        const success = categoryToEdit
            ? await updateCategory(categoryToEdit.id, formData)
            : await createCategory(formData)

        if (success) {
            toast.success(categoryToEdit ? t("updateSuccess") : t("createSuccess"))
            setFormDialogOpen(false)
            setCategoryToEdit(null)
            return true
        } else {
            toast.error(categoryToEdit ? t("updateFailed") : t("createFailed"))
            return false
        }
    }

    const handleFormCancel = () => {
        setFormDialogOpen(false)
        setCategoryToEdit(null)
    }

    // Organize categories by hierarchy
    const rootCategories = categories.filter(cat => !cat.parentId)
    const childCategories = categories.filter(cat => cat.parentId)

    // Pagination calculations
    const totalPages = Math.ceil(categories.length / CATEGORIES_PER_PAGE)
    const startIndex = (currentPage - 1) * CATEGORIES_PER_PAGE
    const endIndex = startIndex + CATEGORIES_PER_PAGE
    const paginatedCategories = categories.slice(startIndex, endIndex)

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
                        <span className="truncate">{t("createCategory")}</span>
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
                <Button onClick={handleCreateClick} className="w-full sm:w-auto">
                    <Plus className="h-4 w-4 me-2" />
                    <span className="truncate">{t("createCategory")}</span>
                </Button>
            </div>

            {/* Stats */}
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
                <div className="rounded-lg border bg-card p-4 sm:p-6 shadow-sm min-w-0">
                    <div className="flex items-center justify-between space-y-0 pb-2">
                        <p className="text-sm font-medium text-muted-foreground">
                            {t("totalCategories")}
                        </p>
                        <FolderTree className="h-4 w-4 text-primary" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-2xl font-bold">{categories.length}</p>
                        <p className="text-xs text-muted-foreground">{t("allCategories")}</p>
                    </div>
                </div>

                <div className="rounded-lg border bg-card p-4 sm:p-6 shadow-sm min-w-0">
                    <div className="flex items-center justify-between space-y-0 pb-2">
                        <p className="text-sm font-medium text-muted-foreground">
                            {t("rootCategories")}
                        </p>
                        <FolderTree className="h-4 w-4 text-primary" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-2xl font-bold">{rootCategories.length}</p>
                        <p className="text-xs text-muted-foreground">{t("topLevel")}</p>
                    </div>
                </div>

                <div className="rounded-lg border bg-card p-4 sm:p-6 shadow-sm min-w-0">
                    <div className="flex items-center justify-between space-y-0 pb-2">
                        <p className="text-sm font-medium text-muted-foreground">
                            {t("subcategories")}
                        </p>
                        <FolderTree className="h-4 w-4 text-primary" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-2xl font-bold">{childCategories.length}</p>
                        <p className="text-xs text-muted-foreground">{t("nested")}</p>
                    </div>
                </div>
            </div>

            {/* Categories Grid */}
            {categories.length > 0 ? (
                <>
                    <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                        {paginatedCategories.map((category) => (
                            <CategoryCard
                                key={category.id}
                                category={category}
                                onEdit={handleEditClick}
                                onDelete={handleDeleteClick}
                                allCategories={categories}
                            />
                        ))}
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
                    <FolderTree className="h-12 w-12 text-muted-foreground/50 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">{t("noCategories")}</h3>
                    <p className="text-muted-foreground mb-4">{t("noCategoriesDescription")}</p>
                    <Button onClick={handleCreateClick}>
                        <Plus className="h-4 w-4 me-2" />
                        {t("createFirstCategory")}
                    </Button>
                </div>
            )}

            {/* Create/Edit Form Dialog */}
            <Dialog open={formDialogOpen} onOpenChange={setFormDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {categoryToEdit ? t("editCategory") : t("createCategory")}
                        </DialogTitle>
                        <DialogDescription>
                            {categoryToEdit ? t("editDescription") : t("createDescription")}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="mt-4">
                        <CategoryForm
                            category={categoryToEdit}
                            categories={categories}
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
