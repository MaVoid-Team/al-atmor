import { useTranslations } from "next-intl"
import { ArrowLeft, Package, RefreshCw, Clock, CheckCircle2, XCircle } from "lucide-react"
import { Link } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"

export default function ReturnsExchangesPage() {
    const t = useTranslations('ReturnsExchanges')

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

                {/* Policy Sections */}
                <div className="space-y-8 sm:space-y-12">
                    {/* Return Policy */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-primary/10 p-3">
                                <RefreshCw className="h-6 w-6 text-primary" />
                            </div>
                            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-foreground">
                                {t('returnPolicy.title')}
                            </h2>
                        </div>
                        <div className="space-y-4 text-muted-foreground leading-relaxed">
                            <p className="text-base">{t('returnPolicy.intro')}</p>
                            <div className="rounded-lg border bg-card p-6 space-y-3">
                                <h3 className="font-semibold text-foreground flex items-center gap-2">
                                    <CheckCircle2 className="h-5 w-5 text-primary" />
                                    {t('returnPolicy.eligibleTitle')}
                                </h3>
                                <ul className="space-y-2 list-disc list-inside ms-4 sm:ms-7 text-sm sm:text-base">
                                    <li>{t('returnPolicy.eligible1')}</li>
                                    <li>{t('returnPolicy.eligible2')}</li>
                                    <li>{t('returnPolicy.eligible3')}</li>
                                    <li>{t('returnPolicy.eligible4')}</li>
                                </ul>
                            </div>
                            <div className="rounded-lg border bg-card p-6 space-y-3">
                                <h3 className="font-semibold text-foreground flex items-center gap-2">
                                    <XCircle className="h-5 w-5 text-destructive" />
                                    {t('returnPolicy.nonEligibleTitle')}
                                </h3>
                                <ul className="space-y-2 list-disc list-inside ms-4 sm:ms-7 text-sm sm:text-base">
                                    <li>{t('returnPolicy.nonEligible1')}</li>
                                    <li>{t('returnPolicy.nonEligible2')}</li>
                                    <li>{t('returnPolicy.nonEligible3')}</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* Exchange Policy */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-primary/10 p-3">
                                <Package className="h-6 w-6 text-primary" />
                            </div>
                            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-foreground">
                                {t('exchangePolicy.title')}
                            </h2>
                        </div>
                        <div className="space-y-4 text-muted-foreground leading-relaxed">
                            <p className="text-base">{t('exchangePolicy.intro')}</p>
                            <div className="rounded-lg border bg-card p-6 space-y-3">
                                <h3 className="font-semibold text-foreground">
                                    {t('exchangePolicy.processTitle')}
                                </h3>
                                <ol className="space-y-2 list-decimal list-inside ms-4 sm:ms-7 text-sm sm:text-base">
                                    <li>{t('exchangePolicy.step1')}</li>
                                    <li>{t('exchangePolicy.step2')}</li>
                                    <li>{t('exchangePolicy.step3')}</li>
                                    <li>{t('exchangePolicy.step4')}</li>
                                </ol>
                            </div>
                        </div>
                    </section>

                    {/* Timeline */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-primary/10 p-3">
                                <Clock className="h-6 w-6 text-primary" />
                            </div>
                            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-foreground">
                                {t('timeline.title')}
                            </h2>
                        </div>
                        <div className="space-y-4 text-muted-foreground leading-relaxed">
                            <div className="rounded-lg border bg-card p-6 space-y-4">
                                <div className="flex items-start gap-4">
                                    <div className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
                                        {t('timeline.days', { days: 14 })}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-foreground mb-1">
                                            {t('timeline.returnWindowTitle')}
                                        </h3>
                                        <p className="text-sm">{t('timeline.returnWindowDesc')}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
                                        {t('timeline.days', { days: '3-5' })}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-foreground mb-1">
                                            {t('timeline.processingTitle')}
                                        </h3>
                                        <p className="text-sm">{t('timeline.processingDesc')}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
                                        {t('timeline.days', { days: '7-10' })}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-foreground mb-1">
                                            {t('timeline.refundTitle')}
                                        </h3>
                                        <p className="text-sm">{t('timeline.refundDesc')}</p>
                                    </div>
                                </div>
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
                        <div className="flex flex-wrap justify-center gap-4 pt-4">
                            <Link href="/profile">
                                <Button size="lg" className="gap-2 w-full sm:w-auto">
                                    {t('contact.viewOrders')}
                                </Button>
                            </Link>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    )
}
