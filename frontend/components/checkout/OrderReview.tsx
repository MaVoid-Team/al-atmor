"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ArrowLeft, MapPin, Wallet, FileText, Check, CreditCard, Banknote, MapPinned } from "lucide-react"
import { ShippingData } from "@/app/[locale]/checkout/page"
import { CartData } from "@/context/CartContext"
import { Location } from "@/types/location"
import Link from "next/link"

export type PaymentType = "cash" | "card"

interface OrderReviewProps {
    shippingData: ShippingData
    cartData: CartData | null
    onPlaceOrder: (paymentType: PaymentType) => void
    onBack: () => void
    isCheckingOut?: boolean
    selectedLocation?: Location
}

export function OrderReview({
    shippingData,
    cartData,
    onPlaceOrder,
    onBack,
    isCheckingOut,
    selectedLocation
}: OrderReviewProps) {
    const t = useTranslations('Checkout')
    const tCommon = useTranslations('Common')
    const [paymentType, setPaymentType] = useState<PaymentType>("cash")

    const subtotal = cartData?.totals?.subtotal || 0

    // Calculate shipping and tax from selected location if available
    let shipping = 0
    let tax = 0

    if (selectedLocation) {
        const shippingRate = parseFloat(selectedLocation.shippingRate) || 0
        shipping = subtotal * shippingRate

        const taxRate = parseFloat(selectedLocation.taxRate) || 0
        tax = subtotal * taxRate
    } else {
        shipping = cartData?.totals?.shipping || 0
        tax = cartData?.totals?.tax || 0
    }

    const total = subtotal + shipping + tax

    const handlePlaceOrder = () => {
        onPlaceOrder(paymentType)
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Check className="h-5 w-5" />
                    {t('review.title')}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Shipping Address */}
                <div>
                    <h3 className="font-semibold flex items-center gap-2 mb-3">
                        <MapPin className="h-4 w-4" />
                        {t('review.shippingAddress')}
                    </h3>
                    <div className="text-sm text-muted-foreground space-y-1 ps-6">
                        <p>{shippingData.firstName} {shippingData.lastName}</p>
                        <p>{shippingData.address}</p>
                        <p>{shippingData.city}, {shippingData.state} {shippingData.zipCode}</p>
                        <p>{shippingData.country}</p>
                        <p>{shippingData.phone}</p>
                        <p>{shippingData.email}</p>
                    </div>
                </div>

                {/* Delivery Location (for tax/shipping) */}
                {selectedLocation && (
                    <>
                        <Separator />
                        <div>
                            <h3 className="font-semibold flex items-center gap-2 mb-3">
                                <MapPinned className="h-4 w-4" />
                                {t('locationSelector.title')}
                            </h3>
                            <div className="text-sm text-muted-foreground ps-6">
                                <p className="font-medium text-foreground">{selectedLocation.name}</p>
                                <p>{selectedLocation.city}</p>
                                <div className="flex gap-4 mt-2">
                                    <span>
                                        {t('locationSelector.shippingRate')}: {(parseFloat(selectedLocation.shippingRate) * 100).toFixed(0)}%
                                    </span>
                                    <span>
                                        {t('locationSelector.taxRate')}: {(parseFloat(selectedLocation.taxRate) * 100).toFixed(0)}%
                                    </span>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                <Separator />

                {/* Payment Method Selection */}
                <div>
                    <h3 className="font-semibold flex items-center gap-2 mb-3">
                        <Wallet className="h-4 w-4" />
                        {t('review.paymentMethod')}
                    </h3>
                    <RadioGroup
                        value={paymentType}
                        onValueChange={(value) => setPaymentType(value as PaymentType)}
                        className="space-y-3 ps-6"
                    >
                        <div className="flex items-center space-x-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors">
                            <RadioGroupItem value="cash" id="cash" />
                            <Label htmlFor="cash" className="flex items-center gap-3 cursor-pointer flex-1">
                                <Banknote className="h-5 w-5 text-secondary" />
                                <div>
                                    <p className="font-medium">{t('review.cashOnDelivery')}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {t('review.cashDescription')}
                                    </p>
                                </div>
                            </Label>
                        </div>
                        <div className="flex items-center space-x-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors">
                            <RadioGroupItem value="card" id="card" />
                            <Label htmlFor="card" className="flex items-center gap-3 cursor-pointer flex-1">
                                <CreditCard className="h-5 w-5 text-primary" />
                                <div>
                                    <p className="font-medium">{t('review.cardPayment')}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {t('review.cardDescription')}
                                    </p>
                                </div>
                            </Label>
                        </div>
                    </RadioGroup>
                </div>

                <Separator />

                {/* Cost Breakdown */}
                <div>
                    <h3 className="font-semibold flex items-center gap-2 mb-3">
                        <FileText className="h-4 w-4" />
                        {t('review.costBreakdown')}
                    </h3>
                    <div className="text-sm space-y-2 ps-6">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">{t('summary.subtotal')}</span>
                            <span>{tCommon('currency')} {subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground flex items-center gap-1">
                                {t('summary.shipping')}
                                {selectedLocation && (
                                    <span className="text-xs">
                                        ({(parseFloat(selectedLocation.shippingRate) * 100).toFixed(0)}%)
                                    </span>
                                )}
                            </span>
                            <span>
                                {shipping === 0
                                    ? t('summary.free')
                                    : `${tCommon('currency')} ${shipping.toFixed(2)}`
                                }
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground flex items-center gap-1">
                                {t('summary.tax')}
                                {selectedLocation && (
                                    <span className="text-xs">
                                        ({(parseFloat(selectedLocation.taxRate) * 100).toFixed(0)}%)
                                    </span>
                                )}
                            </span>
                            <span>{tCommon('currency')} {tax.toFixed(2)}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-semibold text-base">
                            <span>{t('summary.total')}</span>
                            <span>{tCommon('currency')} {total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                <Separator />

                {/* Policy Links */}
                <div className="text-xs text-muted-foreground">
                    <p className="mb-2">{t('review.policyText')}</p>
                    <div className="flex flex-wrap gap-3">
                        <Link href="/terms-and-conditions" className="hover:underline text-primary">
                            {t('review.termsAndConditions')}
                        </Link>
                        <span>•</span>
                        <Link href="/returns-exchanges" className="hover:underline text-primary">
                            {t('review.returnsAndExchanges')}
                        </Link>
                    </div>
                </div>

                <Separator />

                <div className="flex gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onBack}
                        className="flex-1"
                        disabled={isCheckingOut}
                    >
                        <ArrowLeft className="h-4 w-4 me-2" />
                        {t('review.back')}
                    </Button>
                    <Button
                        onClick={handlePlaceOrder}
                        className="flex-1"
                        size="lg"
                        disabled={isCheckingOut}
                    >
                        {isCheckingOut ? t('processingOrder') : (
                            paymentType === "card" ? t('review.proceedToPayment') : t('review.placeOrder')
                        )}
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
