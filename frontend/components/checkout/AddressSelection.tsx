"use client"

import { useTranslations } from "next-intl"
import { Address } from "@/context/AuthContext"
import { AddressCard } from "@/components/profile/AddressCard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus, MapPin } from "lucide-react"

interface AddressSelectionProps {
    addresses: Address[]
    selectedAddressId: number | null
    onSelectAddress: (address: Address) => void
    onAddNewAddress: () => void
    isLoading?: boolean
}

export function AddressSelection({
    addresses,
    selectedAddressId,
    onSelectAddress,
    onAddNewAddress,
    isLoading = false,
}: AddressSelectionProps) {
    const t = useTranslations("Checkout")

    if (isLoading) {
        return (
            <Card className="bg-card">
                <CardHeader>
                    <CardTitle>{t("addressSelection.title")}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 sm:grid-cols-2">
                        {[1, 2].map((i) => (
                            <div key={i} className="p-4 border rounded-lg">
                                <Skeleton className="h-4 w-1/3 mb-2" />
                                <Skeleton className="h-4 w-2/3 mb-2" />
                                <Skeleton className="h-4 w-1/2" />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (addresses.length === 0) {
        return (
            <Card className="bg-card">
                <CardHeader>
                    <CardTitle>{t("addressSelection.title")}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8">
                        <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                        <p className="text-muted-foreground mb-4">
                            {t("addressSelection.noAddresses")}
                        </p>
                        <Button onClick={onAddNewAddress}>
                            <Plus className="h-4 w-4 me-2" />
                            {t("addressSelection.addAddress")}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-lg">{t("addressSelection.title")}</CardTitle>
                <Button variant="outline" size="sm" onClick={onAddNewAddress}>
                    <Plus className="h-4 w-4 me-2" />
                    <span className="hidden sm:inline">{t("addressSelection.addNewAddress")}</span>
                    <span className="sm:hidden">{t("addressSelection.add")}</span>
                </Button>
            </CardHeader>
            <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                    {addresses.map((address) => (
                        <AddressCard
                            key={address.id}
                            address={address}
                            isSelected={address.id === selectedAddressId}
                            onSelect={() => onSelectAddress(address)}
                            selectable
                            onEdit={() => { }}
                            onDelete={() => { }}
                            onSetDefault={() => { }}
                        />
                    ))}
                </div>

                {!selectedAddressId && (
                    <p className="text-sm text-destructive mt-4">
                        {t("addressSelection.pleaseSelect")}
                    </p>
                )}
            </CardContent>
        </Card>
    )
}
