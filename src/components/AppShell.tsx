
"use client";

import type React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Home, 
  LayoutDashboard, 
  Menu, 
  StepForward, 
  Mic, 
  Type, 
  ClipboardList, 
  MessagesSquare, 
  Award, 
  Settings as SettingsIcon,
  LogOut // Added LogOut icon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast"; // Added useToast

interface NavItemProps {
  href?: string; // Made href optional
  icon: React.ElementType;
  label: string;
  pathname?: string; // pathname is only relevant for Links
  onClick?: () => void; // Added onClick for actions
}

function NavItem({ href, icon: Icon, label, pathname, onClick }: NavItemProps) {
  const commonClasses = "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary";
  
  if (onClick) {
    return (
      <button
        onClick={onClick}
        className={cn(
          commonClasses,
          "text-muted-foreground w-full text-left"
          // font-medium and text-sm/text-lg are inherited from parent <nav>
        )}
      >
        <Icon className="h-5 w-5" />
        {label}
      </button>
    );
  }

  // Fallback for when onClick is not provided, href must be defined.
  if (!href) {
    // This case should ideally not be reached if navItems are structured correctly.
    return null; 
  }

  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={cn(
        commonClasses,
        "text-muted-foreground", // font-medium and text-sm/text-lg are inherited
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
  const router = useRouter(); // Added router
  const { toast } = useToast(); // Added toast

  const handleLogout = async () => {
    // In a real app, call your auth provider's logout method here.
    // For example: await firebase.auth().signOut();
    // Or if using NextAuth.js: await signOut();
    console.log("User logged out (simulated)");
    
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    
    router.push('/auth/login'); // Redirect to login page
  };

  const navItems: NavItemProps[] = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/sounds", icon: Mic, label: "Sounds" },
    { href: "/words", icon: Type, label: "Words" },
    { href: "/exercises", icon: ClipboardList, label: "Exercises" },
    { href: "/conversations", icon: MessagesSquare, label: "Conversations" },
    { href: "/exams", icon: Award, label: "Exams" },
    { href: "/settings", icon: SettingsIcon, label: "Settings" },
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { label: "Logout", icon: LogOut, onClick: handleLogout }, // Added Logout item
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
                <NavItem key={item.label} {...item} pathname={pathname} />
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
                    <NavItem key={item.label} {...item} pathname={pathname} />
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
