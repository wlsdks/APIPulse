'use client';

import { useLanguage } from '@/contexts/language-context';
import { cn } from '@/lib/utils';
import { Activity, Bell, FolderKanban, Home, Settings, Zap } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navigation = [
  { key: 'nav.dashboard', href: '/', icon: Home },
  { key: 'nav.projects', href: '/projects', icon: FolderKanban },
  { key: 'nav.notifications', href: '/notifications', icon: Bell },
  { key: 'nav.settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { t } = useLanguage();

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-gray-900 text-white flex flex-col">
      <div className="p-6 border-b border-gray-800">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">API Pulse</h1>
            <p className="text-xs text-gray-400">API Health Monitor</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.key}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{t(item.key)}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-gray-800">
          <Activity className="w-5 h-5 text-green-400" />
          <div className="flex-1">
            <p className="text-sm font-medium">{t('nav.systemStatus')}</p>
            <p className="text-xs text-green-400">{t('nav.allOperational')}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
