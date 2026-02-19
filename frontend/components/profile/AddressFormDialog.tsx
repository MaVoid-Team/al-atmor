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
    const [errors, setErrors] = useState<Partial<Record<keyof AddressFormData, string>>>({})

    const isEditing = !!address

    // Reset form when dialog opens/closes or address changes
    useEffect(() => {
        if (open) {
            setErrors({})
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

    const validate = () => {
        const newErrors: Partial<Record<keyof AddressFormData, string>> = {}

        if (!formData.recipientName.trim()) newErrors.recipientName = t("addressForm.validation.recipientRequired")
        if (!formData.streetAddress.trim()) newErrors.streetAddress = t("addressForm.validation.streetRequired")
        if (!formData.district.trim()) newErrors.district = t("addressForm.validation.districtRequired")
        if (!formData.city.trim()) newErrors.city = t("addressForm.validation.cityRequired")

        if (!formData.postalCode.trim()) {
            newErrors.postalCode = t("addressForm.validation.postalRequired")
        } else if (!/^\d{5}$/.test(formData.postalCode)) {
            newErrors.postalCode = t("addressForm.validation.postalInvalid")
        }

        if (formData.phoneNumber && !/^\+?[0-9\s-]{10,20}$/.test(formData.phoneNumber)) {
            newErrors.phoneNumber = t("addressForm.validation.phoneInvalid")
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
        // Clear error when user types
        if (errors[name as keyof AddressFormData]) {
            setErrors(prev => ({ ...prev, [name]: undefined }))
        }
    }

    const handleRegionChange = (value: string) => {
        setFormData((prev) => ({ ...prev, city: value }))
        if (errors.city) setErrors(prev => ({ ...prev, city: undefined }))
    }

    const handleDefaultChange = (checked: boolean) => {
        setFormData((prev) => ({ ...prev, isDefault: checked }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (validate()) {
            await onSave({ ...formData, country: "Egypt" } as any)
        }
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
                            className={errors.recipientName ? "border-destructive focus-visible:ring-destructive" : ""}
                        />
                        {errors.recipientName && (
                            <p className="text-xs text-destructive mt-1">{errors.recipientName}</p>
                        )}
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
                            className={errors.phoneNumber ? "border-destructive focus-visible:ring-destructive" : ""}
                            dir="ltr"
                        />
                        {errors.phoneNumber && (
                            <p className="text-xs text-destructive mt-1">{errors.phoneNumber}</p>
                        )}
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
                            className={errors.streetAddress ? "border-destructive focus-visible:ring-destructive" : ""}
                        />
                        {errors.streetAddress && (
                            <p className="text-xs text-destructive mt-1">{errors.streetAddress}</p>
                        )}
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
                            className={errors.district ? "border-destructive focus-visible:ring-destructive" : ""}
                        />
                        {errors.district && (
                            <p className="text-xs text-destructive mt-1">{errors.district}</p>
                        )}
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
                                className={errors.city ? "border-destructive focus-visible:ring-destructive w-full" : "w-full"}
                            />
                            {errors.city && (
                                <p className="text-xs text-destructive mt-1">{errors.city}</p>
                            )}
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
                                className={errors.postalCode ? "border-destructive focus-visible:ring-destructive" : ""}
                            />
                            {errors.postalCode && (
                                <p className="text-xs text-destructive mt-1">{errors.postalCode}</p>
                            )}
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
