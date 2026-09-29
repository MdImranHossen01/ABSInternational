"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import {
  LayoutDashboard,
  User as UserIcon,
  Network,
  Users,
  TrendingUp,
  Coins,
  Award,
  Trophy,
  Sparkles,
  Layers,
  Globe,
  Gift,
  Star,
  Crown,
  Plane,
  Users2,
  HeartHandshake,
  BookOpen,
  Tag,
  Package,
  ArrowUpCircle,
  History,
  ArrowDownCircle,
  Clock,
  Send,
  FileText,
  Landmark,
  CheckCircle2,
  Gem,
  Camera,
  Bell,
  Lock,
  HelpCircle,
  LogOut,
  X,
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
  useSidebar,
} from "@/components/ui/sidebar"

// Sequential items matching client's notebook order
const serialNavItems = [
  { title: "Dashboard",             href: "/dashboard",                 icon: LayoutDashboard, exact: true },
  { title: "My Profile",            href: "/dashboard/profile",         icon: UserIcon,        exact: false },
  { title: "My Tree",               href: "/dashboard/tree",            icon: Network,         exact: false },
  { title: "Team Performance",      href: "/dashboard/team-performance",icon: Users,           exact: false },
  { title: "Total Income",          href: "/dashboard/total-income",    icon: TrendingUp,      exact: false },
  { title: "Total Bonus",           href: "/dashboard/total-bonus",     icon: Coins,           exact: false },
  { title: "My Rank",               href: "/dashboard/my-rank",         icon: Award,           exact: false },
  { title: "Rank Achievement",      href: "/dashboard/rank-achievement",icon: Trophy,          exact: false },
  { title: "Sponsor Bonus",         href: "/dashboard/sponsor-bonus",   icon: Sparkles,        exact: false },
  { title: "Generation Bonus",     href: "/dashboard/generation-bonus",icon: Layers,          exact: false },
  { title: "Global Profit",        href: "/dashboard/global-profit",   icon: Globe,           exact: false },
  { title: "Incentive Fund",       href: "/dashboard/incentive-fund",  icon: Gift,            exact: false },
  { title: "Rank Dev Fund",        href: "/dashboard/rank-development-fund", icon: Star,     exact: false },
  { title: "Royalty Fund",         href: "/dashboard/royalty-fund",    icon: Crown,           exact: false },
  { title: "Tour Fund",            href: "/dashboard/tour-fund",       icon: Plane,           exact: false },
  { title: "Community Fund",       href: "/dashboard/community-fund",  icon: Users2,          exact: false },
  { title: "Charity Fund",         href: "/dashboard/charity-fund",    icon: HeartHandshake,  exact: false },
  { title: "Product Story",        href: "/dashboard/product-story",   icon: BookOpen,        exact: false },
  { title: "Product Categories",   href: "/dashboard/product-categories", icon: Tag,          exact: false },
  { title: "Packages (Basic/VIP)", href: "/dashboard/packages",        icon: Package,         exact: false },
  { title: "Deposit",              href: "/dashboard/deposit",         icon: ArrowUpCircle,   exact: false },
  { title: "Deposit History",      href: "/dashboard/deposit-history", icon: History,         exact: false },
  { title: "Withdraw",             href: "/dashboard/withdraw",        icon: ArrowDownCircle, exact: false },
  { title: "Withdraw History",     href: "/dashboard/withdraw-history",icon: Clock,           exact: false },
  { title: "Transfer",             href: "/dashboard/transfer",        icon: Send,            exact: false },
  { title: "Transaction Statement",href: "/dashboard/transaction-statement", icon: FileText, exact: false },
  { title: "Rank System",          href: "/dashboard/rank-system",     icon: Landmark,        exact: false },
  { title: "Rank Progress",        href: "/dashboard/rank-progress",   icon: CheckCircle2,    exact: false },
  { title: "Rank Reward",          href: "/dashboard/rank-reward",     icon: Gem,             exact: false },
  { title: "Achievement Photo",    href: "/dashboard/achievement-photo", icon: Camera,        exact: false },
  { title: "Reward History",       href: "/dashboard/reward-history",  icon: History,         exact: false },
  { title: "Notifications",        href: "/dashboard/notifications",   icon: Bell,            exact: false },
  { title: "Change Password",      href: "/dashboard/change-password", icon: Lock,            exact: false },
  { title: "Support Ticket",       href: "/dashboard/support",         icon: HelpCircle,      exact: false },
]

export function UserSidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const { isMobile, setOpenMobile } = useSidebar()

  const closeMobileSidebar = React.useCallback(() => {
    if (isMobile) {
      setOpenMobile(false)
    }
  }, [isMobile, setOpenMobile])

  // Automatically close mobile sidebar when route/pathname changes
  React.useEffect(() => {
    if (isMobile) {
      setOpenMobile(false)
    }
  }, [pathname, isMobile, setOpenMobile])

  return (
    <Sidebar collapsible="icon" className="border-r">
      {/* Header Logo & Mobile Close */}
      <SidebarHeader className="border-b h-14 lg:h-[60px] px-3 flex flex-row items-center justify-between overflow-hidden">
        <Link href="/" onClick={closeMobileSidebar} className="flex items-center">
          <Logo 
            imageClassName="size-6 shrink-0" 
            textClassName="text-sm font-black tracking-tight whitespace-nowrap leading-none" 
          />
        </Link>
        <button
          type="button"
          onClick={closeMobileSidebar}
          className="md:hidden p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
          aria-label="Close sidebar"
        >
          <X className="h-5 w-5" />
        </button>
      </SidebarHeader>

      {/* Sequential Nav Items */}
      <SidebarContent className="py-2">
        <SidebarGroup className="py-0">
          <SidebarGroupLabel className="text-[10px] font-black uppercase tracking-wider text-muted-foreground/90 px-3 pb-1">
            Personal Dashboard
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              {serialNavItems.map((item) => {
                const isActive = item.exact
                  ? pathname === item.href
                  : pathname === item.href || pathname.startsWith(item.href + "/")

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      render={<Link href={item.href} onClick={closeMobileSidebar} />}
                      onClick={closeMobileSidebar}
                      isActive={isActive}
                      tooltip={item.title}
                      className="text-xs font-semibold h-8.5 px-3 rounded-lg transition-colors hover:bg-muted/60"
                    >
                      <item.icon className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary" />
                      <span className="truncate">{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Logout */}
      <SidebarFooter className="border-t p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Logout"
              className="text-destructive hover:bg-destructive/10 hover:text-destructive text-xs font-bold h-9 rounded-lg"
              onClick={() => {
                closeMobileSidebar()
                signOut({ callbackUrl: window.location.origin })
              }}
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
