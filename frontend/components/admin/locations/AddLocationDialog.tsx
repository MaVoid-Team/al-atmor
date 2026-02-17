"use client"

import { useState, FormEvent } from "react"
import { useTranslations } from "next-intl"
import { CreateLocationInput } from "@/hooks/useAdminLocations"
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
import { Percent } from "lucide-react"
import { RegionSelect } from "@/components/ui/region-select"

interface AddLocationDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSubmit: (data: CreateLocationInput) => Promise<void>
}

interface FormData {
    name: string
    city: string
    taxRate: string
    shippingRate: string
    active: boolean
}

const initialFormData: FormData = {
    name: "",
    city: "",
    taxRate: "",
    shippingRate: "",
    active: true,
}

export function AddLocationDialog({ open, onOpenChange, onSubmit }: AddLocationDialogProps) {
    const t = useTranslations("Admin.Locations")
    const [formData, setFormData] = useState<FormData>(initialFormData)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const resetForm = () => {
        setFormData(initialFormData)
    }

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            const input: CreateLocationInput = {
                name: formData.name,
                city: formData.city,
                taxRate: parseFloat(formData.taxRate) / 100,
                shippingRate: parseFloat(formData.shippingRate) / 100,
                active: formData.active,
            }

            await onSubmit(input)
            resetForm()
            onOpenChange(false)
        } catch (error) {
            // Error is handled by parent or toast in parent
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={(val) => {
            onOpenChange(val)
            if (!val) resetForm()
        }}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{t("addDialog.title")}</DialogTitle>
                    <DialogDescription>{t("addDialog.description")}</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">{t("form.name")} *</Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            placeholder={t("form.namePlaceholder")}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="city">{t("form.city")} *</Label>
                        <RegionSelect
                            countryCode="SA"
                            value={formData.city}
                            onChange={(value) => setFormData(prev => ({ ...prev, city: value }))}
                            placeholder={t("form.cityPlaceholder")}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="taxRate">{t("form.taxRate")} *</Label>
                            <div className="relative">
                                <Input
                                    id="taxRate"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max="100"
                                    value={formData.taxRate}
                                    onChange={(e) => setFormData(prev => ({ ...prev, taxRate: e.target.value }))}
                                    placeholder="15"
                                    required
                                    className="pe-8"
                                />
                                <Percent className="absolute end-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="shippingRate">{t("form.shippingRate")} *</Label>
                            <div className="relative">
                                <Input
                                    id="shippingRate"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max="100"
                                    value={formData.shippingRate}
                                    onChange={(e) => setFormData(prev => ({ ...prev, shippingRate: e.target.value }))}
                                    placeholder="5"
                                    required
                                    className="pe-8"
                                />
                                <Percent className="absolute end-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                            <Label htmlFor="active" className="text-sm font-medium">
                                {t("form.active")}
                            </Label>
                            <p className="text-xs text-muted-foreground">
                                {t("form.activeDescription")}
                            </p>
                        </div>
                        <Switch
                            id="active"
                            checked={formData.active}
                            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, active: checked }))}
                        />
                    </div>

                    <div className="flex gap-2 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                onOpenChange(false)
                                resetForm()
                            }}
                            className="flex-1"
                            disabled={isSubmitting}
                        >
                            {t("form.cancel")}
                        </Button>
                        <Button type="submit" className="flex-1" disabled={isSubmitting}>
                            {isSubmitting ? t("form.creating") : t("form.create")}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
