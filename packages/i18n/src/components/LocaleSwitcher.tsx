import { useLocale, useTranslations } from 'next-intl';
import { useRouter, usePathname } from '../routing';
import { LOCALE_INFO, type Locale } from '../types';
import { getLocaleDirection } from '../utils/locale-utils';

interface LocaleSwitcherProps {
  className?: string;
  variant?: 'dropdown' | 'buttons';
}

export function LocaleSwitcher({ className = '', variant = 'dropdown' }: LocaleSwitcherProps) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations('common');

  const handleLocaleChange = (newLocale: Locale) => {
    // Store user preference
    if (typeof window !== 'undefined') {
      localStorage.setItem('user-locale', newLocale);
    }

    // Update the HTML lang attribute
    document.documentElement.lang = newLocale;
    document.documentElement.dir = getLocaleDirection(newLocale);

    // Navigate to the new locale
    router.replace(pathname, { locale: newLocale });
  };

  if (variant === 'buttons') {
    return (
      <div className={`flex gap-2 ${className}`}>
        {Object.values(LOCALE_INFO).map((localeInfo) => (
          <button
            key={localeInfo.code}
            onClick={() => handleLocaleChange(localeInfo.code)}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              locale === localeInfo.code
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
            aria-label={`Switch to ${localeInfo.name}`}
          >
            <span className="mr-1">{localeInfo.flag}</span>
            {localeInfo.nativeName}
          </button>
        ))}
      </div>
    );
  }

  return (
    <select
      value={locale}
      onChange={(e) => handleLocaleChange(e.target.value as Locale)}
      className={`px-3 py-2 border border-input bg-background rounded-md text-sm ${className}`}
      aria-label={t('language')}
    >
      {Object.values(LOCALE_INFO).map((localeInfo) => (
        <option key={localeInfo.code} value={localeInfo.code}>
          {localeInfo.flag} {localeInfo.name} ({localeInfo.nativeName})
        </option>
      ))}
    </select>
  );
}
