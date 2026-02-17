"use client"

import { useTranslations } from "next-intl"
import { Address } from "@/context/AuthContext"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MapPin, Phone, MoreVertical, Pencil, Trash2, Star } from "lucide-react"

interface AddressCardProps {
    address: Address
    onEdit: () => void
    onDelete: () => void
    onSetDefault: () => void
    isSelected?: boolean
    onSelect?: () => void
    selectable?: boolean
}

export function AddressCard({
    address,
    onEdit,
    onDelete,
    onSetDefault,
    isSelected = false,
    onSelect,
    selectable = false,
}: AddressCardProps) {
    const t = useTranslations("Profile")

    const handleCardClick = () => {
        if (selectable && onSelect) {
            onSelect()
        }
    }

    return (
        <Card
            className={`relative transition-all ${selectable ? "cursor-pointer hover:border-primary" : ""
                } ${isSelected ? "border-primary border-2 bg-primary/5" : ""}`}
            onClick={handleCardClick}
        >
            <CardContent className="p-4">
                {/* Header with label and actions */}
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                        {address.label && (
                            <span className="font-semibold text-sm">
                                {address.label}
                            </span>
                        )}
                        {address.isDefault && (
                            <Badge variant="secondary" className="text-xs">
                                {t("addresses.default")}
                            </Badge>
                        )}
                    </div>

                    {!selectable && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <MoreVertical className="h-4 w-4" />
                                    <span className="sr-only">{t("addresses.actions")}</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={onEdit}>
                                    <Pencil className="h-4 w-4 me-2" />
                                    {t("addresses.edit")}
                                </DropdownMenuItem>
                                {!address.isDefault && (
                                    <DropdownMenuItem onClick={onSetDefault}>
                                        <Star className="h-4 w-4 me-2" />
                                        {t("addresses.setDefault")}
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuItem
                                    onClick={onDelete}
                                    className="text-destructive focus:text-destructive"
                                >
                                    <Trash2 className="h-4 w-4 me-2" />
                                    {t("addresses.delete")}
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>

                {/* Recipient Name */}
                <p className="font-medium text-sm mb-2">{address.recipientName}</p>

                {/* Address Details */}
                <div className="flex items-start gap-2 text-muted-foreground text-sm mb-2">
                    <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                        <p>{address.streetAddress}</p>
                        {address.buildingNumber && (
                            <p>
                                {t("addresses.building")}: {address.buildingNumber}
                                {address.secondaryNumber && `, ${address.secondaryNumber}`}
                            </p>
                        )}
                        <p>
                            {address.district}, {address.city}
                        </p>
                        {address.postalCode && <p>{address.postalCode}</p>}
                    </div>
                </div>

                {/* Phone Number */}
                {address.phoneNumber && (
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                        <Phone className="h-4 w-4 shrink-0" />
                        <p dir="ltr">{address.phoneNumber}</p>
                    </div>
                )}

                {/* Selection indicator for selectable cards */}
                {selectable && isSelected && (
                    <div className="absolute top-2 end-2">
                        <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                            <svg
                                className="h-3 w-3 text-primary-foreground"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={3}
                                    d="M5 13l4 4L19 7"
                                />
                            </svg>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
