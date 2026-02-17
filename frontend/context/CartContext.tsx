"use client"

import React, { createContext, useContext, useState, useCallback, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "@/i18n/navigation"
import { toast } from "sonner"
import { useTranslations } from "next-intl"

export interface CartItem {
    id: number
    itemType: 'product' | 'bundle'  // Polymorphic item type
    productId?: number              // Present when itemType is 'product'
    bundleId?: number               // Present when itemType is 'bundle'
    product?: {                     // Present when itemType is 'product'
        id: number
        name: string
        sku: string
        price: string
        imageUrl?: string
    }
    bundle?: {                      // Present when itemType is 'bundle'
        id: number
        name: string
        price: string
        imageUrl?: string
    }
    quantity: number
}

export interface CartData {
    cartId: number
    items: CartItem[]
    totals: {
        subtotal: number
        itemCount: number
        shipping?: number
        tax?: number
        total?: number
    }
}

export interface Order {
    id: number
    userId: number
    status: string
    paymentStatus: string
    currency: string
    subtotal: string
    shipping: string
    tax: string
    total: string
    metadata: any
    placedAt: string
    createdAt: string
    updatedAt: string
    items: Array<{
        id: number
        productId: number
        orderId: number
        quantity: number
        priceAtPurchase: string
        createdAt: string
    }>
    user: {
        id: number
        email: string
        role: string
    }
}

export interface ValidationResponse {
    valid: boolean
    message: string
}

interface CartContextType {
    cartData: CartData | null
    isAdding: boolean
    isLoading: boolean
    fetchCart: () => Promise<CartData | null>
    addToCart: (productId: number, quantity?: number) => Promise<boolean>
    addBundleToCart: (bundleId: number, quantity?: number) => Promise<boolean>
    updateQuantity: (itemId: number, newQuantity: number, itemType: 'product' | 'bundle') => Promise<boolean>
    removeItem: (itemId: number, itemType: 'product' | 'bundle') => Promise<boolean>
    clearCart: () => Promise<boolean>
    validateCart: () => Promise<ValidationResponse | null>
    checkoutCart: () => Promise<Order | null>
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [isAdding, setIsAdding] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [cartData, setCartData] = useState<CartData | null>(null)
    const { isAuthenticated, token } = useAuth()
    const router = useRouter()
    const t = useTranslations('Cart')

    /**
     * Fetch cart data
     */
    const fetchCart = useCallback(async () => {
        if (!isAuthenticated || !token) return null

        try {
            const response = await fetch('/api/cart', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            })

            if (response.ok) {
                const data = await response.json()
                setCartData(data)
                return data
            }
            return null
        } catch (error) {
            console.error('Failed to fetch cart:', error)
            return null
        }
    }, [isAuthenticated, token])

    /**
     * Add item to cart
     */
    const addToCart = useCallback(async (productId: number, quantity: number = 1) => {
        if (!isAuthenticated) {
            toast.error(t('loginRequired'))
            router.push('/auth/login')
            return false
        }

        if (!token) {
            toast.error(t('authError'))
            return false
        }

        setIsAdding(true)
        try {
            const response = await fetch('/api/cart/items', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ productId, quantity }),
            })

            if (response.ok) {
                toast.success(t('itemAdded'))
                await fetchCart() // Refresh cart
                return true
            } else {
                const error = await response.json()
                toast.error(error.message || t('addFailed'))
                return false
            }
        } catch (error) {
            console.error('Failed to add to cart:', error)
            toast.error(t('addFailed'))
            return false
        } finally {
            setIsAdding(false)
        }
    }, [isAuthenticated, token, t, router, fetchCart])

    /**
     * Add bundle to cart
     */
    const addBundleToCart = useCallback(async (bundleId: number, quantity: number = 1) => {
        if (!isAuthenticated) {
            toast.error(t('loginRequired'))
            router.push('/auth/login')
            return false
        }

        if (!token) {
            toast.error(t('authError'))
            return false
        }

        setIsAdding(true)
        try {
            const response = await fetch('/api/cart/items', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ bundleId, quantity, itemType: 'bundle' }),
            })

            if (response.ok) {
                toast.success(t('itemAdded'))
                await fetchCart() // Refresh cart
                return true
            } else {
                const error = await response.json()
                toast.error(error.message || t('addFailed'))
                return false
            }
        } catch (error) {
            console.error('Failed to add bundle to cart:', error)
            toast.error(t('addFailed'))
            return false
        } finally {
            setIsAdding(false)
        }
    }, [isAuthenticated, token, t, router, fetchCart])

    /**
     * Update item quantity (supports both products and bundles)
     */
    const updateQuantity = useCallback(async (itemId: number, newQuantity: number, itemType: 'product' | 'bundle' = 'product') => {
        if (!token) return false

        if (newQuantity < 1) {
            return await removeItem(itemId, itemType)
        }

        setIsLoading(true)
        try {
            const response = await fetch(`/api/cart/items/${itemId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ quantity: newQuantity, itemType }),
            })

            if (response.ok) {
                await fetchCart()
                toast.success(t('quantityUpdated'))
                return true
            } else {
                toast.error(t('updateFailed'))
                return false
            }
        } catch (error) {
            console.error('Failed to update quantity:', error)
            toast.error(t('updateFailed'))
            return false
        } finally {
            setIsLoading(false)
        }
    }, [token, t, fetchCart])

    /**
     * Remove item from cart (supports both products and bundles)
     */
    const removeItem = useCallback(async (itemId: number, itemType: 'product' | 'bundle' = 'product') => {
        if (!token) return false

        setIsLoading(true)
        try {
            const response = await fetch(`/api/cart/items/${itemId}?itemType=${itemType}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            })

            if (response.ok) {
                await fetchCart()
                toast.success(t('itemRemoved'))
                return true
            } else {
                toast.error(t('removeFailed'))
                return false
            }
        } catch (error) {
            console.error('Failed to remove item:', error)
            toast.error(t('removeFailed'))
            return false
        } finally {
            setIsLoading(false)
        }
    }, [token, t, fetchCart])

    /**
     * Clear entire cart
     */
    const clearCart = useCallback(async () => {
        if (!token) return false

        setIsLoading(true)
        try {
            const response = await fetch('/api/cart', {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            })

            if (response.ok) {
                setCartData(null)
                toast.success(t('cartCleared'))
                return true
            } else {
                toast.error(t('clearFailed'))
                return false
            }
        } catch (error) {
            console.error('Failed to clear cart:', error)
            toast.error(t('clearFailed'))
            return false
        } finally {
            setIsLoading(false)
        }
    }, [token, t])

    /**
     * Validate cart before checkout
     */
    const validateCart = useCallback(async (): Promise<ValidationResponse | null> => {
        if (!token) return null

        try {
            const response = await fetch('/api/cart/validate', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            })

            if (response.ok) {
                const data = await response.json()
                return data
            }
            return null
        } catch (error) {
            console.error('Failed to validate cart:', error)
            return null
        }
    }, [token])

    /**
     * Checkout cart and create order
     */
    const checkoutCart = useCallback(async (): Promise<Order | null> => {
        if (!token) return null

        setIsLoading(true)
        try {
            const response = await fetch('/api/cart/checkout', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            })

            if (response.ok) {
                const data = await response.json()
                // Clear cart after successful checkout
                setCartData(null)
                return data.order
            } else {
                const error = await response.json()
                console.error('Checkout failed:', error)
                return null
            }
        } catch (error) {
            console.error('Failed to checkout:', error)
            return null
        } finally {
            setIsLoading(false)
        }
    }, [token])

    // Fetch cart on mount when authenticated
    useEffect(() => {
        if (isAuthenticated) {
            fetchCart()
        }
    }, [isAuthenticated, fetchCart])

    const value = {
        cartData,
        isAdding,
        isLoading,
        fetchCart,
        addToCart,
        addBundleToCart,
        updateQuantity,
        removeItem,
        clearCart,
        validateCart,
        checkoutCart,
    }

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
    const context = useContext(CartContext)
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider')
    }
    return context
}
