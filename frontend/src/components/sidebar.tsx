'use client';

import { useLanguage } from '@/contexts/language-context';
import { useSidebar } from '@/contexts/sidebar-context';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import {
  Activity,
  Bell,
  ChevronLeft,
  ChevronRight,
  FolderKanban,
  Home,
  Settings,
  Zap,
} from 'lucide-react';
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
  const { isCollapsed, toggle } = useSidebar();

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 72 : 256 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className="fixed left-0 top-0 h-full bg-gray-900 text-white flex flex-col z-30"
    >
      {/* Logo Section */}
      <div className="p-4 border-b border-gray-800">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shrink-0">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <motion.div
            initial={false}
            animate={{
              opacity: isCollapsed ? 0 : 1,
              width: isCollapsed ? 0 : 'auto',
            }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden whitespace-nowrap"
          >
            <h1 className="text-xl font-bold">API Pulse</h1>
            <p className="text-xs text-gray-400">API Health Monitor</p>
          </motion.div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navigation.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.key}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200',
                'group relative',
                isActive
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              )}
            >
              <item.icon className={cn('w-5 h-5 shrink-0', isCollapsed && 'mx-auto')} />
              <motion.span
                initial={false}
                animate={{
                  opacity: isCollapsed ? 0 : 1,
                  width: isCollapsed ? 0 : 'auto',
                }}
                transition={{ duration: 0.2 }}
                className="font-medium overflow-hidden whitespace-nowrap"
              >
                {t(item.key)}
              </motion.span>

              {/* Tooltip for collapsed state */}
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-sm rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                  {t(item.key)}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* System Status */}
      <div className="p-3 border-t border-gray-800">
        <div
          className={cn(
            'flex items-center gap-3 px-3 py-3 rounded-lg bg-gray-800/50',
            isCollapsed && 'justify-center'
          )}
        >
          <div className="relative shrink-0">
            <Activity className="w-5 h-5 text-green-400" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-400 rounded-full animate-pulse-subtle" />
          </div>
          <motion.div
            initial={false}
            animate={{
              opacity: isCollapsed ? 0 : 1,
              width: isCollapsed ? 0 : 'auto',
            }}
            transition={{ duration: 0.2 }}
            className="flex-1 overflow-hidden"
          >
            <p className="text-sm font-medium whitespace-nowrap">{t('nav.systemStatus')}</p>
            <p className="text-xs text-green-400 whitespace-nowrap">{t('nav.allOperational')}</p>
          </motion.div>
        </div>
      </div>

      {/* Collapse Toggle Button */}
      <button
        onClick={toggle}
        className={cn(
          'absolute -right-3 top-20 w-6 h-6 rounded-full',
          'bg-gray-800 border-2 border-gray-700 text-gray-400',
          'flex items-center justify-center',
          'hover:bg-gray-700 hover:text-white hover:border-gray-600',
          'transition-all duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500'
        )}
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {isCollapsed ? (
          <ChevronRight className="w-3 h-3" />
        ) : (
          <ChevronLeft className="w-3 h-3" />
        )}
      </button>
    </motion.aside>
  );
}
