"use client"

import { useState, FormEvent } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Package } from "lucide-react"

interface RestockDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onRestock: (quantity: number) => Promise<void>
    productName: string
    currentStock: number
    isLoading?: boolean
}

export default function RestockDialog({
    open,
    onOpenChange,
    onRestock,
    productName,
    currentStock,
    isLoading = false,
}: RestockDialogProps) {
    const t = useTranslations("Admin.Products")
    const [quantity, setQuantity] = useState("")

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        const qty = parseInt(quantity)
        if (qty > 0) {
            await onRestock(qty)
            setQuantity("")
            onOpenChange(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        {t("restockProduct")}
                    </DialogTitle>
                    <DialogDescription>
                        {t("restockDescription", { product: productName })}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit}>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>{t("currentStock")}</Label>
                            <div className="text-2xl font-bold text-primary">
                                {currentStock} {t("units")}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="quantity">{t("quantityToAdd")} *</Label>
                            <Input
                                id="quantity"
                                type="number"
                                min="1"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                placeholder={t("enterQuantity")}
                                required
                                disabled={isLoading}
                            />
                        </div>

                        {quantity && parseInt(quantity) > 0 && (
                            <div className="space-y-2">
                                <Label>{t("newStockLevel")}</Label>
                                <div className="text-xl font-semibold text-primary">
                                    {currentStock + parseInt(quantity)} {t("units")}
                                </div>
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isLoading}
                        >
                            {t("cancel")}
                        </Button>
                        <Button type="submit" disabled={isLoading || !quantity || parseInt(quantity) <= 0}>
                            {isLoading ? t("restocking") : t("restock")}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
