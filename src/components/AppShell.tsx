
"use client";

import type React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { GraduationCap, LayoutDashboard, Menu, StepForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface NavItemProps {
  href: string;
  icon: React.ElementType;
  label: string;
  pathname: string;
}

function NavItem({ href, icon: Icon, label, pathname }: NavItemProps) {
  const isActive = pathname === href;
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
        isActive && "bg-primary/10 text-primary"
      )}
    >
      <Icon className="h-5 w-5" />
      {label}
    </Link>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { href: "/", icon: GraduationCap, label: "Learn" },
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  ];

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold text-primary">
              <StepForward className="h-6 w-6" />
              LinguaLeap
            </Link>
          </div>
          <div className="flex-1">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              {navItems.map((item) => (
                <NavItem key={item.href} {...item} pathname={pathname} />
              ))}
            </nav>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6 md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col p-0">
              <SheetHeader className="border-b px-4 py-3">
                <SheetTitle asChild>
                  <Link
                    href="/"
                    className="flex items-center gap-2 text-lg font-semibold text-primary"
                  >
                    <StepForward className="h-6 w-6" />
                    LinguaLeap
                  </Link>
                </SheetTitle>
              </SheetHeader>
              <div className="flex-1 overflow-y-auto">
                <nav className="grid gap-2 p-4 text-lg font-medium">
                  {navItems.map((item) => (
                    <NavItem key={item.href} {...item} pathname={pathname} />
                  ))}
                </nav>
              </div>
            </SheetContent>
          </Sheet>
           <div className="flex items-center gap-2 font-semibold text-primary md:hidden">
             <StepForward className="h-6 w-6" />
             LinguaLeap
           </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}
