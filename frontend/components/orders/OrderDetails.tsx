"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useTranslations, useLocale } from "next-intl"
import { Package, MapPin, CreditCard, Calendar, User, Tag, Truck } from "lucide-react"
import Image from "next/image"
import { useState, useEffect } from "react"
import { toast } from "sonner"

interface OrderItem {
    id: number
    productId: number
    orderId: number
    quantity: number
    priceAtPurchase: string
    createdAt: string
    productName?: string
    productImage?: string
}

interface Order {
    id: number
    userId?: number
    userName?: string
    userEmail?: string
    status: string
    paymentStatus?: string
    total: number
    shipping: number
    tax: number
    subtotal: number
    metadata?: {
        discountCode?: string
        discountAmount?: number
        discountCodeId?: number
        addressId?: number
    }
    location?: {
        id: number
        name: string
        city: string
        taxRate?: string
        shippingRate?: string
    }
    shippingAddress?: {
        fullName?: string
        addressLine1?: string
        addressLine2?: string
        city?: string
        state?: string
        postalCode?: string
        country?: string
        phoneNumber?: string
        label?: string
    }
    items: OrderItem[]
    createdAt: string
    updatedAt: string
}

interface OrderDetailsProps {
    order: Order
    isAdmin?: boolean
    onStatusUpdate?: (orderId: number, status: string, paymentStatus?: string) => Promise<void>
    onOrderUpdated?: () => void
}

export function OrderDetails({ order, isAdmin = false, onStatusUpdate, onOrderUpdated }: OrderDetailsProps) {
    const t = useTranslations("OrderDetails")
    const locale = useLocale()
    const isRtl = locale === "ar"
    const [isUpdating, setIsUpdating] = useState(false)
    const [selectedStatus, setSelectedStatus] = useState(order.status)
    const [selectedPaymentStatus, setSelectedPaymentStatus] = useState(order.paymentStatus || "unpaid")

    // Update local state when order prop changes
    useEffect(() => {
        setSelectedStatus(order.status)
        setSelectedPaymentStatus(order.paymentStatus || "unpaid")
    }, [order.status, order.paymentStatus])

    const statusColors: Record<string, string> = {
        pending: "bg-muted text-muted-foreground",
        processing: "bg-primary/10 text-primary",
        completed: "bg-secondary/10 text-secondary-foreground",
        canceled: "bg-destructive/10 text-destructive",
    }

    const paymentStatusColors: Record<string, string> = {
        unpaid: "bg-destructive/10 text-destructive",
        paid: "bg-secondary/10 text-secondary-foreground",
        refunded: "bg-muted text-muted-foreground",
    }

    const handleStatusUpdate = async () => {
        if (!onStatusUpdate) return

        const statusChanged = selectedStatus !== order.status
        const paymentChanged = selectedPaymentStatus !== order.paymentStatus

        if (!statusChanged && !paymentChanged) return

        setIsUpdating(true)
        try {
            await onStatusUpdate(order.id, selectedStatus, selectedPaymentStatus)
            toast.success(t("statusUpdated"))
            onOrderUpdated?.()
        } catch (error) {
            toast.error(t("statusUpdateFailed"))
        } finally {
            setIsUpdating(false)
        }
    }

    const hasChanges = selectedStatus !== order.status || selectedPaymentStatus !== order.paymentStatus

    return (
        <div className="space-y-6">
            {/* Order Header */}
            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <CardTitle className="text-2xl">
                                {t("orderNumber")} #{order.id}
                            </CardTitle>
                            <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                {new Date(order.createdAt).toLocaleDateString()}
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <Badge className={statusColors[order.status] || "bg-muted text-muted-foreground"}>
                                {t(`status.${order.status}`)}
                            </Badge>
                            {order.paymentStatus && (
                                <Badge className={paymentStatusColors[order.paymentStatus] || "bg-muted text-muted-foreground"}>
                                    {t(`paymentStatus.${order.paymentStatus}`)}
                                </Badge>
                            )}
                        </div>
                    </div>
                </CardHeader>

                {/* Admin Status Update */}
                {isAdmin && onStatusUpdate && (
                    <CardContent className="border-t pt-6">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex items-center gap-2">
                                <label className="text-sm font-medium whitespace-nowrap">{t("updateStatus")}:</label>
                                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                                    <SelectTrigger className="w-[160px]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="pending">{t("status.pending")}</SelectItem>
                                        <SelectItem value="processing">{t("status.processing")}</SelectItem>
                                        <SelectItem value="completed">{t("status.completed")}</SelectItem>
                                        <SelectItem value="canceled">{t("status.canceled")}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-center gap-2">
                                <label className="text-sm font-medium whitespace-nowrap">{t("updatePayment")}:</label>
                                <Select value={selectedPaymentStatus} onValueChange={setSelectedPaymentStatus}>
                                    <SelectTrigger className="w-[140px]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="unpaid">{t("paymentStatus.unpaid")}</SelectItem>
                                        <SelectItem value="paid">{t("paymentStatus.paid")}</SelectItem>
                                        <SelectItem value="refunded">{t("paymentStatus.refunded")}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button
                                onClick={handleStatusUpdate}
                                disabled={isUpdating || !hasChanges}
                                size="sm"
                            >
                                {isUpdating ? t("updating") : t("update")}
                            </Button>
                        </div>
                    </CardContent>
                )}
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Customer Information (Admin Only) */}
                {isAdmin && (order.userName || order.userEmail) && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                {t("customerInfo")}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {order.userName && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">{t("name")}:</span>
                                    <span className="font-medium">{order.userName}</span>
                                </div>
                            )}
                            {order.userEmail && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">{t("email")}:</span>
                                    <span className="font-medium">{order.userEmail}</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Delivery Location */}
                {order.location && (
                    <Card className={isAdmin && (order.userName || order.userEmail) ? "" : "md:col-span-2"}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Truck className="h-5 w-5" />
                                {t("deliveryLocation")}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">{t("locationName")}:</span>
                                <span className="font-medium">{order.location.name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">{t("city")}:</span>
                                <span className="font-medium">{order.location.city}</span>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Shipping Address */}
                {order.shippingAddress ? (
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MapPin className="h-5 w-5" />
                                {t("shippingAddress")}
                                {order.shippingAddress.label && (
                                    <Badge variant="outline" className="text-xs font-normal">
                                        {order.shippingAddress.label}
                                    </Badge>
                                )}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {order.shippingAddress.fullName && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">{t("recipientName")}:</span>
                                    <span className="font-medium">{order.shippingAddress.fullName}</span>
                                </div>
                            )}
                            {order.shippingAddress.addressLine1 && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">{t("street")}:</span>
                                    <span className="font-medium">{order.shippingAddress.addressLine1}</span>
                                </div>
                            )}
                            {order.shippingAddress.addressLine2 && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">{t("building")}:</span>
                                    <span className="font-medium">{order.shippingAddress.addressLine2}</span>
                                </div>
                            )}
                            {order.shippingAddress.state && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">{t("district")}:</span>
                                    <span className="font-medium">{order.shippingAddress.state}</span>
                                </div>
                            )}
                            {order.shippingAddress.city && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">{t("city")}:</span>
                                    <span className="font-medium">{order.shippingAddress.city}</span>
                                </div>
                            )}
                            {order.shippingAddress.postalCode && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">{t("postalCode")}:</span>
                                    <span className="font-medium">{order.shippingAddress.postalCode}</span>
                                </div>
                            )}
                            {order.shippingAddress.country && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">{t("country")}:</span>
                                    <span className="font-medium">{order.shippingAddress.country}</span>
                                </div>
                            )}
                            {order.shippingAddress.phoneNumber && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">{t("phone")}:</span>
                                    <span className="font-medium">{order.shippingAddress.phoneNumber}</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ) : !order.location && (
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MapPin className="h-5 w-5" />
                                {t("shippingAddress")}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground text-sm">{t("noShippingAddress")}</p>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Order Items */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        {t("orderItems")}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {order.items.map((item) => {
                            const price = parseFloat(item.priceAtPurchase)
                            const total = price * item.quantity
                            return (
                                <div key={item.id} className="flex items-center gap-4 pb-4 border-b last:border-0 last:pb-0">
                                    {item.productImage && (
                                        <div className="relative h-16 w-16 rounded-md overflow-hidden bg-muted">
                                            <Image
                                                src={item.productImage}
                                                alt={item.productName || `Product ${item.productId}`}
                                                fill
                                                unoptimized
                                                className="object-cover"
                                            />
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <h4 className="font-medium">
                                            {item.productName || `Product ID: ${item.productId}`}
                                        </h4>
                                        <p className="text-sm text-muted-foreground">
                                            {t("quantity")}: {item.quantity} × {price.toLocaleString()} {t("currency")}
                                        </p>
                                    </div>
                                    <div className="text-end">
                                        <p className="font-semibold">
                                            {total.toLocaleString()} {t("currency")}
                                        </p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    <Separator className="my-4" />

                    {/* Price Breakdown */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">{t("subtotal")}</span>
                            <span>{order.subtotal.toLocaleString()} {t("currency")}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">{t("shipping")}</span>
                            <span>
                                {order.shipping === 0
                                    ? t("free")
                                    : `${order.shipping.toLocaleString()} ${t("currency")}`}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">{t("tax")}</span>
                            <span>{order.tax.toLocaleString()} {t("currency")}</span>
                        </div>
                        {order.metadata?.discountAmount && order.metadata.discountAmount > 0 && (
                            <div className="flex justify-between text-sm text-primary">
                                <span className="flex items-center gap-1">
                                    <Tag className="h-3 w-3" />
                                    {t("discount")}
                                    {order.metadata.discountCode && (
                                        <span className="font-mono text-xs bg-primary/10 px-1.5 py-0.5 rounded">
                                            {order.metadata.discountCode}
                                        </span>
                                    )}
                                </span>
                                <span>-{order.metadata.discountAmount.toLocaleString()} {t("currency")}</span>
                            </div>
                        )}
                        <Separator />
                        <div className="flex justify-between text-lg font-bold">
                            <span>{t("total")}</span>
                            <span>{order.total.toLocaleString()} {t("currency")}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Payment Information */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        {t("paymentMethod")}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">{t("cashOnDelivery")}</p>
                </CardContent>
            </Card>
        </div>
    )
}
