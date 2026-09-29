"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  ChevronRight,
  LayoutDashboard,
  ShoppingBag,
  FileText,
  Users,
  Image as ImageIcon,
  Settings,

  Mail,

  X,
} from "lucide-react"
import { Logo } from "@/components/ui/logo"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"

const data = {
  navMain: [
    {
      title: "Overview",
      url: "/admin/dashboard",
      icon: LayoutDashboard,
      isActive: true,
      items: [
        {
          title: "Dashboard",
          url: "/admin/dashboard",
        },
        {
          title: "KYC Queue",
          url: "/admin/kyc",
        },
        {
          title: "Withdrawals Queue",
          url: "/admin/withdrawals",
        },
        {
          title: "Deposits Queue",
          url: "/admin/deposits",
        },
        {
          title: "Support Tickets",
          url: "/admin/support",
        },
      ],
    },
    {
      title: "Product Management",
      url: "#",
      icon: ShoppingBag,
      items: [
        {
          title: "All Products",
          url: "/admin/products",
        },
        {
          title: "Add Product",
          url: "/admin/products/new",
        },
        {
          title: "Brands",
          url: "/admin/brands",
        },
        {
          title: "Categories",
          url: "/admin/categories",
        },
        {
          title: "Upcoming Expiry",
          url: "/admin/upcoming-expiry",
        },
        {
          title: "Low Stock Alerts",
          url: "/admin/low-stock",
        },
      ],
    },
    {
      title: "Sales & Orders",
      url: "#",
      icon: FileText,
      items: [
        {
          title: "All Orders",
          url: "/admin/orders",
        },
        {
          title: "Abandoned Carts",
          url: "/admin/abandoned-carts",
        },
        {
          title: "Offers / Quotations",
          url: "/admin/offers",
        },
        {
          title: "Delivery Challans",
          url: "/admin/chalans",
        },
        {
          title: "Client Bills",
          url: "/admin/bills",
        },
        {
          title: "Suppliers / Vendors",
          url: "/admin/suppliers",
        },
        {
          title: "Supplier Bills",
          url: "/admin/supplier-bills",
        },
        {
          title: "Expenses & Incomes",
          url: "/admin/expenses-incomes",
        },
        {
          title: "Accounts Ledger",
          url: "/admin/ledger",
        },
      ],
    },
    {
      title: "User Management",
      url: "#",
      icon: Users,
      items: [
        {
          title: "All Users",
          url: "/admin/users",
        },
        {
          title: "Founding Leaders",
          url: "/admin/users/leaders",
        },
        {
          title: "Active Members",
          url: "/admin/users/active",
        },
        {
          title: "Free Members",
          url: "/admin/users/free",
        },
        {
          title: "Rank Leaders",
          url: "/admin/users/ranks",
        },
        {
          title: "Admins & Staff",
          url: "/admin/users/admins",
        },
      ],
    },
    {
      title: "Blogs",
      url: "#",
      icon: FileText,
      items: [
        {
          title: "Manage Blog",
          url: "/admin/blogs",
        },
        {
          title: "Add New Blog",
          url: "/admin/blogs/new",
        },
      ],
    },
    {
      title: "System Settings",
      url: "#",
      icon: Settings,
      items: [
        {
          title: "Profile",
          url: "/admin/settings/profile",
        },
        {
          title: "General Settings",
          url: "/admin/settings",
        },
        {
          title: "Marketing Settings",
          url: "/admin/marketing",
        },
        {
          title: "Subscribers",
          url: "/admin/subscribers",
          icon: Mail,
        },
        {
          title: "Infrastructure & Marketing",
          url: "/admin/system-design",
          superOnly: true
        },
      ],
    },
  ],
}


import { useSession } from "next-auth/react"

function NavMain({ items, pathname, role }: { items: typeof data.navMain; pathname: string; role?: string }) {
  const { setOpenMobile, isMobile } = useSidebar()

  // Filter items based on role
  const filteredItems = items.map(item => ({
    ...item,
    items: item.items.filter((subItem: any) => !subItem.superOnly || role === 'super_admin')
  })).filter(item => item.items.length > 0);

  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false)
    }
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Menu</SidebarGroupLabel>
      <SidebarMenu>
        {filteredItems.map((item) => {
          const isParentActive =
            item.items.some(
              (subItem) =>
                pathname === subItem.url ||
                (subItem.url !== "#" &&
                  subItem.url !== "/admin" &&
                  pathname.startsWith(subItem.url + "/"))
            ) || pathname === item.url

          return (
            <Collapsible
              key={item.title}
              defaultOpen={isParentActive}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger render={<SidebarMenuButton tooltip={item.title} isActive={isParentActive} />}>
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                  <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 group-data-open/collapsible:rotate-90 group-[[data-state=open]]/collapsible:rotate-90" />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton
                          render={<Link href={subItem.url} onClick={handleLinkClick} />}
                          isActive={
                            pathname === subItem.url ||
                            (subItem.url !== "#" &&
                              subItem.url !== "/admin" &&
                              pathname.startsWith(subItem.url + "/") &&
                              !item.items.some(
                                (otherItem) =>
                                  otherItem !== subItem &&
                                  otherItem.url.length > subItem.url.length &&
                                  (pathname === otherItem.url || pathname.startsWith(otherItem.url + "/"))
                              ))
                          }
                        >
                          <span>{subItem.title}</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const role = (session?.user as any)?.role
  const { setOpenMobile, isMobile } = useSidebar()

  const closeMobileSidebar = () => {
    if (isMobile) {
      setOpenMobile(false)
    }
  }

  return (
    <Sidebar collapsible="icon" {...props}>
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
      <SidebarContent className="gap-0">
        <NavMain items={data.navMain} pathname={pathname} role={role} />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}

