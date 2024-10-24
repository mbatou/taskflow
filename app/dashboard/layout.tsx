import { DashboardHeader } from "@/components/layout/dashboard-header"
import { DashboardNav } from "@/components/layout/dashboard-nav"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen">
      <DashboardHeader />
      <div className="flex">
        <aside className="hidden lg:flex h-[calc(100vh-4rem)] w-64 flex-col border-r px-4 py-6">
          <DashboardNav />
        </aside>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
