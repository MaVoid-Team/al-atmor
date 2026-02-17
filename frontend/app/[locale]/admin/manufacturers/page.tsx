"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { useManufacturers, Manufacturer } from "@/hooks/useManufacturers"
import { ManufacturerCard } from "@/components/admin/manufacturers/ManufacturerCard"
import { ManufacturerForm } from "@/components/admin/manufacturers/ManufacturerForm"
import StatsCardSkeleton from "@/components/admin/StatsCardSkeleton"
import { Button } from "@/components/ui/button"
import { Plus, Building2 } from "lucide-react"
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

const MANUFACTURERS_PER_PAGE = 6

export default function AdminManufacturersPage() {
    const t = useTranslations("Admin.Manufacturers")
    const { manufacturers, isLoading, createManufacturer, updateManufacturer, deleteManufacturer } = useManufacturers()

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [manufacturerToDelete, setManufacturerToDelete] = useState<number | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    const [formDialogOpen, setFormDialogOpen] = useState(false)
    const [manufacturerToEdit, setManufacturerToEdit] = useState<Manufacturer | null>(null)
    const [currentPage, setCurrentPage] = useState(1)

    const handleDeleteClick = (manufacturerId: number) => {
        setManufacturerToDelete(manufacturerId)
        setDeleteDialogOpen(true)
    }

    const handleConfirmDelete = async () => {
        if (!manufacturerToDelete) return

        setIsDeleting(true)
        try {
            const success = await deleteManufacturer(manufacturerToDelete)
            if (success) {
                toast.success(t("deleteSuccess"))
                setDeleteDialogOpen(false)
                setManufacturerToDelete(null)
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
        setManufacturerToEdit(null)
        setFormDialogOpen(true)
    }

    const handleEditClick = (manufacturer: Manufacturer) => {
        setManufacturerToEdit(manufacturer)
        setFormDialogOpen(true)
    }

    const handleFormSubmit = async (data: { name: string; logoUrl?: string }) => {
        const success = manufacturerToEdit
            ? await updateManufacturer(manufacturerToEdit.id, data)
            : await createManufacturer(data)

        if (success) {
            toast.success(manufacturerToEdit ? t("updateSuccess") : t("createSuccess"))
            setFormDialogOpen(false)
            setManufacturerToEdit(null)
            return true
        } else {
            toast.error(manufacturerToEdit ? t("updateFailed") : t("createFailed"))
            return false
        }
    }

    const handleFormCancel = () => {
        setFormDialogOpen(false)
        setManufacturerToEdit(null)
    }

    // Pagination calculations
    const totalPages = Math.ceil(manufacturers.length / MANUFACTURERS_PER_PAGE)
    const startIndex = (currentPage - 1) * MANUFACTURERS_PER_PAGE
    const endIndex = startIndex + MANUFACTURERS_PER_PAGE
    const paginatedManufacturers = manufacturers.slice(startIndex, endIndex)

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
                        <span className="truncate">{t("createManufacturer")}</span>
                    </Button>
                </div>
                <StatsCardSkeleton count={1} />
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
                    <span className="truncate">{t("createManufacturer")}</span>
                </Button>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-1">
                <div className="rounded-lg border bg-card p-6 shadow-sm">
                    <div className="flex items-center justify-between space-y-0 pb-2">
                        <p className="text-sm font-medium text-muted-foreground">
                            {t("totalManufacturers")}
                        </p>
                        <Building2 className="h-4 w-4 text-primary" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-2xl font-bold">{manufacturers.length}</p>
                        <p className="text-xs text-muted-foreground">{t("allManufacturers")}</p>
                    </div>
                </div>
            </div>

            {/* Manufacturers Grid */}
            {manufacturers.length > 0 ? (
                <>
                    <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                        {paginatedManufacturers.map((manufacturer) => (
                            <ManufacturerCard
                                key={manufacturer.id}
                                manufacturer={manufacturer}
                                onEdit={handleEditClick}
                                onDelete={handleDeleteClick}
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
                    <Building2 className="h-12 w-12 text-muted-foreground/50 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">{t("noManufacturers")}</h3>
                    <p className="text-muted-foreground mb-4">{t("noManufacturersDescription")}</p>
                    <Button onClick={handleCreateClick}>
                        <Plus className="h-4 w-4 me-2" />
                        {t("createFirstManufacturer")}
                    </Button>
                </div>
            )}

            {/* Create/Edit Form Dialog */}
            <Dialog open={formDialogOpen} onOpenChange={setFormDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {manufacturerToEdit ? t("editManufacturer") : t("createManufacturer")}
                        </DialogTitle>
                        <DialogDescription>
                            {manufacturerToEdit ? t("editDescription") : t("createDescription")}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="mt-4">
                        <ManufacturerForm
                            manufacturer={manufacturerToEdit}
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
