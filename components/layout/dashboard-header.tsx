import { ModeToggle } from "@/components/mode-toggle"
import { Button } from "@/components/ui/button"
import { UserNav } from "@/components/user-nav"
import { Bell } from "lucide-react"

export function DashboardHeader() {
  return (
    <header className="border-b">
      <div className="flex h-16 items-center px-4 gap-4">
        <div className="ml-auto flex items-center gap-4">
          <Button variant="ghost" size="icon">
            <Bell className="h-4 w-4" />
          </Button>
          <ModeToggle />
          <UserNav />
        </div>
      </div>
    </header>
  )
}