"use client"

import { useState } from "react"
import { useRouter } from "@/i18n/navigation"
import { Link } from "@/i18n/navigation"
import Image from "next/image"
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"

export default function SignupPage() {
    const t = useTranslations('Auth')
    const tFooter = useTranslations('Footer')
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        email: "",
        firstName: "",
        lastName: "",
        password: "",
        role: "customer"
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const res = await fetch("/api/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            })

            if (!res.ok) throw new Error(t('signupFailure'))
            toast.success(t('signupSuccess'))
            router.push("/auth/login")
        } catch (error) {
            toast.error(t('signupFailure'))
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <Card className="w-full max-w-md">
                <form onSubmit={handleSubmit}>
                    <CardHeader className="space-y-1 flex flex-col items-center text-center">
                        <div className="relative h-18 w-44 sm:h-24 sm:w-40 md:h-36 md:w-52 lg:h-48 lg:w-64 mb-2 overflow-hidden rounded-lg">
                            <Image
                                src="/Logo.png"
                                alt={tFooter('companyName')}
                                fill
                                className="object-cover"
                                priority
                            />
                        </div>
                        <CardTitle className="text-2xl font-bold tracking-tight">
                            {t('signupTitle')}
                        </CardTitle>
                        <CardDescription>
                            {t('signupDescription')}
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
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="firstName">{t('firstName')}</Label>
                                <Input
                                    id="firstName"
                                    type="text"
                                    placeholder={t('firstNamePlaceholder')}
                                    value={formData.firstName}
                                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="lastName">{t('lastName')}</Label>
                                <Input
                                    id="lastName"
                                    type="text"
                                    placeholder={t('lastNamePlaceholder')}
                                    value={formData.lastName}
                                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">{t('password')}</Label>
                            <Input
                                id="password"
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                            />
                        </div>
                        <div className="grid gap-2 mb-4">
                            <Label htmlFor="role">{t('role')}</Label>
                            <Select
                                defaultValue="customer"
                                onValueChange={(value) => setFormData({ ...formData, role: value })}
                            >
                                <SelectTrigger id="role" className="w-full">
                                    <SelectValue placeholder={t('selectRole')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="customer">{t('customer')}</SelectItem>
                                    <SelectItem value="admin">{t('admin')}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4">
                        <Button className="w-full" disabled={isLoading}>
                            {isLoading ? "Loading..." : t('signup')}
                        </Button>
                        <div className="text-center text-sm text-muted-foreground">
                            {t('hasAccount')}{" "}
                            <Link href="/auth/login" className="underline underline-offset-4 hover:text-primary">
                                {t('login')}
                            </Link>
                        </div>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}
