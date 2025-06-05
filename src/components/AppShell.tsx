
"use client";

import type React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Home, 
  Menu, 
  StepForward, 
  Mic, 
  Wand2, 
  ClipboardList, 
  MessagesSquare, 
  Award, 
  Settings as SettingsIcon,
  LogOut,
  LifeBuoy,
  Gift      
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { auth } from '@/lib/firebase';
import { useLocalization } from '@/hooks/useLocalization'; // Import useLocalization

interface NavItemProps {
  href?: string;
  icon: React.ElementType;
  label: string;
  pathname?: string;
  onClick?: () => void;
  direction?: "ltr" | "rtl";
}

function NavItem({ href, icon: Icon, label, pathname, onClick, direction = "ltr" }: NavItemProps) {
  const commonClasses = "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary";
  
  if (onClick) {
    return (
      <button
        onClick={onClick}
        className={cn(
          commonClasses,
          "text-muted-foreground w-full text-left",
          direction === "rtl" && "flex-row-reverse"
        )}
      >
        {direction === "rtl" && <span className="flex-1 text-right">{label}</span>}
        <Icon className="h-5 w-5" />
        {direction === "ltr" && <span className="flex-1 text-left">{label}</span>}
      </button>
    );
  }

  if (!href) {
    return null; 
  }

  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={cn(
        commonClasses,
        "text-muted-foreground",
        isActive && "bg-primary/10 text-primary",
        direction === "rtl" && "flex-row-reverse"
      )}
    >
      {direction === "rtl" && <span className="flex-1 text-right">{label}</span>}
      <Icon className="h-5 w-5" />
      {direction === "ltr" && <span className="flex-1 text-left">{label}</span>}
    </Link>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const { t, direction, isInitialized: localeInitialized } = useLocalization(); // Use localization hook

  const handleLogout = async () => {
    try {
      await auth.signOut();
      toast({
        title: "Logged Out", // This could also be translated
        description: "You have been successfully logged out.",
      });
      router.push('/auth/login'); 
    } catch (error) {
      console.error("Logout Error:", error);
      toast({
        variant: "destructive",
        title: "Logout Failed",
        description: "Could not log out. Please try again.",
      });
    }
  };

  if (!localeInitialized) {
    // You might want a proper skeleton loader here for the whole shell
    return (
      <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
        <div className="hidden border-r bg-muted/40 md:block">
          <div className="flex h-full max-h-screen flex-col gap-2">
            <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
              {/* Skeleton for title */}
            </div>
            <div className="flex-1 p-2 lg:p-4 space-y-1">
              {[...Array(8)].map((_, i) => <div key={i} className="h-8 bg-muted rounded-md animate-pulse"></div>)}
            </div>
          </div>
        </div>
        <div className="flex flex-col">
          <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6 md:hidden">
            {/* Skeleton for mobile header */}
          </header>
          <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background">
            {/* Children might need their own loading state or be delayed */}
            {children}
          </main>
        </div>
      </div>
    );
  }

  const navItems: NavItemProps[] = [
    { href: "/", icon: Home, label: t('navHome') }, 
    { href: "/sounds", icon: Mic, label: t('navSounds') },
    { href: "/words", icon: Wand2, label: t('navGenerateWords') },
    { href: "/exercises", icon: ClipboardList, label: t('navExercises') },
    { href: "/conversations", icon: MessagesSquare, label: t('navConversations') },
    { href: "/exams", icon: Award, label: t('navExams') },
    { href: "/support", icon: LifeBuoy, label: t('navSupport') },
    { href: "/donate", icon: Gift, label: t('navDonate') },       
    { href: "/settings", icon: SettingsIcon, label: t('navSettings') },
    { label: t('navLogout'), icon: LogOut, onClick: handleLogout },
  ];
  
  const appTitle = t('appName');

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]" dir={direction}>
      <div className={cn("hidden border-r bg-muted/40 md:block", direction === "rtl" && "border-l md:border-r-0")}>
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className={cn("flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6", direction === "rtl" && "flex-row-reverse")}>
            <Link href="/" className="flex items-center gap-2 font-semibold text-primary">
              <StepForward className="h-6 w-6" />
              {appTitle}
            </Link>
          </div>
          <div className="flex-1">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              {navItems.map((item) => (
                <NavItem key={item.label} {...item} pathname={pathname} direction={direction} />
              ))}
            </nav>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <header className={cn("flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6 md:hidden", direction === "rtl" && "flex-row-reverse")}>
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
            <SheetContent side={direction === "rtl" ? "right" : "left"} className="flex flex-col p-0"> {/* Adjust side for RTL */}
              <SheetHeader className={cn("border-b px-4 py-3", direction === "rtl" && "flex-row-reverse text-right")}>
                <SheetTitle asChild>
                  <Link
                    href="/"
                    className="flex items-center gap-2 text-lg font-semibold text-primary"
                  >
                    <StepForward className="h-6 w-6" />
                    {appTitle}
                  </Link>
                </SheetTitle>
              </SheetHeader>
              <div className="flex-1 overflow-y-auto">
                <nav className="grid gap-2 p-4 text-lg font-medium">
                  {navItems.map((item) => (
                    <NavItem key={item.label} {...item} pathname={pathname} direction={direction} />
                  ))}
                </nav>
              </div>
            </SheetContent>
          </Sheet>
           <div className={cn("flex items-center gap-2 font-semibold text-primary md:hidden", direction === "rtl" && "flex-row-reverse")}>
             <StepForward className="h-6 w-6" />
             {appTitle}
           </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}

    