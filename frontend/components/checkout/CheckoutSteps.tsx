"use client"

import { useTranslations } from "next-intl"

interface CheckoutStepsProps {
    currentStep: number
}

export function CheckoutSteps({ currentStep }: CheckoutStepsProps) {
    const t = useTranslations('Checkout')

    const steps = [
        { number: 1, label: t('steps.shipping') },
        { number: 2, label: t('steps.review') },
    ]

    return (
        <div className="flex items-center justify-center">
            {steps.map((step, index) => (
                <div key={step.number} className="flex items-center">
                    <div className="flex flex-col items-center">
                        <div
                            className={`flex items-center justify-center w-10 h-10 rounded-full border-2 font-semibold transition-colors ${currentStep >= step.number
                                ? 'bg-primary text-primary-foreground border-primary'
                                : 'bg-background text-muted-foreground border-muted'
                                }`}
                        >
                            {step.number}
                        </div>
                        <span className={`mt-2 text-sm ${currentStep >= step.number ? 'text-primary font-medium' : 'text-muted-foreground'
                            }`}>
                            {step.label}
                        </span>
                    </div>
                    {index < steps.length - 1 && (
                        <div
                            className={`w-16 md:w-24 h-0.5 mx-2 transition-colors ${currentStep > step.number ? 'bg-primary' : 'bg-muted'
                                }`}
                        />
                    )}
                </div>
            ))}
        </div>
    )
}
