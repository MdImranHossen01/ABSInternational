"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import Image from "next/image"
import {
  ShoppingBag,
  User as UserIcon,
  Settings,
  LogOut,
  Heart,
  Users,
  Wallet,
  Activity,
  BookOpen,
  HelpCircle,
  ClipboardList,
} from "lucide-react"
import { Logo } from "@/components/ui/logo"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"

const navItems = [
  { title: "Overview",          href: "/dashboard",           icon: ShoppingBag,   exact: true },
  { title: "My Orders",         href: "/dashboard/orders",    icon: ClipboardList, exact: false },
  { title: "Wallet & Ledgers",  href: "/dashboard/wallet",    icon: Wallet,        exact: false },
  { title: "Downline Team",     href: "/dashboard/network",   icon: Users,         exact: false },
  { title: "Seba Services",     href: "/dashboard/seba",      icon: Activity,      exact: false },
  { title: "Wishlist",          href: "/dashboard/wishlist",  icon: Heart,         exact: false },
  { title: "KYC & Profile",     href: "/dashboard/profile",   icon: UserIcon,      exact: false },
  { title: "Security Settings", href: "/dashboard/settings",  icon: Settings,      exact: false },
  { title: "Guidelines",        href: "/dashboard/guidelines",icon: BookOpen,      exact: false },
  { title: "Support Tickets",   href: "/dashboard/support",   icon: HelpCircle,    exact: false },
]

export function UserSidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()

  return (
    <Sidebar collapsible="icon">
      {/* Logo */}
      <SidebarHeader className="border-b px-3 py-3">
        <Logo />
      </SidebarHeader>

      {/* User profile strip */}
      <SidebarHeader className="border-b px-3 py-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-9 w-9 rounded-full bg-primary/10 border border-primary/20 overflow-hidden shrink-0 flex items-center justify-center">
            {session?.user?.image ? (
              <Image
                src={session.user.image}
                alt={session.user.name || "User"}
                width={36}
                height={36}
                className="h-full w-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <UserIcon className="h-5 w-5 text-primary" />
            )}
          </div>
          <div className="min-w-0 group-data-[collapsible=icon]:hidden">
            <p className="text-sm font-bold truncate leading-tight">{session?.user?.name ?? "User"}</p>
            <p className="text-[11px] text-muted-foreground truncate">{session?.user?.email}</p>
          </div>
        </div>
      </SidebarHeader>

      {/* Nav */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>My Dashboard</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive = item.exact
                  ? pathname === item.href
                  : pathname.startsWith(item.href)
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      render={<Link href={item.href} />}
                      isActive={isActive}
                      tooltip={item.title}
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Sign out footer */}
      <SidebarFooter className="border-t">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Sign Out"
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => signOut({ callbackUrl: window.location.origin })}
            >
              <LogOut />
              <span>Sign Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
