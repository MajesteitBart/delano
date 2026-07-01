import { type ReactNode, useState } from "react"

import { Sidebar } from "@/components/organisms/Sidebar"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import type { ViewerRoute, WorkspaceView } from "@/lib/domain/navigation"
import type { ProjectIndex, ViewerIndex } from "@/lib/domain/types"

export function AppShell({
  activePath,
  activeProject,
  children,
  index,
  isCompact,
  onOpenDoc,
  onOpenProjectOverview,
  onOpenProjectTasks,
  onOpenProjectWorkstreams,
  onOpenWorkspace,
  onSelectProject,
  renderTopbar,
  route,
}: {
  activePath: string | null
  activeProject: ProjectIndex | null
  children: ReactNode
  index: ViewerIndex | null
  isCompact: boolean
  onOpenDoc: (path: string) => void
  onOpenProjectOverview: () => void
  onOpenProjectTasks: () => void
  onOpenProjectWorkstreams: () => void
  onOpenWorkspace: (view: WorkspaceView) => void
  onSelectProject: (slug: string) => void
  renderTopbar: (controls: { isCompact: boolean; openSidebar: () => void }) => ReactNode
  route: ViewerRoute
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const closeAfter = <Args extends unknown[]>(callback: (...args: Args) => void) =>
    (...args: Args) => {
      callback(...args)
      setSidebarOpen(false)
    }
  const sidebar = (
    <Sidebar
      index={index}
      activeProject={activeProject}
      activePath={activePath}
      route={route}
      onOpenDoc={closeAfter(onOpenDoc)}
      onOpenProjectOverview={closeAfter(onOpenProjectOverview)}
      onOpenProjectTasks={closeAfter(onOpenProjectTasks)}
      onOpenProjectWorkstreams={closeAfter(onOpenProjectWorkstreams)}
      onOpenWorkspace={closeAfter(onOpenWorkspace)}
      onSelectProject={closeAfter(onSelectProject)}
    />
  )

  return (
    <div className="app-shell" data-compact={isCompact}>
      {!isCompact && sidebar}
      {isCompact && (
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="sheet-sidebar w-[min(88vw,340px)] gap-0 p-0" showCloseButton>
            <SheetHeader className="sr-only">
              <SheetTitle>Workspace navigation</SheetTitle>
            </SheetHeader>
            {sidebar}
          </SheetContent>
        </Sheet>
      )}
      <main className="min-w-0 flex-1">
        {renderTopbar({ isCompact, openSidebar: () => setSidebarOpen(true) })}
        {children}
      </main>
    </div>
  )
}
