import { useTranslations } from "next-intl"
import { ArrowLeft, Lock, Eye, Database, UserCheck, Shield } from "lucide-react"
import { Link } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"

export default function PrivacyPolicyPage() {
    const t = useTranslations('PrivacyPolicy')

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
                    <p className="text-xs sm:text-sm text-muted-foreground">
                        {t('lastUpdated')}
                    </p>
                </div>

                {/* Privacy Sections */}
                <div className="space-y-8 sm:space-y-12">
                    {/* Information Collection */}
                    <section className="space-y-4 sm:space-y-6">
                        <div className="flex items-center gap-2 sm:gap-3">
                            <div className="rounded-lg bg-primary/10 p-2 sm:p-3">
                                <Database className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                            </div>
                            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-foreground">
                                {t('collection.title')}
                            </h2>
                        </div>
                        <div className="space-y-4 text-muted-foreground leading-relaxed">
                            <p className="text-sm sm:text-base">{t('collection.intro')}</p>
                            <div className="rounded-lg border bg-card p-4 sm:p-6 space-y-3">
                                <h3 className="font-semibold text-foreground text-sm sm:text-base">
                                    {t('collection.typesTitle')}
                                </h3>
                                <ul className="space-y-2 list-disc list-inside ms-4 sm:ms-7 text-sm sm:text-base">
                                    <li>{t('collection.type1')}</li>
                                    <li>{t('collection.type2')}</li>
                                    <li>{t('collection.type3')}</li>
                                    <li>{t('collection.type4')}</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* How We Use Information */}
                    <section className="space-y-4 sm:space-y-6">
                        <div className="flex items-center gap-2 sm:gap-3">
                            <div className="rounded-lg bg-primary/10 p-2 sm:p-3">
                                <Eye className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                            </div>
                            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-foreground">
                                {t('usage.title')}
                            </h2>
                        </div>
                        <div className="space-y-4 text-muted-foreground leading-relaxed">
                            <p className="text-sm sm:text-base">{t('usage.intro')}</p>
                            <div className="rounded-lg border bg-card p-4 sm:p-6 space-y-3">
                                <ul className="space-y-2 list-disc list-inside ms-4 sm:ms-7 text-sm sm:text-base">
                                    <li>{t('usage.purpose1')}</li>
                                    <li>{t('usage.purpose2')}</li>
                                    <li>{t('usage.purpose3')}</li>
                                    <li>{t('usage.purpose4')}</li>
                                    <li>{t('usage.purpose5')}</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* Data Protection */}
                    <section className="space-y-4 sm:space-y-6">
                        <div className="flex items-center gap-2 sm:gap-3">
                            <div className="rounded-lg bg-primary/10 p-2 sm:p-3">
                                <Lock className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                            </div>
                            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-foreground">
                                {t('protection.title')}
                            </h2>
                        </div>
                        <div className="space-y-4 text-muted-foreground leading-relaxed">
                            <p className="text-sm sm:text-base">{t('protection.content1')}</p>
                            <p className="text-sm sm:text-base">{t('protection.content2')}</p>
                        </div>
                    </section>

                    {/* Your Rights */}
                    <section className="space-y-4 sm:space-y-6">
                        <div className="flex items-center gap-2 sm:gap-3">
                            <div className="rounded-lg bg-primary/10 p-2 sm:p-3">
                                <UserCheck className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                            </div>
                            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-foreground">
                                {t('rights.title')}
                            </h2>
                        </div>
                        <div className="space-y-4 text-muted-foreground leading-relaxed">
                            <p className="text-sm sm:text-base">{t('rights.intro')}</p>
                            <div className="rounded-lg border bg-card p-4 sm:p-6 space-y-3">
                                <ul className="space-y-2 list-disc list-inside ms-4 sm:ms-7 text-sm sm:text-base">
                                    <li>{t('rights.right1')}</li>
                                    <li>{t('rights.right2')}</li>
                                    <li>{t('rights.right3')}</li>
                                    <li>{t('rights.right4')}</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* Cookies */}
                    <section className="space-y-4 sm:space-y-6">
                        <div className="flex items-center gap-2 sm:gap-3">
                            <div className="rounded-lg bg-primary/10 p-2 sm:p-3">
                                <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                            </div>
                            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-foreground">
                                {t('cookies.title')}
                            </h2>
                        </div>
                        <div className="space-y-4 text-muted-foreground leading-relaxed">
                            <p className="text-sm sm:text-base">{t('cookies.content')}</p>
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
                    </section>
                </div>
            </div>
        </div>
    )
}
