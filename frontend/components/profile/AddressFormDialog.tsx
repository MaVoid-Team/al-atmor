"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { Address } from "@/context/AuthContext"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { RegionSelect } from "@/components/ui/region-select"
import { Loader2 } from "lucide-react"

interface AddressFormDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    address: Address | null
    onSave: (data: Partial<Address>) => Promise<void>
    isSaving?: boolean
}

interface AddressFormData {
    recipientName: string
    streetAddress: string
    district: string
    postalCode: string
    city: string
    buildingNumber: string
    secondaryNumber: string
    phoneNumber: string
    label: string
    isDefault: boolean
}

const initialFormData: AddressFormData = {
    recipientName: "",
    streetAddress: "",
    district: "",
    postalCode: "",
    city: "",
    buildingNumber: "",
    secondaryNumber: "",
    phoneNumber: "",
    label: "",
    isDefault: false,
}

export function AddressFormDialog({
    open,
    onOpenChange,
    address,
    onSave,
    isSaving = false,
}: AddressFormDialogProps) {
    const t = useTranslations("Profile")
    const [formData, setFormData] = useState<AddressFormData>(initialFormData)

    const isEditing = !!address

    // Reset form when dialog opens/closes or address changes
    useEffect(() => {
        if (open) {
            if (address) {
                setFormData({
                    recipientName: address.recipientName || "",
                    streetAddress: address.streetAddress || "",
                    district: address.district || "",
                    postalCode: address.postalCode || "",
                    city: address.city || "",
                    buildingNumber: address.buildingNumber || "",
                    secondaryNumber: address.secondaryNumber || "",
                    phoneNumber: address.phoneNumber || "",
                    label: address.label || "",
                    isDefault: address.isDefault || false,
                })
            } else {
                setFormData(initialFormData)
            }
        }
    }, [open, address])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleRegionChange = (value: string) => {
        setFormData((prev) => ({ ...prev, city: value }))
    }

    const handleDefaultChange = (checked: boolean) => {
        setFormData((prev) => ({ ...prev, isDefault: checked }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        await onSave({ ...formData, country: "Egypt" } as any)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {isEditing
                            ? t("addressForm.editTitle")
                            : t("addressForm.addTitle")}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? t("addressForm.editDescription")
                            : t("addressForm.addDescription")}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    {/* Country (Locked to Egypt) */}
                    <div className="space-y-2">
                        <Label htmlFor="country">
                            {t("addressForm.country") || "Country"}
                        </Label>
                        <Input
                            id="country"
                            value="Egypt"
                            readOnly
                            disabled
                            className="bg-muted"
                        />
                    </div>

                    {/* Recipient Name */}
                    <div className="space-y-2">
                        <Label htmlFor="recipientName">
                            {t("addressForm.recipientName")} *
                        </Label>
                        <Input
                            id="recipientName"
                            name="recipientName"
                            value={formData.recipientName}
                            onChange={handleChange}
                            placeholder={t("addressForm.recipientNamePlaceholder")}
                            required
                        />
                    </div>

                    {/* Phone Number */}
                    <div className="space-y-2">
                        <Label htmlFor="phoneNumber">
                            {t("addressForm.phoneNumber")}
                        </Label>
                        <Input
                            id="phoneNumber"
                            name="phoneNumber"
                            type="tel"
                            value={formData.phoneNumber}
                            onChange={handleChange}
                            placeholder={t("addressForm.phoneNumberPlaceholder")}
                            dir="ltr"
                        />
                    </div>

                    {/* Street Address */}
                    <div className="space-y-2">
                        <Label htmlFor="streetAddress">
                            {t("addressForm.streetAddress")} *
                        </Label>
                        <Input
                            id="streetAddress"
                            name="streetAddress"
                            value={formData.streetAddress}
                            onChange={handleChange}
                            placeholder={t("addressForm.streetAddressPlaceholder")}
                            required
                        />
                    </div>

                    {/* Building & Secondary Number */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="buildingNumber">
                                {t("addressForm.buildingNumber")}
                            </Label>
                            <Input
                                id="buildingNumber"
                                name="buildingNumber"
                                value={formData.buildingNumber}
                                onChange={handleChange}
                                placeholder={t("addressForm.buildingNumberPlaceholder")}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="secondaryNumber">
                                {t("addressForm.secondaryNumber")}
                            </Label>
                            <Input
                                id="secondaryNumber"
                                name="secondaryNumber"
                                value={formData.secondaryNumber}
                                onChange={handleChange}
                                placeholder={t("addressForm.secondaryNumberPlaceholder")}
                            />
                        </div>
                    </div>

                    {/* District */}
                    <div className="space-y-2">
                        <Label htmlFor="district">
                            {t("addressForm.district")} *
                        </Label>
                        <Input
                            id="district"
                            name="district"
                            value={formData.district}
                            onChange={handleChange}
                            placeholder={t("addressForm.districtPlaceholder")}
                            required
                        />
                    </div>

                    {/* City (Region) & Postal Code */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="city">
                                {t("addressForm.city")} *
                            </Label>
                            <RegionSelect
                                countryCode="EG"
                                value={formData.city}
                                onChange={handleRegionChange}
                                placeholder={t("addressForm.cityPlaceholder")}
                                className="w-full"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="postalCode">
                                {t("addressForm.postalCode")} *
                            </Label>
                            <Input
                                id="postalCode"
                                name="postalCode"
                                value={formData.postalCode}
                                onChange={handleChange}
                                placeholder={t("addressForm.postalCodePlaceholder")}
                                required
                            />
                        </div>
                    </div>

                    {/* Label */}
                    <div className="space-y-2">
                        <Label htmlFor="label">{t("addressForm.label")}</Label>
                        <Input
                            id="label"
                            name="label"
                            value={formData.label}
                            onChange={handleChange}
                            placeholder={t("addressForm.labelPlaceholder")}
                        />
                    </div>

                    {/* Set as Default */}
                    <div className="flex items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                            <Label htmlFor="isDefault" className="text-sm font-medium">
                                {t("addressForm.setAsDefault")}
                            </Label>
                            <p className="text-xs text-muted-foreground">
                                {t("addressForm.setAsDefaultDescription")}
                            </p>
                        </div>
                        <Switch
                            id="isDefault"
                            checked={formData.isDefault}
                            onCheckedChange={handleDefaultChange}
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col-reverse sm:flex-row gap-2 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="flex-1"
                            disabled={isSaving}
                        >
                            {t("addressForm.cancel")}
                        </Button>
                        <Button
                            type="submit"
                            className="flex-1"
                            disabled={isSaving}
                        >
                            {isSaving && (
                                <Loader2 className="h-4 w-4 me-2 animate-spin" />
                            )}
                            {isEditing
                                ? t("addressForm.update")
                                : t("addressForm.save")}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
