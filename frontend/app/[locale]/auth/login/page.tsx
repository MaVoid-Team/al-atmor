"use client"

import { useState } from "react"
import { useRouter } from "@/i18n/navigation"
import { Link } from "@/i18n/navigation"
import Image from "next/image"
import { useAuth } from "@/context/AuthContext"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

export default function LoginPage() {
    const t = useTranslations('Auth')
    const tFooter = useTranslations('Footer')
    const router = useRouter()
    const { login } = useAuth()
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            })

            if (!res.ok) throw new Error(t('loginFailure'))

            const data = await res.json()
            login(data.token, data.user)
            toast.success(t('loginSuccess'))
            router.push("/")
        } catch (error) {
            toast.error(t('loginFailure'))
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <Card className="w-full max-w-md">
                <form onSubmit={handleSubmit}>
                    <CardHeader className="space-y-1 flex flex-col items-center text-center">
                        <div className="relative h-28 w-48 sm:h-28 sm:w-40 md:h-34 md:w-52 lg:h-44 lg:w-64 mb-2 overflow-hidden rounded-lg">
                            <Image
                                src="/Logo.png"
                                alt={tFooter('companyName')}
                                fill
                                className="object-cover"
                                priority
                            />
                        </div>

                        <CardTitle className="text-2xl font-bold tracking-tight">
                            {t('loginTitle')}
                        </CardTitle>
                        <CardDescription className="mb-2">
                            {t('loginDescription')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="email">{t('email')}</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder={t('emailPlaceholder')}
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">{t('password')}</Label>
                            <Input
                                id="password"
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                                className="mb-4"
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4">
                        <Button className="w-full" disabled={isLoading}>
                            {isLoading ? "Loading..." : t('login')}
                        </Button>
                        <div className="text-center text-sm text-muted-foreground">
                            {t('noAccount')}{" "}
                            <Link href="/auth/signup" className="underline underline-offset-4 hover:text-primary">
                                {t('signup')}
                            </Link>
                        </div>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}
