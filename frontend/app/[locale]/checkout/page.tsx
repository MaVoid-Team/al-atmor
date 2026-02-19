"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "@/i18n/navigation"
import { useAuth } from "@/context/AuthContext"
import { useUser, Address } from "@/hooks/useUser"
import { useLocations } from "@/hooks/useLocations"
import { useCart } from "@/context/CartContext"
import { useDiscounts, ValidateDiscountResponse } from "@/hooks/useDiscounts"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import { Location } from "@/types/location"
import { CheckoutSummary } from "@/components/checkout/CheckoutSummary"
import { AddressSelection } from "@/components/checkout/AddressSelection"
import { LocationSelector } from "@/components/checkout/LocationSelector"
import { AddressFormDialog } from "@/components/profile/AddressFormDialog"
import { OrderReview } from "@/components/checkout/OrderReview"
import { CheckoutSteps } from "@/components/checkout/CheckoutSteps"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

export interface ShippingData {
    firstName: string
    lastName: string
    email: string
    phone: string
    address: string
    city: string
    state: string
    zipCode: string
    country: string
}

export default function CheckoutPage() {
    const router = useRouter()
    const { isAuthenticated, token, isLoading: authLoading } = useAuth()
    const {
        userEmail,
        addresses,
        isLoadingAddresses,
        fetchAddresses,
        createAddress
    } = useUser()
    const {
        locations,
        cities,
        isLoading: isLoadingLocations,
        fetchLocations,
        getLocationById
    } = useLocations()
    const { cartData, fetchCart, validateCart } = useCart()
    const t = useTranslations('Checkout')

    const [currentStep, setCurrentStep] = useState(1)
    const [isLoading, setIsLoading] = useState(true)
    const [isValidating, setIsValidating] = useState(false)
    const [isCheckingOut, setIsCheckingOut] = useState(false)
    const [validationError, setValidationError] = useState<string | null>(null)

    // Promo code state
    const { validateDiscount } = useDiscounts()
    const [appliedDiscount, setAppliedDiscount] = useState<ValidateDiscountResponse | null>(null)
    const [isValidatingPromo, setIsValidatingPromo] = useState(false)

    // Address & Location selection state
    const [selectedAddress, setSelectedAddress] = useState<Address | null>(null)
    const [selectedLocationId, setSelectedLocationId] = useState<number | null>(null)
    const [showAddressForm, setShowAddressForm] = useState(false)
    const [isSavingAddress, setIsSavingAddress] = useState(false)

    // Shipping data (derived from selected address)
    const [shippingData, setShippingData] = useState<ShippingData>({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'Egypt',
    })

    // Redirect if not authenticated (only after auth has loaded)
    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/auth/login')
        }
    }, [authLoading, isAuthenticated, router])

    // Fetch cart data and validate
    useEffect(() => {
        const loadCart = async () => {
            const data = await fetchCart()

            // Redirect to products if cart is empty
            if (!data || !data.items || data.items.length === 0) {
                router.push('/products')
                return
            }

            // Validate cart after loading
            setIsValidating(true)
            const validation = await validateCart()
            if (validation && !validation.valid) {
                setValidationError(validation.message)
            }
            setIsValidating(false)
            setIsLoading(false)
        }

        if (isAuthenticated) {
            loadCart()
        }
    }, [isAuthenticated, fetchCart, validateCart, router])

    // Fetch addresses and locations on mount
    useEffect(() => {
        if (isAuthenticated) {
            fetchAddresses()
            fetchLocations()
        }
    }, [isAuthenticated, fetchAddresses, fetchLocations])

    // Pre-select default address
    useEffect(() => {
        if (addresses.length > 0 && !selectedAddress) {
            const defaultAddr = addresses.find(addr => addr.isDefault)
            if (defaultAddr) {
                handleSelectAddress(defaultAddr)
            }
        }
    }, [addresses])

    // Handle address selection
    const handleSelectAddress = (address: Address) => {
        setSelectedAddress(address)

        // Parse recipient name into first/last name
        const nameParts = address.recipientName?.split(' ') || []
        const firstName = nameParts[0] || ''
        const lastName = nameParts.slice(1).join(' ') || ''

        setShippingData({
            firstName,
            lastName,
            email: userEmail || '',
            phone: address.phoneNumber || '',
            address: address.streetAddress || '',
            city: address.city || '',
            state: address.district || '',
            zipCode: address.postalCode || '',
            country: 'Egypt',
        })
    }

    // Handle location selection
    const handleSelectLocation = (location: Location | null) => {
        setSelectedLocationId(location?.id || null)
    }

    // Handle add new address
    const handleAddNewAddress = () => {
        setShowAddressForm(true)
    }

    // Handle save new address
    const handleSaveAddress = async (addressData: Partial<Address>) => {
        setIsSavingAddress(true)
        try {
            // Include country Egypt explicitly
            const dataToSave = { ...addressData, country: 'Egypt' }
            const newAddress = await createAddress(dataToSave)

            if (newAddress) {
                toast.success(t('addressSelection.addressCreated'))
                setShowAddressForm(false)
                handleSelectAddress(newAddress)
                // Also fetch all addresses to ensure the list is updated
                await fetchAddresses()
            } else {
                toast.error(t('addressSelection.addressCreateFailed'))
            }
        } catch (error: any) {
            console.error('Failed to create address:', error)
            const errorMessage = error?.message || t('addressSelection.addressCreateFailed')
            toast.error(errorMessage)
        } finally {
            setIsSavingAddress(false)
        }
    }

    // Handle continue to review
    const handleContinueToReview = () => {
        if (!selectedAddress) {
            toast.error(t('addressSelection.pleaseSelect'))
            return
        }
        if (!selectedLocationId) {
            toast.error(t('locationSelector.pleaseSelect'))
            return
        }
        setCurrentStep(2)
    }

    // Get selected location
    const selectedLocation = selectedLocationId ? getLocationById(selectedLocationId) : undefined

    // Handle promo code application
    const handleApplyPromoCode = async (code: string, subtotal: number): Promise<ValidateDiscountResponse | null> => {
        setIsValidatingPromo(true)
        try {
            const result = await validateDiscount({ code, subtotal })
            if (result?.valid) {
                setAppliedDiscount(result)
                toast.success(t('summary.promoApplied'))
                return result
            } else {
                toast.error(t('summary.invalidPromo'))
                return null
            }
        } catch (error) {
            console.error('Failed to validate promo:', error)
            toast.error(t('summary.promoError'))
            return null
        } finally {
            setIsValidatingPromo(false)
        }
    }

    // Handle promo code removal
    const handleRemovePromoCode = () => {
        setAppliedDiscount(null)
        toast.success(t('summary.promoRemoved'))
    }

    const handlePlaceOrder = async (paymentType: "cash" | "card") => {
        // Ensure locationId is selected (mandatory for backend)
        if (!selectedLocationId) {
            toast.error(t('locationSelector.pleaseSelect'))
            return
        }

        setIsCheckingOut(true)
        try {
            if (paymentType === "cash") {
                // Cash payment - include locationId and addressId
                const response = await fetch('/api/cart/checkout', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        locationId: selectedLocationId,
                        addressId: selectedAddress?.id,
                        discountCode: appliedDiscount?.discountCode?.code,
                    }),
                })

                const data = await response.json()

                if (!response.ok) {
                    toast.error(data.error || t('orderFailed'))
                    return
                }

                if (data.order) {
                    router.push(`/checkout/success?orderId=${data.order.id}&status=success`)
                } else {
                    toast.error(t('orderFailed'))
                }
            } else {
                // Card payment - use payment initiation endpoint with correct billingData structure
                // Calculate tax and shipping based on selected location
                const subtotal = cartData?.totals?.subtotal || 0
                let taxAmount = 0
                let shippingAmount = 0

                if (selectedLocation) {
                    const taxRate = parseFloat(selectedLocation.taxRate) || 0
                    const shippingRate = parseFloat(selectedLocation.shippingRate) || 0
                    taxAmount = subtotal * taxRate
                    shippingAmount = subtotal * shippingRate
                }

                // Apply discount if available
                const discountAmount = appliedDiscount?.discountAmount || 0
                const totalAmount = subtotal + taxAmount + shippingAmount - discountAmount

                const response = await fetch('/api/payment/initiate', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        paymentType: 'card',
                        locationId: selectedLocationId,
                        discountCode: appliedDiscount?.discountCode?.code,
                        // Include calculated amounts for Paymob
                        subtotal: subtotal,
                        taxAmount: taxAmount,
                        shippingAmount: shippingAmount,
                        discountAmount: discountAmount,
                        totalAmount: totalAmount,
                        billingData: {
                            firstName: shippingData.firstName,
                            lastName: shippingData.lastName,
                            phone: shippingData.phone,
                            email: shippingData.email,
                            address: shippingData.address,
                            city: shippingData.city,
                            state: shippingData.state,
                        },
                    }),
                })

                const data = await response.json()

                if (!response.ok) {
                    toast.error(data.error || t('paymentInitFailed'))
                    return
                }

                if (data.checkoutUrl) {
                    window.location.href = data.checkoutUrl
                } else {
                    toast.error(t('paymentInitFailed'))
                }
            }
        } catch (error) {
            console.error('Checkout error:', error)
            toast.error(t('orderFailed'))
        } finally {
            setIsCheckingOut(false)
        }
    }

    // Show loading while auth is initializing or if not authenticated yet
    if (authLoading || !isAuthenticated) {
        return null
    }

    if (isLoading) {
        return (
            <div className="container max-w-screen-xl py-8 px-4 md:px-8 lg:px-16 xl:px-28">
                <div className="space-y-6">
                    <Skeleton className="h-9 w-48" />
                    <div className="flex justify-between gap-4 mb-8">
                        {[...Array(2)].map((_, i) => (
                            <Skeleton key={i} className="h-12 flex-1" />
                        ))}
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        <Card className="md:col-span-2">
                            <CardHeader>
                                <Skeleton className="h-6 w-40" />
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className="space-y-2">
                                        <Skeleton className="h-4 w-24" />
                                        <Skeleton className="h-10 w-full" />
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <Skeleton className="h-6 w-32" />
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className="flex justify-between">
                                        <Skeleton className="h-4 w-20" />
                                        <Skeleton className="h-4 w-16" />
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        )
    }

    // Show empty cart state
    if (!isLoading && (!cartData || !cartData.items || cartData.items.length === 0)) {
        return (
            <div className="container max-w-screen-3xl py-8 px-4 md:px-16 lg:px-32 xl:px-64">
                <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
                    <div className="rounded-full bg-muted p-6">
                        <svg
                            className="h-16 w-16 text-muted-foreground"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                            />
                        </svg>
                    </div>
                    <div className="text-center space-y-2">
                        <h2 className="text-xl sm:text-2xl font-bold tracking-tight">{t('emptyCart.title')}</h2>
                        <p className="text-muted-foreground max-w-md">
                            {t('emptyCart.description')}
                        </p>
                    </div>
                    <button
                        onClick={() => router.push('/products')}
                        className="inline-flex items-center justify-center rounded-md bg-primary px-8 py-3 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
                    >
                        {t('emptyCart.browseProducts')}
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-screen-xl mx-auto py-8 px-4 md:px-8">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight mb-8">{t('title')}</h1>

            <CheckoutSteps currentStep={currentStep} />

            <div className="grid lg:grid-cols-3 gap-8 mt-8">
                <div className="lg:col-span-2 space-y-6">
                    {currentStep === 1 && (
                        <>
                            {/* Address Selection */}
                            <AddressSelection
                                addresses={addresses}
                                selectedAddressId={selectedAddress?.id || null}
                                onSelectAddress={handleSelectAddress}
                                onAddNewAddress={handleAddNewAddress}
                                isLoading={isLoadingAddresses}
                            />

                            {/* Location Selection */}
                            <LocationSelector
                                locations={locations}
                                cities={cities}
                                selectedLocationId={selectedLocationId}
                                onSelectLocation={handleSelectLocation}
                                isLoading={isLoadingLocations}
                            />

                            {/* Continue Button */}
                            <Button
                                onClick={handleContinueToReview}
                                size="lg"
                                className="w-full"
                                disabled={!selectedAddress || !selectedLocationId}
                            >
                                {t('shipping.continue')}
                            </Button>
                        </>
                    )}

                    {currentStep === 2 && (
                        <OrderReview
                            shippingData={shippingData}
                            cartData={cartData}
                            onPlaceOrder={handlePlaceOrder}
                            onBack={() => setCurrentStep(1)}
                            isCheckingOut={isCheckingOut}
                            selectedLocation={selectedLocation}
                        />
                    )}
                </div>

                <div>
                    <CheckoutSummary
                        cartData={cartData}
                        selectedLocation={selectedLocation}
                        appliedDiscount={appliedDiscount}
                        onApplyPromoCode={handleApplyPromoCode}
                        onRemovePromoCode={handleRemovePromoCode}
                        isValidatingPromo={isValidatingPromo}
                    />
                </div>
            </div>

            {/* Add Address Dialog */}
            <AddressFormDialog
                open={showAddressForm}
                onOpenChange={setShowAddressForm}
                address={null}
                onSave={handleSaveAddress}
                isSaving={isSavingAddress}
            />
        </div>
    )
}
