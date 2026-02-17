"use client"

import * as React from "react"
import { ShoppingCart, Trash2, Plus, Minus } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetFooter,
} from "@/components/ui/sheet"
import { useTranslations } from "next-intl"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "@/i18n/navigation"
import { useCart } from "@/context/CartContext"

export function Cart() {
    const [isOpen, setIsOpen] = React.useState(false)
    const t = useTranslations('Cart')
    const tCommon = useTranslations('Common')
    const { isAuthenticated } = useAuth()
    const router = useRouter()
    const { cartData, isLoading, fetchCart, updateQuantity, removeItem, clearCart } = useCart()

    // Refresh cart when opened
    React.useEffect(() => {
        if (isOpen && isAuthenticated) {
            fetchCart()
        }
    }, [isOpen, isAuthenticated, fetchCart])

    const handleCheckout = () => {
        setIsOpen(false)
        router.push('/checkout')
    }

    const items = cartData?.items || []
    const total = cartData?.totals.subtotal || 0
    const itemCount = cartData?.totals.itemCount || 0

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative h-9 w-9"
                >
                    <ShoppingCart className="h-5 w-5" />
                    <span className="sr-only">{t('title')}</span>
                    {itemCount > 0 && (
                        <span className="absolute -end-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                            {itemCount}
                        </span>
                    )}
                </Button>
            </SheetTrigger>
            <SheetContent className="flex w-full flex-col pe-0 sm:max-w-lg">
                <SheetHeader className="px-1">
                    <SheetTitle>{t('title')} ({itemCount})</SheetTitle>
                </SheetHeader>

                {!isAuthenticated ? (
                    <div className="flex h-full flex-col items-center justify-center space-y-4 pe-6">
                        <ShoppingCart className="h-12 w-12 text-muted-foreground/50" />
                        <span className="text-lg font-medium text-muted-foreground text-center">
                            {t('loginRequired')}
                        </span>
                        <Button onClick={() => {
                            setIsOpen(false)
                            router.push('/auth/login')
                        }}>
                            {t('loginButton')}
                        </Button>
                    </div>
                ) : items.length > 0 ? (
                    <>
                        <div className="flex-1 overflow-y-auto pe-6">
                            <ul className="grid gap-6 py-4">
                                {items.map((item) => {
                                    // Determine item type and data
                                    const isBundle = item.itemType === 'bundle'
                                    const itemData = isBundle ? item.bundle : item.product
                                    const itemId = isBundle ? item.bundleId : item.productId

                                    // Skip items without proper data
                                    if (!itemData || !itemId) return null

                                    return (
                                        <li key={item.id} className="flex items-center gap-4">
                                            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border bg-background">
                                                {itemData.imageUrl ? (
                                                    <Image
                                                        src={itemData.imageUrl}
                                                        alt={itemData.name}
                                                        fill
                                                        unoptimized
                                                        className="object-contain p-2"
                                                        sizes="80px"
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center bg-secondary text-secondary-foreground">
                                                        <ShoppingCart className="h-6 w-6 opacity-20" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex flex-1 flex-col gap-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium line-clamp-1">{itemData.name}</span>
                                                    {isBundle && (
                                                        <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                                                            Bundle
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="text-sm text-muted-foreground">
                                                    {tCommon('currency')} {parseFloat(itemData.price).toFixed(2)}
                                                </span>
                                                <div className="mt-2 flex items-center gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        className="h-6 w-6"
                                                        onClick={() => updateQuantity(itemId, item.quantity - 1, item.itemType)}
                                                        disabled={isLoading}
                                                    >
                                                        <Minus className="h-3 w-3" />
                                                    </Button>
                                                    <span className="text-sm w-4 text-center">{item.quantity}</span>
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        className="h-6 w-6"
                                                        onClick={() => updateQuantity(itemId, item.quantity + 1, item.itemType)}
                                                        disabled={isLoading}
                                                    >
                                                        <Plus className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                                onClick={() => removeItem(itemId, item.itemType)}
                                                disabled={isLoading}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                                <span className="sr-only">{t('remove')}</span>
                                            </Button>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                        <SheetFooter className="border-t pt-6 pe-6">
                            <div className="w-full space-y-4">
                                <div className="flex items-center justify-between text-base font-medium">
                                    <span>{t('total')}</span>
                                    <span>{tCommon('currency')} {total.toFixed(2)}</span>
                                </div>
                                <div className="grid gap-2">
                                    <Button
                                        className="w-full"
                                        size="lg"
                                        onClick={handleCheckout}
                                        disabled={isLoading}
                                    >
                                        {t('checkout')}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        {t('continueShopping')}
                                    </Button>
                                    {items.length > 0 && (
                                        <Button
                                            variant="ghost"
                                            className="w-full text-destructive"
                                            onClick={clearCart}
                                            disabled={isLoading}
                                        >
                                            {t('clearCart')}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </SheetFooter>
                    </>
                ) : (
                    <div className="flex h-full flex-col items-center justify-center space-y-2 pe-6">
                        <ShoppingCart className="h-12 w-12 text-muted-foreground/50" />
                        <span className="text-lg font-medium text-muted-foreground">
                            {t('emptyTitle')}
                        </span>
                        <Button
                            variant="link"
                            className="text-sm text-primary"
                            onClick={() => {
                                setIsOpen(false)
                                router.push('/products')
                            }}
                        >
                            {t('startShopping')}
                        </Button>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    )
}
