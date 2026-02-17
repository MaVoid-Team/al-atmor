"use client"

import { useEffect, useState } from "react"
import { useRouter } from "@/i18n/navigation"
import { useTranslations } from "next-intl"
import { useUser, Address } from "@/hooks/useUser"
import { useAuth } from "@/context/AuthContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { AddressCard } from "@/components/profile/AddressCard"
import { AddressFormDialog } from "@/components/profile/AddressFormDialog"
import { DeleteAddressDialog } from "@/components/profile/DeleteAddressDialog"
import { toast } from "sonner"
import { Plus, Mail, Shield, User as UserIcon, MapPin } from "lucide-react"

export default function ProfilePage() {
    const router = useRouter()
    const t = useTranslations('Profile')
    const {
        user,
        userEmail,
        userRole,
        isAuthenticated,
        isLoading: authLoading,
        addresses,
        isLoadingAddresses,
        fetchAddresses,
        createAddress,
        updateAddress,
        deleteAddress,
        setDefaultAddress,
    } = useUser()
    const { logout } = useAuth()

    const [showAddressForm, setShowAddressForm] = useState(false)
    const [editingAddress, setEditingAddress] = useState<Address | null>(null)
    const [deletingAddress, setDeletingAddress] = useState<Address | null>(null)
    const [isSaving, setIsSaving] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    // Redirect if not authenticated
    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/auth/login')
        }
    }, [authLoading, isAuthenticated, router])

    // Fetch addresses on mount
    useEffect(() => {
        if (isAuthenticated) {
            fetchAddresses()
        }
    }, [isAuthenticated, fetchAddresses])

    // Handle save address (create or update)
    const handleSaveAddress = async (addressData: Partial<Address>) => {
        setIsSaving(true)
        try {
            if (editingAddress) {
                const result = await updateAddress(editingAddress.id, addressData)
                if (result) {
                    toast.success(t('address.updated'))
                    setShowAddressForm(false)
                    setEditingAddress(null)
                } else {
                    toast.error(t('errors.saveFailed'))
                }
            } else {
                const result = await createAddress(addressData)
                if (result) {
                    toast.success(t('address.created'))
                    setShowAddressForm(false)
                } else {
                    toast.error(t('errors.saveFailed'))
                }
            }
        } catch (error) {
            console.error('Failed to save address:', error)
            toast.error(t('errors.saveFailed'))
        } finally {
            setIsSaving(false)
        }
    }

    // Handle delete address
    const handleDeleteAddress = async () => {
        if (!deletingAddress) return

        setIsDeleting(true)
        try {
            const success = await deleteAddress(deletingAddress.id)
            if (success) {
                toast.success(t('address.deleted'))
                setDeletingAddress(null)
            } else {
                toast.error(t('errors.deleteFailed'))
            }
        } catch (error) {
            console.error('Failed to delete address:', error)
            toast.error(t('errors.deleteFailed'))
        } finally {
            setIsDeleting(false)
        }
    }

    // Handle set default address
    const handleSetDefault = async (addressId: number) => {
        try {
            const success = await setDefaultAddress(addressId)
            if (success) {
                toast.success(t('address.defaultSet'))
            } else {
                toast.error(t('errors.setDefaultFailed'))
            }
        } catch (error) {
            console.error('Failed to set default address:', error)
            toast.error(t('errors.setDefaultFailed'))
        }
    }

    // Show loading while auth is initializing
    if (authLoading || !isAuthenticated) {
        return null
    }

    return (
        <div className="max-w-screen-xl mx-auto py-8 px-4 md:px-8">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight mb-8">{t('title')}</h1>

            <div className="grid gap-8 lg:grid-cols-3">
                {/* User Info Section */}
                <div className="lg:col-span-1">
                    <Card className="bg-card">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <UserIcon className="h-5 w-5" />
                                {t('info.title')}
                            </CardTitle>
                            <CardDescription>{t('info.description')}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                                    <UserIcon className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">{t('info.userId')}</p>
                                    <p className="font-medium">#{user?.id}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                                    <Mail className="h-6 w-6 text-primary" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm text-muted-foreground">{t('info.email')}</p>
                                    <p className="font-medium truncate">{userEmail}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                                    <Shield className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">{t('info.role')}</p>
                                    <Badge variant="secondary" className="capitalize">
                                        {userRole}
                                    </Badge>
                                </div>
                            </div>

                            <div className="pt-4 border-t">
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={logout}
                                >
                                    {t('logout')}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Addresses Section */}
                <div className="lg:col-span-2">
                    <Card className="bg-card">
                        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <MapPin className="h-5 w-5" />
                                    {t('addresses.title')}
                                </CardTitle>
                                <CardDescription>{t('addresses.description')}</CardDescription>
                            </div>
                            {addresses.length > 0 && (
                                <Button onClick={() => setShowAddressForm(true)}>
                                    <Plus className="h-4 w-4 me-2" />
                                    <span className="hidden sm:inline">{t('addresses.add')}</span>
                                    <span className="sm:hidden">Add</span>
                                </Button>
                            )}
                        </CardHeader>
                        <CardContent>
                            {isLoadingAddresses ? (
                                <div className="grid gap-4 sm:grid-cols-2">
                                    {[1, 2].map((i) => (
                                        <div key={i} className="p-4 border rounded-lg">
                                            <Skeleton className="h-4 w-1/3 mb-2" />
                                            <Skeleton className="h-4 w-2/3 mb-2" />
                                            <Skeleton className="h-4 w-1/2 mb-2" />
                                            <Skeleton className="h-4 w-1/4" />
                                        </div>
                                    ))}
                                </div>
                            ) : addresses.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                                        <MapPin className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                    <h3 className="text-lg font-medium mb-2">
                                        {t('addresses.empty')}
                                    </h3>
                                    <p className="text-muted-foreground text-sm mb-6 max-w-sm mx-auto">
                                        {t('addresses.description')}
                                    </p>
                                    <Button onClick={() => setShowAddressForm(true)} size="lg">
                                        <Plus className="h-4 w-4 me-2" />
                                        {t('addresses.addFirst')}
                                    </Button>
                                </div>
                            ) : (
                                <div className="grid gap-4 sm:grid-cols-2">
                                    {addresses.map((address) => (
                                        <AddressCard
                                            key={address.id}
                                            address={address}
                                            onEdit={() => {
                                                setEditingAddress(address)
                                                setShowAddressForm(true)
                                            }}
                                            onDelete={() => setDeletingAddress(address)}
                                            onSetDefault={() => handleSetDefault(address.id)}
                                        />
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Address Form Dialog */}
            <AddressFormDialog
                open={showAddressForm}
                onOpenChange={(open) => {
                    setShowAddressForm(open)
                    if (!open) setEditingAddress(null)
                }}
                address={editingAddress}
                onSave={handleSaveAddress}
                isSaving={isSaving}
            />

            {/* Delete Confirmation Dialog */}
            <DeleteAddressDialog
                open={!!deletingAddress}
                onOpenChange={(open) => !open && setDeletingAddress(null)}
                onConfirm={handleDeleteAddress}
                isDeleting={isDeleting}
            />
        </div>
    )
}
