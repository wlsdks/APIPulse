'use client';

import { FadeInUp, StaggerContainer, StaggerItem } from '@/components/motion';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/language-context';
import { useTheme } from '@/contexts/theme-context';
import { cn } from '@/lib/utils';
import { Check, Database, Globe, Monitor, Moon, Palette, Server, Sun } from 'lucide-react';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();

  const themeOptions = [
    { value: 'light' as const, icon: Sun, label: t('settings.themeLight') },
    { value: 'dark' as const, icon: Moon, label: t('settings.themeDark') },
    { value: 'system' as const, icon: Monitor, label: t('settings.themeSystem') },
  ];

  const languageOptions = [
    { value: 'en' as const, flag: '🇺🇸', label: 'English' },
    { value: 'ko' as const, flag: '🇰🇷', label: '한국어' },
  ];

  return (
    <StaggerContainer className="space-y-6 max-w-3xl">
      <StaggerItem>
        <PageHeader title={t('settings.title')} subtitle={t('settings.subtitle')} />
      </StaggerItem>

      {/* Appearance */}
      <StaggerItem>
        <Card variant="elevated">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                <Palette className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <CardTitle>{t('settings.appearance')}</CardTitle>
                <CardDescription>{t('settings.appearanceDesc')}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Theme Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">
                {t('settings.theme')}
              </label>
              <div className="grid grid-cols-3 gap-3">
                {themeOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setTheme(option.value)}
                    className={cn(
                      'relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200',
                      theme === option.value
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-sm'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800'
                    )}
                  >
                    {theme === option.value && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                    <option.icon
                      className={cn(
                        'w-6 h-6 transition-colors',
                        theme === option.value ? 'text-blue-500' : 'text-gray-400'
                      )}
                    />
                    <span
                      className={cn(
                        'text-sm font-medium transition-colors',
                        theme === option.value ? 'text-blue-500' : 'text-gray-600 dark:text-gray-400'
                      )}
                    >
                      {option.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Language Selection */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">
                {t('settings.language')}
              </label>
              <div className="grid grid-cols-2 gap-3">
                {languageOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setLanguage(option.value)}
                    className={cn(
                      'relative flex items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all duration-200',
                      language === option.value
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-sm'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800'
                    )}
                  >
                    {language === option.value && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                    <span className="text-2xl">{option.flag}</span>
                    <span
                      className={cn(
                        'font-medium transition-colors',
                        language === option.value ? 'text-blue-500' : 'text-gray-600 dark:text-gray-400'
                      )}
                    >
                      {option.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </StaggerItem>

      {/* Backend Connection */}
      <StaggerItem>
        <Card variant="elevated">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <Server className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <CardTitle>{t('settings.backend')}</CardTitle>
                <CardDescription>{t('settings.backendDesc')}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label={t('settings.apiBaseUrl')}
              value={process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'}
              disabled
            />
            <p className="text-sm text-gray-500">{t('settings.apiUrlHint')}</p>
          </CardContent>
        </Card>
      </StaggerItem>

      {/* Database */}
      <StaggerItem>
        <Card variant="elevated">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                <Database className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <CardTitle>{t('settings.database')}</CardTitle>
                <CardDescription>{t('settings.databaseDesc')}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <p className="text-gray-500">{t('settings.databaseHint')}</p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <code className="px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-800 font-mono text-xs">
                    sqlite
                  </code>
                  <span className="text-gray-600 dark:text-gray-400">- {t('settings.databaseSqlite')}</span>
                </li>
                <li className="flex items-center gap-2">
                  <code className="px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-800 font-mono text-xs">
                    postgresql
                  </code>
                  <span className="text-gray-600 dark:text-gray-400">- {t('settings.databasePostgres')}</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </StaggerItem>

      {/* About */}
      <StaggerItem>
        <Card variant="elevated">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <Globe className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <CardTitle>{t('settings.about')}</CardTitle>
                <CardDescription>{t('settings.aboutDesc')}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-500">{t('settings.version')}</span>
                <span className="font-medium text-gray-900 dark:text-white">1.0.0</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-500">{t('settings.backendStack')}</span>
                <span className="font-medium text-gray-900 dark:text-white">Spring Boot 4.0.0 (Kotlin)</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-500">{t('settings.frontendStack')}</span>
                <span className="font-medium text-gray-900 dark:text-white">Next.js 16</span>
              </div>
              <div className="pt-2">
                <a
                  href="https://github.com/wlsdks/APIPulse"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-blue-500 hover:text-blue-600 hover:underline transition-colors"
                >
                  <Globe className="w-4 h-4" />
                  {t('settings.viewOnGithub')}
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </StaggerItem>
    </StaggerContainer>
  );
}
