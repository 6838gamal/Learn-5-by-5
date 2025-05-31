
"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import AppShell from '@/components/AppShell';

const AUTH_ROUTES = ['/auth/login', '/auth/register', '/auth/forgot-password'];

export default function ConditionalAppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthRoute = AUTH_ROUTES.includes(pathname);

  if (isAuthRoute) {
    return <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">{children}</main>;
  }

  return <AppShell>{children}</AppShell>;
}
