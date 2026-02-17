import { useTranslations } from "next-intl"
import { ArrowLeft, Store, Target, Users, CheckCircle2, Heart, Eye } from "lucide-react"
import { Link } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"
import Image from "next/image"

export default function AboutUsPage() {
    const t = useTranslations('AboutUs')

    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-5xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16 mx-auto">
                {/* Back Button */}
                <Link href="/">
                    <Button variant="ghost" className="mb-8 gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        {t('back')}
                    </Button>
                </Link>

                {/* Header */}
                <div className="mb-8 sm:mb-12 space-y-4 sm:space-y-6 text-center">
                    <div className="flex justify-center mb-4 sm:mb-6">
                        <div className="relative h-20 w-20 sm:h-24 sm:w-24 md:h-32 md:w-32 overflow-hidden rounded-2xl">
                            <Image
                                src="/Logo.png"
                                alt="Al-Atmour Group Logo"
                                fill
                                className="object-cover"
                            />
                        </div>
                    </div>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
                        {t('title')}
                    </h1>
                    <p className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
                        {t('subtitle')}
                    </p>
                </div>

                {/* About Sections */}
                <div className="space-y-8 sm:space-y-12">
                    {/* Company Overview */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-primary/10 p-3">
                                <Store className="h-6 w-6 text-primary" />
                            </div>
                            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-foreground">
                                {t('overview.title')}
                            </h2>
                        </div>
                        <div className="space-y-4 text-muted-foreground leading-relaxed text-base">
                            <p>{t('overview.content1')}</p>
                            <p>{t('overview.content2')}</p>
                            <p>{t('overview.content3')}</p>
                        </div>
                    </section>

                    {/* Mission & Vision */}
                    <div className="grid md:grid-cols-2 gap-8">
                        <section className="rounded-lg border bg-card p-8 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-primary/10 p-3">
                                    <Target className="h-6 w-6 text-primary" />
                                </div>
                                <h2 className="text-xl font-semibold text-foreground">
                                    {t('mission.title')}
                                </h2>
                            </div>
                            <p className="text-muted-foreground leading-relaxed">
                                {t('mission.content')}
                            </p>
                        </section>

                        <section className="rounded-lg border bg-card p-8 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-primary/10 p-3">
                                    <Eye className="h-6 w-6 text-primary" />
                                </div>
                                <h2 className="text-xl font-semibold text-foreground">
                                    {t('vision.title')}
                                </h2>
                            </div>
                            <p className="text-muted-foreground leading-relaxed">
                                {t('vision.content')}
                            </p>
                        </section>
                    </div>

                    {/* Our Values */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-primary/10 p-3">
                                <Heart className="h-6 w-6 text-primary" />
                            </div>
                            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-foreground">
                                {t('values.title')}
                            </h2>
                        </div>
                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="rounded-lg border bg-card p-6 space-y-3">
                                <h3 className="font-semibold text-foreground text-lg">
                                    {t('values.value1Title')}
                                </h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {t('values.value1Desc')}
                                </p>
                            </div>
                            <div className="rounded-lg border bg-card p-6 space-y-3">
                                <h3 className="font-semibold text-foreground text-lg">
                                    {t('values.value2Title')}
                                </h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {t('values.value2Desc')}
                                </p>
                            </div>
                            <div className="rounded-lg border bg-card p-6 space-y-3">
                                <h3 className="font-semibold text-foreground text-lg">
                                    {t('values.value3Title')}
                                </h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {t('values.value3Desc')}
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Why Choose Us */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-primary/10 p-3">
                                <CheckCircle2 className="h-6 w-6 text-primary" />
                            </div>
                            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-foreground">
                                {t('whyUs.title')}
                            </h2>
                        </div>
                        <div className="rounded-lg border bg-card p-6 space-y-3">
                            <ul className="space-y-3 text-muted-foreground leading-relaxed">
                                <li className="flex items-start gap-3">
                                    <span className="text-primary mt-1">✓</span>
                                    <span>{t('whyUs.reason1')}</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-primary mt-1">✓</span>
                                    <span>{t('whyUs.reason2')}</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-primary mt-1">✓</span>
                                    <span>{t('whyUs.reason3')}</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-primary mt-1">✓</span>
                                    <span>{t('whyUs.reason4')}</span>
                                </li>
                            </ul>
                        </div>
                    </section>

                    {/* Contact CTA */}
                    <section className="rounded-lg border bg-primary/5 p-4 sm:p-6 md:p-8 text-center space-y-3 sm:space-y-4">
                        <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-foreground">
                            {t('contact.title')}
                        </h2>
                        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                            {t('contact.description')}
                        </p>
                        <div className="flex flex-wrap justify-center gap-4 pt-4">
                            <Link href="/products">
                                <Button size="lg" className="w-full sm:w-auto">
                                    {t('contact.browseProducts')}
                                </Button>
                            </Link>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    )
}
