"use client"

import { useEffect, useState } from "react"
import { useRouter } from "@/i18n/navigation"
import { useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, XCircle, Loader2, AlertCircle } from "lucide-react"

type PaymentStatus = "loading" | "success" | "failed" | "pending"

export default function CheckoutSuccessPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const t = useTranslations('Checkout.success')

    const orderId = searchParams.get('orderId')
    const statusParam = searchParams.get('status')
    const successParam = searchParams.get('success')
    const pendingParam = searchParams.get('pending')

    const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("loading")

    useEffect(() => {
        // Determine payment status from URL params
        // Paymob redirects with success=true/false or pending=true
        if (statusParam === "success" || successParam === "true") {
            setPaymentStatus("success")
        } else if (successParam === "false") {
            setPaymentStatus("failed")
        } else if (pendingParam === "true") {
            setPaymentStatus("pending")
        } else if (orderId) {
            // If we have an orderId but no status, assume success (cash payment)
            setPaymentStatus("success")
        } else {
            // No orderId and no clear status - likely a failed payment
            setPaymentStatus("failed")
        }
    }, [statusParam, successParam, pendingParam, orderId])

    const renderContent = () => {
        switch (paymentStatus) {
            case "loading":
                return (
                    <>
                        <div className="rounded-full bg-muted p-6">
                            <Loader2 className="h-16 w-16 text-muted-foreground animate-spin" />
                        </div>
                        <div className="text-center space-y-2">
                            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">{t('processing')}</h1>
                            <p className="text-muted-foreground max-w-md">
                                {t('processingDescription')}
                            </p>
                        </div>
                    </>
                )

            case "success":
                return (
                    <>
                        <div className="rounded-full p-6">
                            <CheckCircle className="h-16 w-16 text-secondary-foreground" />
                        </div>
                        <div className="text-center space-y-2">
                            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">{t('title')}</h1>
                            <p className="text-muted-foreground max-w-md">
                                {t('description')}
                            </p>
                        </div>
                        {orderId && (
                            <div className="bg-muted rounded-lg px-6 py-3">
                                <p className="text-sm text-muted-foreground">{t('orderNumber')}</p>
                                <p className="text-lg font-semibold">#{orderId}</p>
                            </div>
                        )}
                        <div className="flex gap-4 mt-4">
                            <Button
                                size="lg"
                                onClick={() => router.push('/orders')}
                                className="px-8"
                            >
                                {t('viewOrders')}
                            </Button>
                            <Button
                                variant="outline"
                                size="lg"
                                onClick={() => router.push('/products')}
                            >
                                {t('continueShopping')}
                            </Button>
                        </div>
                    </>
                )

            case "pending":
                return (
                    <>
                        <div className="rounded-full bg-muted p-6">
                            <AlertCircle className="h-16 w-16 text-muted-foreground" />
                        </div>
                        <div className="text-center space-y-2">
                            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">{t('pendingTitle')}</h1>
                            <p className="text-muted-foreground max-w-md">
                                {t('pendingDescription')}
                            </p>
                        </div>
                        <div className="flex gap-4 mt-4">
                            <Button
                                size="lg"
                                onClick={() => router.push('/orders')}
                                className="px-8"
                            >
                                {t('viewOrders')}
                            </Button>
                            <Button
                                variant="outline"
                                size="lg"
                                onClick={() => router.push('/products')}
                            >
                                {t('continueShopping')}
                            </Button>
                        </div>
                    </>
                )

            case "failed":
                return (
                    <>
                        <div className="rounded-full bg-destructive/10 p-6">
                            <XCircle className="h-16 w-16 text-destructive" />
                        </div>
                        <div className="text-center space-y-2">
                            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">{t('failedTitle')}</h1>
                            <p className="text-muted-foreground max-w-md">
                                {t('failedDescription')}
                            </p>
                        </div>
                        <div className="flex gap-4 mt-4">
                            <Button
                                size="lg"
                                onClick={() => router.push('/checkout')}
                                className="px-8"
                            >
                                {t('tryAgain')}
                            </Button>
                            <Button
                                variant="outline"
                                size="lg"
                                onClick={() => router.push('/products')}
                            >
                                {t('continueShopping')}
                            </Button>
                        </div>
                    </>
                )
        }
    }

    return (
        <div className="container max-w-screen-3xl py-8 px-4 md:px-16 lg:px-32 xl:px-64">
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
                {renderContent()}
            </div>
        </div>
    )
}
