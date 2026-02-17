import { useTranslations } from "next-intl"
import { ArrowLeft, Shield, Wrench, Clock, CheckCircle2, AlertTriangle, Phone } from "lucide-react"
import { Link } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"

export default function WarrantyMaintenancePage() {
    const t = useTranslations('WarrantyMaintenance')

    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-4xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16 mx-auto">
                {/* Back Button */}
                <Link href="/">
                    <Button variant="ghost" className="mb-6 sm:mb-8 gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        {t('back')}
                    </Button>
                </Link>

                {/* Header */}
                <div className="mb-8 sm:mb-12 space-y-3 sm:space-y-4">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
                        {t('title')}
                    </h1>
                    <p className="text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed">
                        {t('subtitle')}
                    </p>
                </div>

                {/* Warranty & Maintenance Sections */}
                <div className="space-y-8 sm:space-y-12">
                    {/* Warranty Coverage */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-primary/10 p-3">
                                <Shield className="h-6 w-6 text-primary" />
                            </div>
                            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-foreground">
                                {t('warranty.title')}
                            </h2>
                        </div>
                        <div className="space-y-4 text-muted-foreground leading-relaxed">
                            <p className="text-base">{t('warranty.intro')}</p>
                            <div className="rounded-lg border bg-card p-6 space-y-3">
                                <h3 className="font-semibold text-foreground flex items-center gap-2">
                                    <CheckCircle2 className="h-5 w-5 text-primary" />
                                    {t('warranty.coveredTitle')}
                                </h3>
                                <ul className="space-y-2 list-disc list-inside ms-4 sm:ms-7 text-sm sm:text-base">
                                    <li>{t('warranty.covered1')}</li>
                                    <li>{t('warranty.covered2')}</li>
                                    <li>{t('warranty.covered3')}</li>
                                    <li>{t('warranty.covered4')}</li>
                                </ul>
                            </div>
                            <div className="rounded-lg border bg-card p-6 space-y-3">
                                <h3 className="font-semibold text-foreground flex items-center gap-2">
                                    <AlertTriangle className="h-5 w-5 text-destructive" />
                                    {t('warranty.notCoveredTitle')}
                                </h3>
                                <ul className="space-y-2 list-disc list-inside ms-4 sm:ms-7 text-sm sm:text-base">
                                    <li>{t('warranty.notCovered1')}</li>
                                    <li>{t('warranty.notCovered2')}</li>
                                    <li>{t('warranty.notCovered3')}</li>
                                    <li>{t('warranty.notCovered4')}</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* Warranty Period */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-primary/10 p-3">
                                <Clock className="h-6 w-6 text-primary" />
                            </div>
                            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-foreground">
                                {t('period.title')}
                            </h2>
                        </div>
                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="rounded-lg border bg-card p-6 space-y-3">
                                <div className="rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary w-fit">
                                    {t('period.standard')}
                                </div>
                                <h3 className="font-semibold text-foreground">
                                    {t('period.standardTitle')}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    {t('period.standardDesc')}
                                </p>
                            </div>
                            <div className="rounded-lg border bg-card p-6 space-y-3">
                                <div className="rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary w-fit">
                                    {t('period.extended')}
                                </div>
                                <h3 className="font-semibold text-foreground">
                                    {t('period.extendedTitle')}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    {t('period.extendedDesc')}
                                </p>
                            </div>
                            <div className="rounded-lg border bg-card p-6 space-y-3">
                                <div className="rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary w-fit">
                                    {t('period.manufacturer')}
                                </div>
                                <h3 className="font-semibold text-foreground">
                                    {t('period.manufacturerTitle')}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    {t('period.manufacturerDesc')}
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Maintenance Services */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-primary/10 p-3">
                                <Wrench className="h-6 w-6 text-primary" />
                            </div>
                            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-foreground">
                                {t('maintenance.title')}
                            </h2>
                        </div>
                        <div className="space-y-4 text-muted-foreground leading-relaxed">
                            <p className="text-base">{t('maintenance.intro')}</p>
                            <div className="rounded-lg border bg-card p-6 space-y-3">
                                <h3 className="font-semibold text-foreground">
                                    {t('maintenance.servicesTitle')}
                                </h3>
                                <ul className="space-y-2 list-disc list-inside ms-4 sm:ms-7 text-sm sm:text-base">
                                    <li>{t('maintenance.service1')}</li>
                                    <li>{t('maintenance.service2')}</li>
                                    <li>{t('maintenance.service3')}</li>
                                    <li>{t('maintenance.service4')}</li>
                                    <li>{t('maintenance.service5')}</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* Claim Process */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-primary/10 p-3">
                                <Phone className="h-6 w-6 text-primary" />
                            </div>
                            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-foreground">
                                {t('claim.title')}
                            </h2>
                        </div>
                        <div className="space-y-4 text-muted-foreground leading-relaxed">
                            <div className="rounded-lg border bg-card p-6 space-y-4">
                                <h3 className="font-semibold text-foreground">
                                    {t('claim.processTitle')}
                                </h3>
                                <ol className="space-y-3 list-decimal list-inside ms-4 sm:ms-7 text-sm sm:text-base">
                                    <li>{t('claim.step1')}</li>
                                    <li>{t('claim.step2')}</li>
                                    <li>{t('claim.step3')}</li>
                                    <li>{t('claim.step4')}</li>
                                    <li>{t('claim.step5')}</li>
                                </ol>
                            </div>
                        </div>
                    </section>

                    {/* Contact Section */}
                    <section className="rounded-lg border bg-primary/5 p-4 sm:p-6 md:p-8 text-center space-y-3 sm:space-y-4">
                        <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-foreground">
                            {t('contact.title')}
                        </h2>
                        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                            {t('contact.description')}
                        </p>
                        <div className="flex flex-col items-center gap-2 pt-4">
                            <p className="text-foreground font-semibold">
                                {t('contact.phone')}
                            </p>
                            <p className="text-muted-foreground text-xs sm:text-sm">
                                {t('contact.hours')}
                            </p>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    )
}
