'use client';

import { useSidebar } from '@/contexts/sidebar-context';
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface MainContentProps {
  children: ReactNode;
}

export function MainContent({ children }: MainContentProps) {
  const { isCollapsed } = useSidebar();

  return (
    <motion.main
      initial={false}
      animate={{ marginLeft: isCollapsed ? 72 : 256 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className="flex-1 p-8 min-h-screen"
    >
      {children}
    </motion.main>
  );
}
