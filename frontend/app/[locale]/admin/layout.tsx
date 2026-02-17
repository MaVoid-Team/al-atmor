import { AdminSidebar } from "@/components/admin/AdminSidebar"

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex min-h-screen bg-background">
            <AdminSidebar />
            <main className="flex-1 lg:ps-0 min-w-0 overflow-x-hidden">
                <div className="container max-w-screen-2xl p-3 pt-14 sm:p-4 sm:pt-16 md:p-6 lg:p-8 lg:pt-8 overflow-x-hidden">
                    {children}
                </div>
            </main>
        </div>
    )
}
