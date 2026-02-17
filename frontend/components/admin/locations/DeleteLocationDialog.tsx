"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { AdminLocation } from "@/hooks/useAdminLocations"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface DeleteLocationDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    location: AdminLocation | null
    onConfirm: (id: number) => Promise<void>
}

export function DeleteLocationDialog({ open, onOpenChange, location, onConfirm }: DeleteLocationDialogProps) {
    const t = useTranslations("Admin.Locations")
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleConfirm = async () => {
        if (!location) return
        setIsSubmitting(true)

        try {
            await onConfirm(location.id)
            onOpenChange(false)
        } catch (error) {
            // Error handling in parent
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!location) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t("deleteDialog.title")}</DialogTitle>
                    <DialogDescription>
                        {t("deleteDialog.description", { name: location.name })}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isSubmitting}
                    >
                        {t("form.cancel")}
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleConfirm}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? t("form.deleting") : t("form.delete")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
