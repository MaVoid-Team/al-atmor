import { Header } from "@/components/Landing/Header"
import { JustArrived } from "@/components/Landing/JustArrived"
import { FeaturedProducts } from "@/components/Landing/FeaturedProducts"
import { FeaturedBundles } from "@/components/Landing/FeaturedBundles"
import { AllProducts } from "@/components/Landing/AllProducts"

export default function Page() {
    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <JustArrived />
            <FeaturedProducts />
            <FeaturedBundles />
            <AllProducts />
        </div>
    )
}