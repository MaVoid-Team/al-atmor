"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CreditCard, ArrowLeft } from "lucide-react"

export interface PaymentData {
    cardNumber: string
    cardHolder: string
    expiryDate: string
    cvv: string
}

interface PaymentFormProps {
    initialData: PaymentData
    onSubmit: (data: PaymentData) => void
    onBack: () => void
}

export function PaymentForm({ initialData, onSubmit, onBack }: PaymentFormProps) {
    const t = useTranslations('Checkout')
    const [formData, setFormData] = useState<PaymentData>(initialData)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSubmit(formData)
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    {t('payment.title')}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="cardNumber">{t('payment.cardNumber')}</Label>
                        <Input
                            id="cardNumber"
                            name="cardNumber"
                            placeholder="1234 5678 9012 3456"
                            value={formData.cardNumber}
                            onChange={handleChange}
                            maxLength={19}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="cardHolder">{t('payment.cardHolder')}</Label>
                        <Input
                            id="cardHolder"
                            name="cardHolder"
                            placeholder="John Doe"
                            value={formData.cardHolder}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="expiryDate">{t('payment.expiry')}</Label>
                            <Input
                                id="expiryDate"
                                name="expiryDate"
                                placeholder="MM/YY"
                                value={formData.expiryDate}
                                onChange={handleChange}
                                maxLength={5}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="cvv">{t('payment.cvv')}</Label>
                            <Input
                                id="cvv"
                                name="cvv"
                                type="password"
                                placeholder="123"
                                value={formData.cvv}
                                onChange={handleChange}
                                maxLength={4}
                                required
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={onBack} className="flex-1">
                            <ArrowLeft className="h-4 w-4 me-2" />
                            {t('payment.back')}
                        </Button>
                        <Button type="submit" className="flex-1">
                            {t('payment.continue')}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}
