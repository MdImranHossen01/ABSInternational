"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
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
      <SidebarHeader className="border-b h-14 lg:h-[60px] px-3.5 flex items-center">
        <Logo 
          imageClassName="size-7 shrink-0" 
          textClassName="text-[13px] font-black tracking-tight whitespace-nowrap leading-none truncate block" 
        />
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
