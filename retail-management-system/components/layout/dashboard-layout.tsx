"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { BarChart3, Box, ClipboardList, LogOut, Menu, Package, ShoppingCart, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"

interface NavItem {
  title: string
  href: string
  icon: React.ReactNode
  adminOnly?: boolean
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: <BarChart3 className="h-5 w-5" />,
  },
  {
    title: "Products",
    href: "/dashboard/products",
    icon: <Package className="h-5 w-5" />,
  },
  {
    title: "Orders",
    href: "/dashboard/orders",
    icon: <ClipboardList className="h-5 w-5" />,
  },
  {
    title: "Point of Sale",
    href: "/dashboard/pos",
    icon: <ShoppingCart className="h-5 w-5" />,
  },
  {
    title: "Categories",
    href: "/dashboard/categories",
    icon: <Box className="h-5 w-5" />,
    adminOnly: true,
  },
  {
    title: "Employees",
    href: "/dashboard/employees",
    icon: <Users className="h-5 w-5" />,
    adminOnly: true,
  },
]

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [user, setUser] = useState<{ role: string; name: string } | null>(null)
  const [isMounted, setIsMounted] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()

  useEffect(() => {
    setIsMounted(true)
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    } else {
      router.push("/login")
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("user")
    toast({
      title: "Logged out successfully",
    })
    router.push("/login")
  }

  if (!isMounted || !user) {
    return null
  }

  const filteredNavItems = navItems.filter((item) => !item.adminOnly || user.role === "admin")

  return (
    <div className="flex min-h-screen flex-col">
      {/* Mobile Navigation */}
      <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="shrink-0 md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-60 sm:w-80">
            <div className="grid gap-6 py-6">
              <div className="flex items-center gap-2 px-2">
                <ShoppingCart className="h-6 w-6" />
                <span className="text-lg font-semibold">Retail System</span>
                <Button variant="ghost" size="icon" className="ml-auto" onClick={handleLogout}>
                  <LogOut className="h-5 w-5" />
                  <span className="sr-only">Logout</span>
                </Button>
              </div>
              <nav className="grid gap-1 px-2">
                {filteredNavItems.map((item, index) => (
                  <Link
                    key={index}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-muted",
                      pathname === item.href ? "bg-muted" : "transparent",
                    )}
                  >
                    {item.icon}
                    {item.title}
                  </Link>
                ))}
              </nav>
            </div>
          </SheetContent>
        </Sheet>
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-6 w-6" />
          <span className="text-lg font-semibold">Retail System</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-sm font-medium">{user.name}</span>
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="h-5 w-5" />
            <span className="sr-only">Logout</span>
          </Button>
        </div>
      </header>

      <div className="grid flex-1 lg:grid-cols-[240px_1fr]">
        {/* Desktop Navigation */}
        <div className="hidden border-r bg-muted/40 lg:block">
          <div className="flex h-full max-h-screen flex-col gap-2">
            <div className="flex h-14 items-center border-b px-4">
              <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
                <ShoppingCart className="h-6 w-6" />
                <span>Retail System</span>
              </Link>
            </div>
            <div className="flex-1 overflow-auto py-2">
              <nav className="grid gap-1 px-2">
                {filteredNavItems.map((item, index) => (
                  <Link
                    key={index}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-muted",
                      pathname === item.href ? "bg-muted" : "transparent",
                    )}
                  >
                    {item.icon}
                    {item.title}
                  </Link>
                ))}
              </nav>
            </div>
            <div className="mt-auto p-4">
              <div className="flex items-center gap-2 rounded-md border p-2">
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{user.name}</span>
                  <span className="text-xs text-muted-foreground capitalize">{user.role}</span>
                </div>
                <Button variant="ghost" size="icon" className="ml-auto" onClick={handleLogout}>
                  <LogOut className="h-5 w-5" />
                  <span className="sr-only">Logout</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col">
          <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
        </div>
      </div>
    </div>
  )
}
