"use client"

import * as React from "react"
import {
  Building2,
  Wallet,
  LayoutDashboard,
  FolderKanban,
  Receipt,
  FileText,
  Users,
  Settings,
  LogOut,
  ChevronUp,
  User2,
  ShoppingCart,
} from "lucide-react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { signOut, useSession } from "next-auth/react"

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
  useSidebar,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Menu items per role
const menuByRole = {
  ADMIN: [
    {
      title: "Dashboard",
      url: "/dashboard/admin",
      icon: LayoutDashboard,
    },
    {
      title: "Projects",
      url: "/dashboard/admin/projects",
      icon: FolderKanban,
    },
    {
      title: "Category",
      url: "/dashboard/admin/categories",
      icon: ShoppingCart,
    },
    {
      title: "Expenses",
      url: "/dashboard/admin/direct-expenses",
      icon: Receipt,
    },
    {
      title: "Reimbursements",
      url: "/dashboard/admin/reimbursements",
      icon: FileText,
    },
    {
      title: "Users",
      url: "/dashboard/admin/users",
      icon: Users,
    },
    {
      title: "Reports",
      url: "/dashboard/admin/reports",
      icon: FileText,
    },
  ],
  FINANCE: [
    {
      title: "Dashboard",
      url: "/dashboard/finance",
      icon: LayoutDashboard,
    },
    {
      title: "Payments",
      url: "/dashboard/finance/direct-expenses",
      icon: Wallet,
    },
    {
      title: "Reimbursements",
      url: "/dashboard/finance/reimbursements",
      icon: FileText,
    },
    {
      title: "Reports",
      url: "/dashboard/finance/reports",
      icon: FileText,
    },
  ],
  STAFF: [
    {
      title: "Dashboard",
      url: "/dashboard/staff",
      icon: LayoutDashboard,
    },
    {
      title: "Reimbursements",
      url: "/dashboard/staff/reimbursements",
      icon: FileText,
    },
  ],
}

export function AppSidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const { open } = useSidebar()

  // Get menu items based on user role
  const userRole = (session?.user as any)?.role || "STAFF"
  const menuItems = menuByRole[userRole as keyof typeof menuByRole] || menuByRole.STAFF

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" })
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-[hsl(280,100%,70%)] text-white">
                  <Building2 className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">NETKRIDA</span>
                  <span className="text-xs text-muted-foreground">Finance System</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const isActive = pathname === item.url || pathname.startsWith(item.url + "/")
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-muted overflow-hidden">
                    {session?.user?.image ? (
                      <img
                        src={session.user.image}
                        alt={session.user.name || "User"}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <User2 className="size-4" />
                    )}
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{session?.user?.name || "User"}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {userRole}
                    </span>
                  </div>
                  <ChevronUp className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
