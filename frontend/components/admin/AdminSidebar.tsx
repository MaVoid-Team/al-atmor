"use client"

import * as React from "react"
import { Link, usePathname } from "@/i18n/navigation"
import { useTranslations, useLocale } from "next-intl"
import {
    User,
    Users,
    ShoppingCart,
    Package,
    FolderTree,
    Factory,
    Boxes,
    LogOut,
    Store,
    ChevronLeft,
    ChevronRight,
    Menu,
    X,
    Home,
    BarChart3,
    MapPin,
    TicketPercent,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { useAuth } from "@/context/AuthContext"

interface NavItem {
    href: string
    label: string
    icon: React.ComponentType<{ className?: string }>
    external?: boolean
    onClick?: () => void
}

interface AdminSidebarProps {
    locale?: string
}

export function AdminSidebar({ locale }: AdminSidebarProps) {
    const t = useTranslations("AdminSidebar")
    const currentLocale = useLocale()
    const isRtl = currentLocale === "ar"
    const pathname = usePathname()
    const [isCollapsed, setIsCollapsed] = React.useState(false)
    const [isMobileOpen, setIsMobileOpen] = React.useState(false)
    const { logout } = useAuth()

    const mainNavItems: NavItem[] = [
        { href: "/admin", label: t("dashboard"), icon: Home },
        { href: "/admin/analytics", label: t("analytics"), icon: BarChart3 },
        { href: "/profile", label: t("profile"), icon: User },
        { href: "/admin/users", label: t("users"), icon: Users },
        { href: "/admin/orders", label: t("orders"), icon: ShoppingCart },
        { href: "/admin/products", label: t("products"), icon: Package },
        { href: "/admin/bundles", label: t("bundles"), icon: Boxes },
        { href: "/admin/categories", label: t("categories"), icon: FolderTree },
        { href: "/admin/manufacturers", label: t("manufacturers"), icon: Factory },
        { href: "/admin/product-types", label: t("productTypes"), icon: Package },
        { href: "/admin/locations", label: t("locations"), icon: MapPin },
        { href: "/admin/promo", label: t("promoCodes"), icon: TicketPercent },
    ]

    const secondaryNavItems: NavItem[] = [
        { href: "/", label: t("backToStore"), icon: Store },
    ]

    const isActive = (href: string) => {
        if (href === "/admin") {
            return pathname === "/admin"
        }
        return pathname.startsWith(href)
    }

    const NavLink = ({
        item,
        showLabel = true,
    }: {
        item: NavItem
        showLabel?: boolean
    }) => {
        const active = isActive(item.href)
        const Icon = item.icon

        const linkContent = item.onClick ? (
            <button
                onClick={() => {
                    item.onClick?.()
                    setIsMobileOpen(false)
                }}
                className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    "hover:bg-primary hover:text-sidebar-primary-foreground",
                    "text-sidebar-foreground",
                    !showLabel && "justify-center px-2",
                    isRtl && showLabel && "flex-row-reverse text-right"
                )}
            >
                <Icon className={cn("h-5 w-5 shrink-0")} />
                {showLabel && <span className="truncate">{item.label}</span>}
            </button>
        ) : (
            <Link
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    "hover:bg-primary hover:text-sidebar-primary-foreground",
                    active
                        ? "bg-accent text-sidebar-accent-foreground shadow-sm"
                        : "text-sidebar-foreground",
                    !showLabel && "justify-center px-2",
                    isRtl && showLabel && "flex-row-reverse text-right"
                )}
            >
                <Icon className={cn("h-5 w-5 shrink-0")} />
                {showLabel && <span className="truncate">{item.label}</span>}
            </Link>
        )

        if (!showLabel) {
            return (
                <Tooltip>
                    <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                    <TooltipContent side="right" className="font-medium bg-popover text-popover-foreground border-border">
                        {item.label}
                    </TooltipContent>
                </Tooltip>
            )
        }

        return linkContent
    }

    const SidebarContent = ({ collapsed = false }: { collapsed?: boolean }) => (
        <div className="flex h-full flex-col">
            {/* Header */}
            <div
                className={cn(
                    "flex h-16 items-center border-b border-sidebar-border px-4",
                    collapsed ? "justify-center" : isRtl ? "justify-end" : "justify-start"
                )}
            >
                {!collapsed ? (
                    <h2 className={cn("text-lg font-semibold text-sidebar-foreground", isRtl && "text-right")}>
                        {t("adminPanel")}
                    </h2>
                ) : (
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-bold text-primary">A</span>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <nav className={cn(
                "flex-1 space-y-1 overflow-y-auto p-3",
                isRtl && !collapsed && "ps-8",
                isRtl && collapsed && "ps-3"
            )}>
                <TooltipProvider delayDuration={0}>
                    {/* Main Navigation */}
                    <div className="space-y-1">
                        {mainNavItems.map((item) => (
                            <NavLink
                                key={item.href}
                                item={item}
                                showLabel={!collapsed}
                            />
                        ))}
                    </div>

                    <Separator className="my-4 bg-sidebar-border" />

                    {/* Secondary Navigation */}
                    <div className="space-y-1">
                        {secondaryNavItems.map((item) => (
                            <NavLink
                                key={item.href}
                                item={item}
                                showLabel={!collapsed}
                            />
                        ))}

                        {/* Logout Button */}
                        <NavLink
                            item={{
                                href: "#",
                                label: t("logout"),
                                icon: LogOut,
                                onClick: logout
                            }}
                            showLabel={!collapsed}
                        />
                    </div>
                </TooltipProvider>
            </nav>

            {/* Footer */}
            <div
                className={cn(
                    "border-t border-sidebar-border p-4",
                    collapsed && "flex justify-center"
                )}
            >
                {!collapsed && (
                    <p className={cn("text-xs text-muted-foreground", isRtl && "text-right")}>
                        © {new Date().getFullYear()} Al-Atmour Group
                    </p>
                )}
            </div>
        </div>
    )

    return (
        <>
            {/* Mobile Trigger Button */}
            <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
                <SheetTrigger asChild>
                    <Button
                        variant="outline"
                        size="icon"
                        className="fixed top-4 start-4 z-50 lg:hidden bg-background/95 backdrop-blur-sm border-border shadow-md hover:bg-accent hover:text-accent-foreground"
                    >
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">{t("openMenu")}</span>
                    </Button>
                </SheetTrigger>
                <SheetContent
                    side={isRtl ? "right" : "left"}
                    className="w-[280px] p-0 bg-sidebar border-sidebar-border"
                >
                    <SheetHeader className="sr-only">
                        <SheetTitle>{t("adminPanel")}</SheetTitle>
                    </SheetHeader>
                    <SidebarContent />
                </SheetContent>
            </Sheet>

            {/* Desktop Sidebar */}
            <aside
                className={cn(
                    "fixed inset-y-0 start-0 z-40 hidden lg:flex flex-col bg-sidebar border-e border-sidebar-border transition-all duration-300 ease-in-out",
                    isCollapsed ? "w-16" : "w-64"
                )}
            >
                <SidebarContent collapsed={isCollapsed} />

                {/* Floating Toggle Button on Sidebar Edge */}
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon-sm"
                                onClick={() => setIsCollapsed(!isCollapsed)}
                                className={cn(
                                    "absolute top-1/8 -translate-y-1/2 z-50 rounded-full bg-background border-border shadow-md hover:bg-accent hover:text-accent-foreground transition-all duration-300",
                                    isRtl
                                        ? (isCollapsed ? "start-0 -translate-x-16" : "start-0 -translate-x-64")
                                        : "end-0 translate-x-1/2"
                                )}
                            >
                                {isCollapsed ? (
                                    isRtl ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
                                ) : (
                                    isRtl ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />
                                )}
                                <span className="sr-only">
                                    {isCollapsed ? t("expandSidebar") : t("collapseSidebar")}
                                </span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side={isRtl ? "left" : "right"} className="bg-popover text-popover-foreground border-border">
                            {isCollapsed ? t("expandSidebar") : t("collapseSidebar")}
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </aside>

            {/* Spacer to push content */}
            <div
                className={cn(
                    "hidden lg:block shrink-0 transition-all duration-300 ease-in-out",
                    isCollapsed ? "w-16" : "w-64"
                )}
            />
        </>
    )
}
