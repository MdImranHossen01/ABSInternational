"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
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
  LogOut,
} from "lucide-react"
import { Logo } from "@/components/ui/logo"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
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
        {
          title: "Notifications",
          url: "/admin/notifications",
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
    <SidebarGroup className="py-2">
      <SidebarGroupLabel className="text-[10px] font-black uppercase tracking-wider text-slate-400/90 px-3 py-1">
        Menu
      </SidebarGroupLabel>
      <SidebarMenu className="gap-1 px-1">
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
                <CollapsibleTrigger
                  render={
                    <SidebarMenuButton
                      tooltip={item.title}
                      isActive={isParentActive}
                      className={`h-10 rounded-xl px-3 transition-all duration-200 cursor-pointer ${
                        isParentActive
                          ? "!bg-primary !text-white font-bold shadow-md shadow-primary/30 data-active:!bg-primary data-active:!text-white data-[active=true]:!bg-primary data-[active=true]:!text-white"
                          : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                      }`}
                    />
                  }
                >
                  {item.icon && (
                    <item.icon
                      className={`h-4.5 w-4.5 shrink-0 ${
                        isParentActive ? "!text-white" : "text-slate-400 group-hover:text-white"
                      }`}
                    />
                  )}
                  <span
                    className={`text-xs md:text-sm font-medium tracking-tight ml-1.5 ${
                      isParentActive ? "!text-white font-bold" : "text-slate-200"
                    }`}
                  >
                    {item.title}
                  </span>
                  <ChevronRight
                    className={`ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 group-data-open/collapsible:rotate-90 group-[[data-state=open]]/collapsible:rotate-90 ${
                      isParentActive ? "!text-white opacity-90" : "text-slate-400 opacity-70"
                    }`}
                  />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub className="ml-4 pl-2 border-l border-slate-800/80 my-1 space-y-1">
                    {item.items.map((subItem) => {
                      const isSubActive =
                        pathname === subItem.url ||
                        (subItem.url !== "#" &&
                          subItem.url !== "/admin" &&
                          pathname.startsWith(subItem.url + "/") &&
                          !item.items.some(
                            (otherItem) =>
                              otherItem !== subItem &&
                              otherItem.url.length > subItem.url.length &&
                              (pathname === otherItem.url || pathname.startsWith(otherItem.url + "/"))
                          ));

                      return (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton
                            render={<Link href={subItem.url} onClick={handleLinkClick} />}
                            isActive={isSubActive}
                            className={`h-8 rounded-lg px-3 text-xs transition-all duration-150 cursor-pointer ${
                              isSubActive
                                ? "!bg-primary !text-white font-bold shadow-xs data-active:!bg-primary data-active:!text-white"
                                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                            }`}
                          >
                            <span className={isSubActive ? "!text-white font-bold" : ""}>
                              {subItem.title}
                            </span>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      );
                    })}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = (session?.user as any)?.role;
  const user = session?.user;
  const displayRole = role === 'super_admin' ? 'Super Admin' : role === 'admin' ? 'Admin' : role === 'manager' ? 'Manager' : role ? String(role).replace('_', ' ') : 'Admin';
  const { setOpenMobile, isMobile } = useSidebar();

  const closeMobileSidebar = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <Sidebar collapsible="icon" {...props} className="border-r border-slate-800/80 bg-[#0a152e] text-slate-100">
      <SidebarHeader className="border-b border-slate-800/80 h-14 lg:h-[60px] px-3.5 flex flex-row items-center justify-between overflow-hidden bg-[#0a152e]">
        <Link href="/" onClick={closeMobileSidebar} className="flex items-center">
          <Logo
            imageClassName="size-7 shrink-0 rounded-md"
            textClassName="!text-white font-black text-sm tracking-tight whitespace-nowrap leading-none"
          />
        </Link>
        <button
          type="button"
          onClick={closeMobileSidebar}
          className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors cursor-pointer"
          aria-label="Close sidebar"
        >
          <X className="h-5 w-5" />
        </button>
      </SidebarHeader>

      <SidebarContent className="gap-0 bg-[#0a152e] scrollbar-thin scrollbar-thumb-slate-800">
        <NavMain items={data.navMain} pathname={pathname} role={role} />
      </SidebarContent>

      <SidebarFooter className="border-t border-slate-800/80 p-3 bg-[#081024]">
        {/* User Profile Mini Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <Avatar className="h-8 w-8 border border-slate-700 bg-primary/20 text-white shrink-0">
              <AvatarImage src={user?.image || ""} alt={user?.name || "Admin"} />
              <AvatarFallback className="bg-primary text-white font-bold text-xs">
                {user?.name ? user.name.slice(0, 2).toUpperCase() : "AD"}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-100 truncate">{user?.name || "Administrator"}</p>
              <p className="text-[10px] text-slate-400 capitalize truncate">{displayRole}</p>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800/60 rounded-lg transition-colors cursor-pointer"
            title="Log Out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}

