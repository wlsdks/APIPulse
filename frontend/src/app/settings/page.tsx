'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/language-context';
import { useTheme } from '@/contexts/theme-context';
import { Database, Globe, Monitor, Moon, Palette, Server, Sun } from 'lucide-react';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('settings.title')}</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">{t('settings.subtitle')}</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
              <Palette className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <CardTitle>{t('settings.appearance')}</CardTitle>
              <CardDescription>{t('settings.appearanceDesc')}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              {t('settings.theme')}
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setTheme('light')}
                className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-colors ${
                  theme === 'light'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <Sun className={`w-6 h-6 ${theme === 'light' ? 'text-blue-500' : 'text-gray-500'}`} />
                <span className={`text-sm font-medium ${theme === 'light' ? 'text-blue-500' : 'text-gray-600 dark:text-gray-400'}`}>
                  {t('settings.themeLight')}
                </span>
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-colors ${
                  theme === 'dark'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <Moon className={`w-6 h-6 ${theme === 'dark' ? 'text-blue-500' : 'text-gray-500'}`} />
                <span className={`text-sm font-medium ${theme === 'dark' ? 'text-blue-500' : 'text-gray-600 dark:text-gray-400'}`}>
                  {t('settings.themeDark')}
                </span>
              </button>
              <button
                onClick={() => setTheme('system')}
                className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-colors ${
                  theme === 'system'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <Monitor className={`w-6 h-6 ${theme === 'system' ? 'text-blue-500' : 'text-gray-500'}`} />
                <span className={`text-sm font-medium ${theme === 'system' ? 'text-blue-500' : 'text-gray-600 dark:text-gray-400'}`}>
                  {t('settings.themeSystem')}
                </span>
              </button>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              {t('settings.language')}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setLanguage('en')}
                className={`flex items-center justify-center gap-2 p-4 rounded-lg border-2 transition-colors ${
                  language === 'en'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <span className="text-xl">🇺🇸</span>
                <span className={`font-medium ${language === 'en' ? 'text-blue-500' : 'text-gray-600 dark:text-gray-400'}`}>
                  English
                </span>
              </button>
              <button
                onClick={() => setLanguage('ko')}
                className={`flex items-center justify-center gap-2 p-4 rounded-lg border-2 transition-colors ${
                  language === 'ko'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <span className="text-xl">🇰🇷</span>
                <span className={`font-medium ${language === 'ko' ? 'text-blue-500' : 'text-gray-600 dark:text-gray-400'}`}>
                  한국어
                </span>
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
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
          <p className="text-sm text-gray-500">
            {t('settings.apiUrlHint')}
          </p>
        </CardContent>
      </Card>

      <Card>
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
          <div className="space-y-2 text-sm">
            <p className="text-gray-500">
              {t('settings.databaseHint')}
            </p>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-400">
              <li><code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">sqlite</code> - {t('settings.databaseSqlite')}</li>
              <li><code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">postgresql</code> - {t('settings.databasePostgres')}</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
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
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <p><strong>{t('settings.version')}:</strong> 1.0.0</p>
            <p><strong>{t('settings.backendStack')}:</strong> Spring Boot 4.0.0 (Kotlin)</p>
            <p><strong>{t('settings.frontendStack')}:</strong> Next.js 16</p>
            <p className="pt-2">
              <a
                href="https://github.com/wlsdks/APIPulse"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                {t('settings.viewOnGithub')}
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
