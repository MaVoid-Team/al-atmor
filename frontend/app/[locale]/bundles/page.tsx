"use client"

import { useSearchParams } from "next/navigation"
import { AllBundles } from "@/components/Landing/AllBundles"

export default function BundlesPage() {
    const searchParams = useSearchParams()
    const initialSearch = searchParams.get('q') || ''

    return (
        <AllBundles
            initialSearch={initialSearch}
            showSearch={true}
        />
    )
}
