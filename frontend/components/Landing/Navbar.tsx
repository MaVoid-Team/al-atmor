"use client"

import * as React from "react"
import { Link } from "@/i18n/navigation"
import Image from "next/image"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SearchBar } from "@/components/Landing/SearchBar"
import { Cart } from "@/components/Landing/Cart"
import { useTranslations } from "next-intl"
import { useAuth } from "@/context/AuthContext"
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher"
import { ThemeSwitcher } from "@/components/ui/theme-switcher"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetClose,
} from "@/components/ui/sheet"

export function Navbar() {
    const t = useTranslations('Navbar')
    const { isAuthenticated, logout, user } = useAuth()
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)

    return (
        <header className="sticky top-0 z-50 w-full border-b border-primary-foreground/10 bg-primary text-primary-foreground shadow-xl">
            <div className="container flex h-20 max-w-screen-2xl items-center justify-between px-4">
                {/* Left: Logo */}
                <div className="flex items-center shrink-0">
                    <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-90">
                        <div className="relative h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 overflow-hidden">
                            <Image
                                src="/Logo.png"
                                alt="Al-Atmour Group Logo"
                                fill
                                className="object-contain"
                                priority
                            />
                        </div>
                        <span className="hidden font-bold tracking-tight lg:inline-block text-primary-foreground text-xl capitalize">
                            {t('companyName')}
                        </span>
                    </Link>
                </div>

                {/* Middle: Nav Items */}
                <nav className="hidden md:flex items-center gap-4 lg:gap-8 text-base font-medium">
                    <Link className="hover:text-secondary hover:scale-105 duration-200 transition-all"
                        href="/"
                    >
                        {t('home')}
                    </Link>
                    <Link className="hover:text-secondary hover:scale-105 duration-200 transition-all"
                        href="/products"
                    >
                        {t('products')}
                    </Link>
                    <Link className="hover:text-secondary hover:scale-105 duration-200 transition-all"
                        href="/bundles"
                    >
                        {t('bundles')}
                    </Link>
                    <Link className="hover:text-secondary hover:scale-105 duration-200 transition-all"
                        href="/categories"
                    >
                        {t('categories')}
                    </Link>
                    {isAuthenticated && (
                        <Link className="hover:text-secondary hover:scale-105 duration-200 transition-all"
                            href="/orders"
                        >
                            {t('orders')}
                        </Link>
                    )}
                    {isAuthenticated && user?.role === 'admin' && (
                        <Link className="hover:text-secondary hover:scale-105 duration-200 transition-all"
                            href="/admin"
                        >
                            {t('adminDashboard')}
                        </Link>
                    )}
                </nav>

                {/* Right: Actions */}
                <div className="flex items-center gap-3">
                    <div className="md:hidden text-primary-foreground">
                        <SearchBar />
                    </div>

                    <div className="text-primary-foreground">
                        <Cart />
                    </div>

                    <LanguageSwitcher />

                    <ThemeSwitcher />

                    <div className="hidden items-center gap-3 md:flex ms-2">
                        {isAuthenticated ? (
                            <>
                                <Link href="/profile">
                                    <Button variant="ghost" size="sm" className="text-primary-foreground hover:text-primary hover:bg-primary-foreground">
                                        {t('profile')}
                                    </Button>
                                </Link>
                                <Button variant="ghost" size="sm" onClick={logout} className="text-primary-foreground hover:text-primary hover:bg-primary-foreground">
                                    {t('logout')}
                                </Button>
                            </>
                        ) : (
                            <>
                                <Link href="/auth/login">
                                    <Button variant="ghost" size="sm" className="text-primary-foreground hover:text-primary hover:bg-primary-foreground">
                                        {t('login')}
                                    </Button>
                                </Link>
                                <Link href="/auth/signup">
                                    <Button size="sm" className="font-medium bg-secondary text-secondary-foreground hover:bg-secondary/90 border-none">
                                        {t('signup')}
                                    </Button>
                                </Link>
                            </>
                        )}
                        <div className="ms-4 text-primary-foreground">
                            <SearchBar />
                        </div>
                    </div>

                    {/* Mobile Menu */}
                    <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="md:hidden text-primary-foreground hover:bg-primary-foreground/10">
                                <Menu className="h-6 w-6" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-[300px] sm:w-[350px]">
                            <SheetHeader>
                                <SheetTitle className="text-primary">{t('companyName')}</SheetTitle>
                            </SheetHeader>
                            <div className="flex flex-col gap-4 mt-6">
                                {/* Mobile Navigation Links */}
                                <nav className="flex flex-col gap-2">
                                    <SheetClose asChild>
                                        <Link
                                            href="/"
                                            className="flex items-center px-4 py-3 text-base font-medium rounded-md hover:bg-primary/5 text-foreground hover:text-primary transition-colors"
                                        >
                                            {t('home')}
                                        </Link>
                                    </SheetClose>
                                    <SheetClose asChild>
                                        <Link
                                            href="/products"
                                            className="flex items-center px-4 py-3 text-base font-medium rounded-md hover:bg-primary/5 text-foreground hover:text-primary transition-colors"
                                        >
                                            {t('products')}
                                        </Link>
                                    </SheetClose>
                                    <SheetClose asChild>
                                        <Link
                                            href="/bundles"
                                            className="flex items-center px-4 py-3 text-base font-medium rounded-md hover:bg-primary/5 text-foreground hover:text-primary transition-colors"
                                        >
                                            {t('bundles')}
                                        </Link>
                                    </SheetClose>
                                    <SheetClose asChild>
                                        <Link
                                            href="/categories"
                                            className="flex items-center px-4 py-3 text-base font-medium rounded-md hover:bg-primary/5 text-foreground hover:text-primary transition-colors"
                                        >
                                            {t('categories')}
                                        </Link>
                                    </SheetClose>
                                    {isAuthenticated && (
                                        <SheetClose asChild>
                                            <Link
                                                href="/orders"
                                                className="flex items-center px-4 py-3 text-base font-medium rounded-md hover:bg-primary/5 text-foreground hover:text-primary transition-colors"
                                            >
                                                {t('orders')}
                                            </Link>
                                        </SheetClose>
                                    )}
                                    {isAuthenticated && user?.role === 'admin' && (
                                        <SheetClose asChild>
                                            <Link
                                                href="/admin"
                                                className="flex items-center px-4 py-3 text-base font-medium rounded-md hover:bg-primary/5 text-foreground hover:text-primary transition-colors"
                                            >
                                                {t('adminDashboard')}
                                            </Link>
                                        </SheetClose>
                                    )}
                                </nav>

                                {/* Divider */}
                                <div className="border-t my-2" />

                                {/* Mobile Auth Actions */}
                                <div className="flex flex-col gap-2 px-2">
                                    {isAuthenticated ? (
                                        <>
                                            <SheetClose asChild>
                                                <Link href="/profile">
                                                    <Button variant="outline" className="w-full justify-start border-primary/20 text-primary hover:bg-primary/5">
                                                        {t('profile')}
                                                    </Button>
                                                </Link>
                                            </SheetClose>
                                            <Button
                                                variant="ghost"
                                                className="w-full justify-start text-destructive hover:bg-destructive/5"
                                                onClick={() => {
                                                    logout()
                                                    setIsMobileMenuOpen(false)
                                                }}
                                            >
                                                {t('logout')}
                                            </Button>
                                        </>
                                    ) : (
                                        <>
                                            <SheetClose asChild>
                                                <Link href="/auth/login">
                                                    <Button variant="outline" className="w-full border-primary/20 text-primary hover:bg-primary/5">
                                                        {t('login')}
                                                    </Button>
                                                </Link>
                                            </SheetClose>
                                            <SheetClose asChild>
                                                <Link href="/auth/signup">
                                                    <Button className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90">
                                                        {t('signup')}
                                                    </Button>
                                                </Link>
                                            </SheetClose>
                                        </>
                                    )}
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    )
}
