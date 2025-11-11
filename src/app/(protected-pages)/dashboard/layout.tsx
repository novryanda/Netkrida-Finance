import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex-1 overflow-auto">
        <div className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-14 items-center gap-4 px-4">
            <SidebarTrigger />
            <div className="flex-1" />
            <div className="flex gap-2">
              <button
                type="button"
                className="rounded-xl border bg-white/80 shadow-sm h-11 w-11 flex items-center justify-center text-2xl transition hover:bg-muted"
                aria-label="Notifications"
              >
                <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 16v-5a6 6 0 10-12 0v5a2 2 0 01-2 2h16a2 2 0 01-2-2z"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
              </button>
              <AnimatedThemeToggler className="rounded-xl border bg-white/80 shadow-sm h-11 w-11 flex items-center justify-center text-2xl transition hover:bg-muted" />
            </div>
          </div>
        </div>
        <div className="p-6">{children}</div>
      </main>
    </SidebarProvider>
  )
}
