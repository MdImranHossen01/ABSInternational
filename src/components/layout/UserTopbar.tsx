"use client";

import { useSession, signOut } from 'next-auth/react';
import { User, LogOut, Bell, ShieldCheck, Menu, UserPlus } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/mode-toggle';
import { SidebarTrigger } from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function UserTopbar() {
  const { data: session } = useSession();
  const isAdmin = (session?.user as any)?.role === 'admin' || (session?.user as any)?.role === 'super_admin';

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6 justify-between sticky top-0 z-30">
      <div className="flex items-center gap-4">
        {/* Mobile hamburger */}
        <SidebarTrigger className="md:hidden" aria-label="Open sidebar menu">
          <Menu className="h-5 w-5" />
        </SidebarTrigger>
      </div>

      {/* Desktop spacer */}
      <div className="hidden md:flex flex-1" />

      <div className="flex items-center gap-3">

        <Link href="/dashboard/notifications">
          <Button variant="ghost" size="icon" className="relative rounded-full" title="Notifications">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-primary" />
          </Button>
        </Link>

        <ModeToggle />

        {session?.user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="rounded-full overflow-hidden border border-primary/20">
                {session.user.image ? (
                  <Image
                    src={session.user.image}
                    alt={session.user.name || "User"}
                    width={40}
                    height={40}
                    className="h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <User className="h-5 w-5" />
                )}
                <span className="sr-only">User menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuGroup>
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-bold leading-none">{session.user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground whitespace-nowrap overflow-hidden text-ellipsis">
                      {session.user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/profile">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              {isAdmin && (
                <DropdownMenuItem asChild>
                  <Link href="/admin/dashboard" className="text-amber-700 dark:text-amber-300 font-semibold">
                    <ShieldCheck className="mr-2 h-4 w-4 text-amber-600" />
                    <span>System Dashboard</span>
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem asChild>
                <Link href="/register">
                  <UserPlus className="mr-2 h-4 w-4" />
                  <span>Register</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() => signOut({ callbackUrl: window.location.origin })}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button variant="secondary" size="icon" className="rounded-full">
            <User className="h-5 w-5" />
          </Button>
        )}
      </div>
    </header>
  );
}
