"use client"

import { useLocale } from "next-intl"
import { useRouter, usePathname } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const languages = [
    {
        code: 'ar',
        name: 'العربية',
        flag: '🇸🇦',
        dir: 'rtl'
    },
    {
        code: 'en',
        name: 'English',
        flag: '🇬🇧',
        dir: 'ltr'
    }
]

export function LanguageSwitcher() {
    const locale = useLocale()
    const router = useRouter()
    const pathname = usePathname()

    const currentLanguage = languages.find(lang => lang.code === locale) || languages[0]

    const switchLanguage = (newLocale: string) => {
        router.replace(pathname, { locale: newLocale })
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                    <span className="text-base">{currentLanguage.flag}</span>
                    <span className="sr-only">{currentLanguage.name}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="space-y-0.5">
                {languages.map((language) => (
                    <DropdownMenuItem
                        key={language.code}
                        onClick={() => switchLanguage(language.code)}
                        className={`gap-2 cursor-pointer ${locale === language.code ? 'bg-accent text-foreground' : ''
                            }`}
                    >
                        <span className="text-lg">{language.flag}</span>
                        <span>{language.name}</span>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
