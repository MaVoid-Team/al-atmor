"use client"

import { useEffect, useState } from "react"
import { useTranslations, useLocale } from "next-intl"
import { useDiscounts, DiscountCode } from "@/hooks/useDiscounts"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { TicketPercent, ChevronLeft, ChevronRight, MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
} from "@/components/ui/pagination"
import { EditPromoDialog } from "./EditPromoDialog"
import { toast } from "sonner"

const ITEMS_PER_PAGE = 6

interface PromoCodesTableProps {
    onRefresh?: () => void
    refreshKey?: number
}

export function PromoCodesTable({ onRefresh, refreshKey = 0 }: PromoCodesTableProps) {
    const t = useTranslations("Admin.PromoCodes")
    const tCommon = useTranslations("Common")
    const locale = useLocale()
    const isRtl = locale === "ar"

    const { discounts, isLoading, fetchDiscounts, deleteDiscount, pagination } = useDiscounts()
    const [currentPage, setCurrentPage] = useState(1)
    const [showInactive, setShowInactive] = useState(false)

    // Edit dialog state
    const [editDialogOpen, setEditDialogOpen] = useState(false)
    const [selectedDiscount, setSelectedDiscount] = useState<DiscountCode | null>(null)

    // Delete dialog state
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [discountToDelete, setDiscountToDelete] = useState<DiscountCode | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    useEffect(() => {
        fetchDiscounts(currentPage, ITEMS_PER_PAGE, !showInactive)
    }, [fetchDiscounts, currentPage, showInactive, refreshKey])

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= pagination.totalPages) {
            setCurrentPage(page)
        }
    }

    const handleFilterChange = (checked: boolean) => {
        setShowInactive(checked)
        setCurrentPage(1) // Reset to first page when filter changes
    }

    const handleEdit = (discount: DiscountCode) => {
        setSelectedDiscount(discount)
        setEditDialogOpen(true)
    }

    const handleDeleteClick = (discount: DiscountCode) => {
        setDiscountToDelete(discount)
        setDeleteDialogOpen(true)
    }

    const handleConfirmDelete = async () => {
        if (!discountToDelete) return

        setIsDeleting(true)
        try {
            const success = await deleteDiscount(discountToDelete.id)
            if (success) {
                toast.success(t("deleteSuccess"))
                setDeleteDialogOpen(false)
                setDiscountToDelete(null)
                onRefresh?.()
            } else {
                toast.error(t("deleteFailed"))
            }
        } catch (error) {
            console.error("Failed to delete discount:", error)
            toast.error(t("deleteFailed"))
        } finally {
            setIsDeleting(false)
        }
    }

    const handleEditSuccess = () => {
        onRefresh?.()
    }

    // Format date based on locale
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString(
            isRtl ? 'ar-SA' : 'en-US',
            { month: 'short', day: 'numeric', year: 'numeric' }
        )
    }

    if (isLoading) {
        return (
            <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                ))}
            </div>
        )
    }

    if (discounts.length === 0 && !showInactive) {
        return (
            <div className="text-center py-12">
                <TicketPercent className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">{t("noPromoCodes")}</h3>
                <p className="text-muted-foreground">{t("noPromoCodesDescription")}</p>
            </div>
        )
    }

    // Generate page numbers to display
    const getPageNumbers = () => {
        const pages: number[] = []
        const maxVisiblePages = 5
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
        const endPage = Math.min(pagination.totalPages, startPage + maxVisiblePages - 1)

        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1)
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i)
        }
        return pages
    }

    return (
        <div className="space-y-4">
            {/* Filter Toggle */}
            <div className={`flex items-center justify-end gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                <Switch
                    id="show-inactive"
                    checked={showInactive}
                    onCheckedChange={handleFilterChange}
                />
                <Label htmlFor="show-inactive" className="text-sm text-muted-foreground cursor-pointer">
                    {t("showInactive")}
                </Label>
            </div>

            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className={isRtl ? "text-right" : "text-left"}>{t("table.code")}</TableHead>
                            <TableHead className={isRtl ? "text-right" : "text-left"}>{t("table.type")}</TableHead>
                            <TableHead className={isRtl ? "text-left" : "text-right"}>{t("table.value")}</TableHead>
                            <TableHead className={isRtl ? "text-left" : "text-right"}>{t("table.minPurchase")}</TableHead>
                            <TableHead className="text-center">{t("table.uses")}</TableHead>
                            <TableHead className={isRtl ? "text-right" : "text-left"}>{t("table.validPeriod")}</TableHead>
                            <TableHead className="text-center">{t("table.status")}</TableHead>
                            <TableHead className="text-center">{t("table.actions")}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {discounts.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                    {t("noPromoCodes")}
                                </TableCell>
                            </TableRow>
                        ) : (
                            discounts.map((discount) => {
                                const isExpired = new Date(discount.validTo) < new Date()
                                const isUpcoming = new Date(discount.validFrom) > new Date()
                                const isMaxedOut = discount.maxUses ? discount.usedCount >= discount.maxUses : false

                                return (
                                    <TableRow key={discount.id}>
                                        <TableCell className={`font-mono font-semibold ${isRtl ? "text-right" : "text-left"}`}>
                                            {discount.code}
                                        </TableCell>
                                        <TableCell className={isRtl ? "text-right" : "text-left"}>
                                            <Badge variant="outline">
                                                {discount.type === "percentage" ? t("type.percentage") : t("type.fixed")}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className={`font-medium ${isRtl ? "text-left" : "text-right"}`}>
                                            {discount.type === "percentage"
                                                ? `${discount.value}%`
                                                : `${tCommon("currency")} ${parseFloat(discount.value).toLocaleString(isRtl ? 'ar-SA' : 'en-US')}`}
                                        </TableCell>
                                        <TableCell className={`text-muted-foreground ${isRtl ? "text-left" : "text-right"}`}>
                                            {discount.minPurchase
                                                ? `${tCommon("currency")} ${parseFloat(discount.minPurchase).toLocaleString(isRtl ? 'ar-SA' : 'en-US')}`
                                                : "-"}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <span className="text-sm">
                                                {discount.usedCount}
                                                {discount.maxUses ? ` / ${discount.maxUses}` : ""}
                                            </span>
                                        </TableCell>
                                        <TableCell className={`text-sm text-muted-foreground ${isRtl ? "text-right" : "text-left"}`}>
                                            <div>{formatDate(discount.validFrom)}</div>
                                            <div>{formatDate(discount.validTo)}</div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {!discount.active ? (
                                                <Badge variant="secondary">{t("status.inactive")}</Badge>
                                            ) : isExpired ? (
                                                <Badge variant="destructive">{t("status.expired")}</Badge>
                                            ) : isMaxedOut ? (
                                                <Badge variant="destructive">{t("status.maxedOut")}</Badge>
                                            ) : isUpcoming ? (
                                                <Badge variant="outline">{t("status.upcoming")}</Badge>
                                            ) : (
                                                <Badge variant="default">{t("status.active")}</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align={isRtl ? "start" : "end"}>
                                                    <DropdownMenuItem onClick={() => handleEdit(discount)}>
                                                        <Pencil className="h-4 w-4 me-2" />
                                                        {t("edit")}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => handleDeleteClick(discount)}
                                                        className="text-destructive focus:text-destructive"
                                                    >
                                                        <Trash2 className="h-4 w-4 me-2" />
                                                        {t("delete")}
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                )
                            })
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <div className={`flex items-center justify-between ${isRtl ? 'flex-row-reverse' : ''}`}>
                    <p className="text-sm text-muted-foreground">
                        {t("table.showing", {
                            from: ((currentPage - 1) * ITEMS_PER_PAGE) + 1,
                            to: Math.min(currentPage * ITEMS_PER_PAGE, pagination.totalItems),
                            total: pagination.totalItems
                        })}
                    </p>
                    <Pagination>
                        <PaginationContent className={isRtl ? 'flex-row-reverse' : ''}>
                            <PaginationItem>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="gap-1"
                                >
                                    {isRtl ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                                    <span className="hidden sm:inline">{t("table.previous")}</span>
                                </Button>
                            </PaginationItem>

                            {getPageNumbers().map((page) => (
                                <PaginationItem key={page}>
                                    <PaginationLink
                                        onClick={() => handlePageChange(page)}
                                        isActive={currentPage === page}
                                        className="cursor-pointer"
                                    >
                                        {page}
                                    </PaginationLink>
                                </PaginationItem>
                            ))}

                            <PaginationItem>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === pagination.totalPages}
                                    className="gap-1"
                                >
                                    <span className="hidden sm:inline">{t("table.next")}</span>
                                    {isRtl ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                </Button>
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            )}

            {/* Edit Dialog */}
            <EditPromoDialog
                open={editDialogOpen}
                onOpenChange={setEditDialogOpen}
                discount={selectedDiscount}
                onSuccess={handleEditSuccess}
            />

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t("deleteTitle")}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t("deleteDescription", { code: discountToDelete?.code || "" })}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>{t("form.cancel")}</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmDelete}
                            disabled={isDeleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isDeleting ? t("deleting") : t("delete")}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
