"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { useDiscounts, DiscountCode, UpdateDiscountRequest } from "@/hooks/useDiscounts"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"

interface EditPromoDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    discount: DiscountCode | null
    onSuccess?: () => void
}

export function EditPromoDialog({ open, onOpenChange, discount, onSuccess }: EditPromoDialogProps) {
    const t = useTranslations("Admin.PromoCodes")
    const { updateDiscount } = useDiscounts()
    const [isSubmitting, setIsSubmitting] = useState(false)

    const [formData, setFormData] = useState<UpdateDiscountRequest>({
        code: "",
        type: "percentage",
        value: 0,
        minPurchase: undefined,
        maxUses: undefined,
        validFrom: "",
        validTo: "",
        active: true,
    })

    // Populate form when discount changes
    useEffect(() => {
        if (discount) {
            setFormData({
                code: discount.code,
                type: discount.type,
                value: parseFloat(discount.value),
                minPurchase: discount.minPurchase ? parseFloat(discount.minPurchase) : undefined,
                maxUses: discount.maxUses || undefined,
                validFrom: discount.validFrom.split('T')[0], // Extract date part
                validTo: discount.validTo.split('T')[0],
                active: discount.active,
            })
        }
    }, [discount])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!discount) return

        setIsSubmitting(true)

        try {
            // Validate required fields
            if (!formData.code || !formData.value || !formData.validFrom || !formData.validTo) {
                toast.error(t("errors.requiredFields"))
                setIsSubmitting(false)
                return
            }

            const result = await updateDiscount(discount.id, formData)

            if (result) {
                toast.success(t("updateSuccess"))
                onOpenChange(false)
                onSuccess?.()
            } else {
                toast.error(t("updateFailed"))
            }
        } catch (error) {
            console.error("Failed to update promo code:", error)
            toast.error(t("updateFailed"))
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{t("editPromo")}</DialogTitle>
                    <DialogDescription>{t("editPromoDescription")}</DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Promo Code */}
                    <div className="space-y-2">
                        <Label htmlFor="code">{t("form.code")}</Label>
                        <Input
                            id="code"
                            placeholder={t("form.codePlaceholder")}
                            value={formData.code}
                            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                            required
                        />
                    </div>

                    {/* Type and Value */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="type">{t("form.type")}</Label>
                            <Select
                                value={formData.type}
                                onValueChange={(value: "percentage" | "fixed") =>
                                    setFormData({ ...formData, type: value })
                                }
                            >
                                <SelectTrigger id="type">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="percentage">{t("form.percentage")}</SelectItem>
                                    <SelectItem value="fixed">{t("form.fixed")}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="value">{t("form.value")}</Label>
                            <Input
                                id="value"
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="10"
                                value={formData.value || ""}
                                onChange={(e) =>
                                    setFormData({ ...formData, value: parseFloat(e.target.value) || 0 })
                                }
                                required
                            />
                        </div>
                    </div>

                    {/* Optional Fields */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="minPurchase">{t("form.minPurchase")}</Label>
                            <Input
                                id="minPurchase"
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder={t("form.optional")}
                                value={formData.minPurchase || ""}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        minPurchase: e.target.value ? parseFloat(e.target.value) : undefined,
                                    })
                                }
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="maxUses">{t("form.maxUses")}</Label>
                            <Input
                                id="maxUses"
                                type="number"
                                min="0"
                                placeholder={t("form.optional")}
                                value={formData.maxUses || ""}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        maxUses: e.target.value ? parseInt(e.target.value) : undefined,
                                    })
                                }
                            />
                        </div>
                    </div>

                    {/* Valid Dates */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="validFrom">{t("form.validFrom")}</Label>
                            <Input
                                id="validFrom"
                                type="date"
                                value={formData.validFrom}
                                onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="validTo">{t("form.validTo")}</Label>
                            <Input
                                id="validTo"
                                type="date"
                                value={formData.validTo}
                                onChange={(e) => setFormData({ ...formData, validTo: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    {/* Active Status */}
                    <div className="flex items-center justify-between space-x-2 p-4 border rounded-lg">
                        <div className="space-y-0.5">
                            <Label htmlFor="active" className="font-medium">
                                {t("form.active")}
                            </Label>
                            <p className="text-sm text-muted-foreground">{t("form.activeDescription")}</p>
                        </div>
                        <Switch
                            id="active"
                            checked={formData.active}
                            onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            {t("form.cancel")}
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? t("form.updating") : t("form.update")}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
