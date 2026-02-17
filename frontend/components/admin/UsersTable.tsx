"use client"

import { useState, FormEvent, ChangeEvent } from "react"
import { useTranslations, useLocale } from "next-intl"
import { useAdmin, AdminUser } from "@/hooks/useAdmin"
import UserStatsCards from "@/components/admin/UserStatsCards"
import UsersTableSkeleton from "@/components/admin/UsersTableSkeleton"
import StatsCardSkeleton from "@/components/admin/StatsCardSkeleton"
import { Skeleton } from "@/components/ui/skeleton"
import {
    Table,
    TableBody,
    TableCell,
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Pencil, Trash2, UserPlus, ChevronLeft, ChevronRight, Eye, MapPin, Phone, Star } from "lucide-react"

interface FormData {
    email: string
    password: string
    firstName: string
    lastName: string
    role: "admin" | "customer"
}

// Full user details including addresses
interface UserAddress {
    id: number
    recipientName: string
    streetAddress: string
    district: string
    postalCode: string
    city: string
    buildingNumber?: string
    secondaryNumber?: string
    phoneNumber?: string
    isDefault: boolean
    label?: string
}

interface FullUserDetails {
    id: number
    email: string
    firstName?: string
    lastName?: string
    role: string
    addresses: UserAddress[]
}

export default function UsersTable() {
    const t = useTranslations("Admin.Users")
    const locale = useLocale()
    const isRtl = locale === "ar"
    const {
        users,
        isLoading,
        pagination,
        createUser,
        updateUser,
        deleteUser,
        fetchUserById,
        goToPage,
        hasNextPage,
        hasPreviousPage,
    } = useAdmin()

    // Dialog states
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
    const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)
    const [viewUserDetails, setViewUserDetails] = useState<FullUserDetails | null>(null)
    const [isLoadingDetails, setIsLoadingDetails] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Form states
    const [formData, setFormData] = useState<FormData>({
        email: "",
        password: "",
        firstName: "",
        lastName: "",
        role: "customer",
    })

    const resetForm = () => {
        setFormData({
            email: "",
            password: "",
            firstName: "",
            lastName: "",
            role: "customer",
        })
    }

    const handleCreateUser = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            const result = await createUser(formData)
            if (result) {
                toast.success(t("userCreatedSuccess"))
                setIsCreateDialogOpen(false)
                resetForm()
            } else {
                toast.error(t("createUserFailed"))
            }
        } catch (error) {
            toast.error(t("createUserFailed"))
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleEditUser = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!selectedUser) return

        setIsSubmitting(true)

        try {
            const updateData = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                role: formData.role,
            }

            const result = await updateUser(selectedUser.id, updateData)
            if (result) {
                toast.success(t("userUpdatedSuccess"))
                setIsEditDialogOpen(false)
                setSelectedUser(null)
                resetForm()
            } else {
                toast.error(t("updateUserFailed"))
            }
        } catch (error) {
            toast.error(t("updateUserFailed"))
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDeleteUser = async () => {
        if (!selectedUser) return

        setIsSubmitting(true)

        try {
            const result = await deleteUser(selectedUser.id)
            if (result) {
                toast.success(t("userDeletedSuccess"))
                setIsDeleteDialogOpen(false)
                setSelectedUser(null)
            } else {
                toast.error(t("deleteUserFailed"))
            }
        } catch (error) {
            toast.error(t("deleteUserFailed"))
        } finally {
            setIsSubmitting(false)
        }
    }

    const openEditDialog = (user: AdminUser) => {
        setSelectedUser(user)
        setFormData({
            email: user.email,
            password: "",
            firstName: user.firstName || "",
            lastName: user.lastName || "",
            role: user.role,
        })
        setIsEditDialogOpen(true)
    }

    const openDeleteDialog = (user: AdminUser) => {
        setSelectedUser(user)
        setIsDeleteDialogOpen(true)
    }

    const openViewDialog = async (user: AdminUser) => {
        setSelectedUser(user)
        setIsViewDialogOpen(true)
        setIsLoadingDetails(true)

        try {
            const userData = await fetchUserById(user.id)
            if (userData) {
                setViewUserDetails(userData as unknown as FullUserDetails)
            }
        } catch (error) {
            console.error('Failed to fetch user details:', error)
        } finally {
            setIsLoadingDetails(false)
        }
    }

    const getRoleBadgeVariant = (role: string): "destructive" | "default" | "secondary" | "outline" => {
        switch (role) {
            case "admin":
                return "destructive"
            case "manager":
                return "default"
            case "customer":
                return "secondary"
            default:
                return "outline"
        }
    }

    if (isLoading) {
        return (
            <div className="space-y-4 bg-background">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">{t("title")}</h2>
                        <p className="text-muted-foreground">{t("description")}</p>
                    </div>
                    <Skeleton className="h-10 w-32" />
                </div>

                {/* User Statistics Skeleton */}
                <StatsCardSkeleton count={3} columns="3" />

                {/* Users Table Skeleton */}
                <UsersTableSkeleton rows={10} />

                {/* Pagination Skeleton */}
                <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-48" />
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-9 w-24" />
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-9 w-20" />
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-3 sm:space-y-4 bg-background">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                <div>
                    <h2 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight">{t("title")}</h2>
                    <p className="text-xs sm:text-sm text-muted-foreground">{t("description")}</p>
                </div>
                <Button onClick={() => setIsCreateDialogOpen(true)} className="w-full sm:w-auto">
                    <UserPlus className="me-2 h-4 w-4" />
                    <span className="truncate">{t("createUser")}</span>
                </Button>
            </div>

            {/* User Statistics */}
            <UserStatsCards users={users} isLoading={isLoading} />

            {/* Users Table */}
            <div className="rounded-md border overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className={isRtl ? "text-right" : "text-left"}>{t("id")}</TableHead>
                            <TableHead className={isRtl ? "text-right" : "text-left"}>{t("email")}</TableHead>
                            <TableHead className={isRtl ? "text-right" : "text-left"}>{t("firstName")}</TableHead>
                            <TableHead className={isRtl ? "text-right" : "text-left"}>{t("lastName")}</TableHead>
                            <TableHead className={isRtl ? "text-right" : "text-left"}>{t("role")}</TableHead>
                            <TableHead className="text-end">{t("actions")}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                    {t("noUsers")}
                                </TableCell>
                            </TableRow>
                        ) : (
                            users.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell className={`font-medium ${isRtl ? "text-right" : "text-left"}`}>{user.id}</TableCell>
                                    <TableCell className={isRtl ? "text-right" : "text-left"}>{user.email}</TableCell>
                                    <TableCell className={isRtl ? "text-right" : "text-left"}>{user.firstName || "-"}</TableCell>
                                    <TableCell className={isRtl ? "text-right" : "text-left"}>{user.lastName || "-"}</TableCell>
                                    <TableCell className={isRtl ? "text-right" : "text-left"}>
                                        <Badge variant={getRoleBadgeVariant(user.role)}>
                                            {t(`roles.${user.role}`)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-end">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => openViewDialog(user)}
                                                title={t("viewDetails")}
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => openEditDialog(user)}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => openDeleteDialog(user)}
                                            >
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-sm text-muted-foreground text-center sm:text-start">
                        {t("showingResults", {
                            from: (pagination.currentPage - 1) * pagination.itemsPerPage + 1,
                            to: Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems),
                            total: pagination.totalItems,
                        })}
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => goToPage(pagination.currentPage - 1)}
                            disabled={!hasPreviousPage}
                        >
                            <ChevronLeft className="h-4 w-4 me-1" />
                            {t("previous")}
                        </Button>
                        <div className="text-sm">
                            {t("pageOf", {
                                current: pagination.currentPage,
                                total: pagination.totalPages,
                            })}
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => goToPage(pagination.currentPage + 1)}
                            disabled={!hasNextPage}
                        >
                            {t("next")}
                            <ChevronRight className="h-4 w-4 ms-1" />
                        </Button>
                    </div>
                </div>
            )}

            {/* Create User Dialog */}
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t("createUser")}</DialogTitle>
                        <DialogDescription>{t("createUserDescription")}</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateUser}>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">{t("email")}</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">{t("password")}</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, password: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="firstName">{t("firstName")}</Label>
                                    <Input
                                        id="firstName"
                                        value={formData.firstName}
                                        onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, firstName: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lastName">{t("lastName")}</Label>
                                    <Input
                                        id="lastName"
                                        value={formData.lastName}
                                        onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, lastName: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="role">{t("role")}</Label>
                                <Select
                                    value={formData.role}
                                    onValueChange={(value: "admin" | "customer") => setFormData({ ...formData, role: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="customer">{t("roles.customer")}</SelectItem>
                                        <SelectItem value="admin">{t("roles.admin")}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter className="mt-6">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setIsCreateDialogOpen(false)
                                    resetForm()
                                }}
                                disabled={isSubmitting}
                            >
                                {t("cancel")}
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? t("creating") : t("create")}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit User Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t("editUser")}</DialogTitle>
                        <DialogDescription>{t("editUserDescription")}</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleEditUser}>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>{t("email")}</Label>
                                <Input value={formData.email} disabled />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="edit-firstName">{t("firstName")}</Label>
                                    <Input
                                        id="edit-firstName"
                                        value={formData.firstName}
                                        onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, firstName: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="edit-lastName">{t("lastName")}</Label>
                                    <Input
                                        id="edit-lastName"
                                        value={formData.lastName}
                                        onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, lastName: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-role">{t("role")}</Label>
                                <Select
                                    value={formData.role}
                                    onValueChange={(value: "admin" | "customer") => setFormData({ ...formData, role: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="customer">{t("roles.customer")}</SelectItem>
                                        <SelectItem value="admin">{t("roles.admin")}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter className="mt-6">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setIsEditDialogOpen(false)
                                    setSelectedUser(null)
                                    resetForm()
                                }}
                                disabled={isSubmitting}
                            >
                                {t("cancel")}
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? t("updating") : t("update")}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete User Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t("deleteUser")}</DialogTitle>
                        <DialogDescription>
                            {t("deleteUserConfirmation", { email: selectedUser?.email ?? "" })}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsDeleteDialogOpen(false)
                                setSelectedUser(null)
                            }}
                            disabled={isSubmitting}
                        >
                            {t("cancel")}
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDeleteUser}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? t("deleting") : t("delete")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* View User Details Dialog */}
            <Dialog open={isViewDialogOpen} onOpenChange={(open) => {
                setIsViewDialogOpen(open)
                if (!open) {
                    setViewUserDetails(null)
                    setSelectedUser(null)
                }
            }}>
                <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{t("userDetails")}</DialogTitle>
                        <DialogDescription>
                            {viewUserDetails?.email || selectedUser?.email}
                        </DialogDescription>
                    </DialogHeader>

                    {isLoadingDetails ? (
                        <div className="space-y-4 py-4">
                            <Skeleton className="h-8 w-full" />
                            <Skeleton className="h-8 w-full" />
                            <Skeleton className="h-24 w-full" />
                        </div>
                    ) : viewUserDetails ? (
                        <div className="space-y-6 py-4">
                            {/* User Info */}
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-muted-foreground">{t("firstName")}:</span>
                                    <span className="ms-2 font-medium">{viewUserDetails.firstName || "-"}</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">{t("lastName")}:</span>
                                    <span className="ms-2 font-medium">{viewUserDetails.lastName || "-"}</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">{t("role")}:</span>
                                    <Badge variant={getRoleBadgeVariant(viewUserDetails.role)} className="ms-2">
                                        {t(`roles.${viewUserDetails.role}`)}
                                    </Badge>
                                </div>
                            </div>

                            {/* Addresses Section */}
                            <div className="space-y-3">
                                <h4 className="font-semibold flex items-center gap-2">
                                    <MapPin className="h-4 w-4" />
                                    {t("addresses")}
                                    <Badge variant="outline" className="ms-auto">
                                        {viewUserDetails.addresses?.length || 0}
                                    </Badge>
                                </h4>

                                {!viewUserDetails.addresses || viewUserDetails.addresses.length === 0 ? (
                                    <p className="text-sm text-muted-foreground py-4 text-center">
                                        {t("noAddresses")}
                                    </p>
                                ) : (
                                    <div className="space-y-3">
                                        {viewUserDetails.addresses.map((address) => (
                                            <div
                                                key={address.id}
                                                className="rounded-lg border p-3 space-y-2 text-sm"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium">{address.recipientName}</span>
                                                        {address.label && (
                                                            <Badge variant="secondary" className="text-xs">
                                                                {address.label}
                                                            </Badge>
                                                        )}
                                                        {address.isDefault && (
                                                            <Star className="h-4 w-4 text-primary fill-primary" />
                                                        )}
                                                    </div>
                                                </div>
                                                <p className="text-muted-foreground">
                                                    {address.streetAddress}
                                                    {address.buildingNumber && `, ${t("building")} ${address.buildingNumber}`}
                                                    {address.district && `, ${address.district}`}
                                                </p>
                                                <p className="text-muted-foreground">
                                                    {address.city}
                                                    {address.postalCode && ` - ${address.postalCode}`}
                                                </p>
                                                {address.phoneNumber && (
                                                    <div className="flex items-center gap-1 text-muted-foreground">
                                                        <Phone className="h-3 w-3" />
                                                        <span>{address.phoneNumber}</span>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : null}
                </DialogContent>
            </Dialog>
        </div>
    )
}
