"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  BarChart3,
  ClipboardList,
  LogOut,
  Settings,
  Users,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: BarChart3,
  },
  {
    name: "Tasks",
    href: "/dashboard/tasks",
    icon: ClipboardList,
  },
  {
    name: "Team",
    href: "/dashboard/team",
    icon: Users,
  },
  {
    name: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
]

export function DashboardNav() {
  const pathname = usePathname()

  return (
    <nav className="flex flex-col gap-2">
      {navigation.map((item) => {
        const Icon = item.icon
        return (
          <Button
            key={item.name}
            variant={pathname === item.href ? "secondary" : "ghost"}
            className={cn(
              "w-full justify-start gap-2",
              pathname === item.href && "bg-muted"
            )}
            asChild
          >
            <Link href={item.href}>
              <Icon className="h-4 w-4" />
              {item.name}
            </Link>
          </Button>
        )
      })}
      <Button variant="ghost" className="w-full justify-start gap-2 mt-auto">
        <LogOut className="h-4 w-4" />
        Logout
      </Button>
    </nav>
  )
}