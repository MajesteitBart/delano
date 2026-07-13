import {
  CheckIcon,
  ChevronsUpDownIcon,
  CircleAlertIcon,
  GitBranchIcon,
  GitCommitHorizontalIcon,
  GitForkIcon,
  InfoIcon,
  LibraryIcon,
} from "lucide-react"
import { useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Spinner } from "@/components/ui/spinner"
import {
  preferredWorktree,
  shortHead,
  sortedRepositories,
  sortedWorktrees,
  worktreeLabel,
  worktreeRole,
  worktreeSelectable,
  worktreeStatusLabel,
  worktreeUnavailableReason,
} from "@/lib/domain/context"
import type {
  ViewerContextInventory,
  ViewerRepository,
  ViewerWorktree,
} from "@/lib/domain/types"
import { cn } from "@/lib/utils"

export function ContextSwitcher({
  error,
  inventory,
  onSwitch,
  switching,
}: {
  error?: string
  inventory: ViewerContextInventory | null
  onSwitch: (repositoryId: string, worktreeId: string) => Promise<void>
  switching: boolean
}) {
  const [repositoryOpen, setRepositoryOpen] = useState(false)
  const [worktreeOpen, setWorktreeOpen] = useState(false)
  const repositories = useMemo(
    () => sortedRepositories(inventory?.repositories ?? []),
    [inventory]
  )
  const activeRepository = repositories.find(
    (item) => item.id === inventory?.active.repository.id
  )
  const worktrees = useMemo(
    () => sortedWorktrees(activeRepository?.worktrees ?? []),
    [activeRepository]
  )
  const activeWorktree =
    worktrees.find((item) => item.id === inventory?.active.worktree.id) ??
    inventory?.active.worktree

  const chooseRepository = async (repository: ViewerRepository) => {
    const worktree = preferredWorktree(repository.worktrees)
    if (!repository.available || !worktree) return
    setRepositoryOpen(false)
    await onSwitch(repository.id, worktree.id)
  }

  const chooseWorktree = async (worktree: ViewerWorktree) => {
    if (!activeRepository || !worktreeSelectable(worktree)) return
    setWorktreeOpen(false)
    await onSwitch(activeRepository.id, worktree.id)
  }

  return (
    <section className="context-switcher" aria-label="Viewer context">
      <div className="flex items-center justify-between gap-2">
        <div className="nav-section-title !mb-0">Repository</div>
        {inventory?.active && <ContextDetails inventory={inventory} />}
      </div>
      <ContextCombobox
        ariaLabel="Selected repository"
        icon={LibraryIcon}
        label={
          activeRepository?.name ??
          inventory?.active.repository.name ??
          "Select repository"
        }
        open={repositoryOpen}
        onOpenChange={setRepositoryOpen}
        switching={switching}
      >
        <CommandInput placeholder="Search repositories…" />
        <CommandList>
          <CommandEmpty>No repositories found.</CommandEmpty>
          <CommandGroup heading="Registered repositories">
            {repositories.map((repository) => {
              const unavailable =
                !repository.available ||
                !repository.worktrees.some(worktreeSelectable)
              return (
                <CommandItem
                  key={repository.id}
                  value={`${repository.name} ${repository.primaryPath}`}
                  disabled={unavailable}
                  onSelect={() => void chooseRepository(repository)}
                >
                  <CheckIcon
                    className={cn(
                      "size-4",
                      repository.id === activeRepository?.id
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate">{repository.name}</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {unavailable
                        ? `${repository.primaryPath} - ${repository.error || "No readable .project worktree"}`
                        : repository.primaryPath}
                    </span>
                  </span>
                </CommandItem>
              )
            })}
          </CommandGroup>
        </CommandList>
      </ContextCombobox>

      <div className="nav-section-title mt-2 !mb-0">Worktree</div>
      <ContextCombobox
        ariaLabel="Selected worktree"
        icon={GitForkIcon}
        label={
          activeWorktree ? worktreeLabel(activeWorktree) : "Select worktree"
        }
        meta={
          activeWorktree
            ? `${worktreeRole(activeWorktree)} · ${worktreeStatusLabel(activeWorktree)}`
            : undefined
        }
        open={worktreeOpen}
        onOpenChange={setWorktreeOpen}
        switching={switching}
      >
        <CommandInput placeholder="Search branches and paths…" />
        <CommandList>
          <CommandEmpty>No worktrees found.</CommandEmpty>
          <CommandGroup heading="Git worktrees">
            {worktrees.map((worktree) => {
              const selectable = worktreeSelectable(worktree)
              return (
                <CommandItem
                  key={worktree.id}
                  value={`${worktreeLabel(worktree)} ${worktree.path} ${worktreeRole(worktree)}`}
                  disabled={!selectable}
                  onSelect={() => void chooseWorktree(worktree)}
                >
                  <CheckIcon
                    className={cn(
                      "size-4",
                      worktree.id === activeWorktree?.id
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5">
                      <span className="truncate">
                        {worktreeLabel(worktree)}
                      </span>
                      <span className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                        {worktreeRole(worktree)}
                      </span>
                    </span>
                    <span
                      className={cn(
                        "block truncate text-xs",
                        selectable
                          ? "text-muted-foreground"
                          : "text-destructive"
                      )}
                    >
                      {selectable
                        ? `${worktreeStatusLabel(worktree)} · ${worktree.path}`
                        : worktreeUnavailableReason(worktree)}
                    </span>
                  </span>
                </CommandItem>
              )
            })}
          </CommandGroup>
        </CommandList>
      </ContextCombobox>
      {error && (
        <p className="mt-2 flex gap-1.5 text-xs text-destructive" role="alert">
          <CircleAlertIcon className="mt-0.5 size-3.5 shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </section>
  )
}

function ContextCombobox({
  ariaLabel,
  children,
  icon: Icon,
  label,
  meta,
  onOpenChange,
  open,
  switching,
}: {
  ariaLabel: string
  children: React.ReactNode
  icon: typeof LibraryIcon
  label: string
  meta?: string
  onOpenChange: (open: boolean) => void
  open: boolean
  switching: boolean
}) {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          aria-expanded={open}
          aria-label={ariaLabel}
          className="selected-project !h-auto min-h-9 w-full justify-start px-2 py-1.5"
          disabled={switching}
          role="combobox"
          variant="outline"
        >
          {switching ? (
            <Spinner data-icon="inline-start" />
          ) : (
            <Icon data-icon="inline-start" />
          )}
          <span className="min-w-0 flex-1 text-left">
            <span className="block truncate">{label}</span>
            {meta && (
              <span className="block truncate text-[10px] font-normal text-muted-foreground">
                {meta}
              </span>
            )}
          </span>
          <ChevronsUpDownIcon className="ml-auto opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-[min(340px,calc(100vw-2rem))] p-0"
      >
        <Command>{children}</Command>
      </PopoverContent>
    </Popover>
  )
}

function ContextDetails({ inventory }: { inventory: ViewerContextInventory }) {
  const { active } = inventory
  const worktree = active.worktree
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon-xs"
          aria-label="View repository and worktree details"
        >
          <InfoIcon />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-[min(420px,calc(100vw-2rem))] gap-3 p-3"
      >
        <div>
          <div className="font-medium">{active.repository.name}</div>
          <div className="text-xs text-muted-foreground">
            {worktreeRole(worktree)} worktree · {worktreeStatusLabel(worktree)}
          </div>
        </div>
        <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-2 text-xs">
          <dt className="text-muted-foreground">Repository</dt>
          <dd className="font-mono break-all">
            {active.repository.primaryPath}
          </dd>
          <dt className="text-muted-foreground">Worktree</dt>
          <dd className="font-mono break-all">{worktree.path}</dd>
          <dt className="flex items-center gap-1 text-muted-foreground">
            <GitBranchIcon className="size-3" />
            Branch
          </dt>
          <dd>
            {worktree.detached ? "Detached HEAD" : worktree.branch || "Unknown"}
          </dd>
          <dt className="flex items-center gap-1 text-muted-foreground">
            <GitCommitHorizontalIcon className="size-3" />
            HEAD
          </dt>
          <dd className="font-mono" title={worktree.head ?? undefined}>
            {shortHead(worktree.head)}
          </dd>
          <dt className="text-muted-foreground">Project</dt>
          <dd className="font-mono break-all">{active.projectRoot}</dd>
          <dt className="text-muted-foreground">Availability</dt>
          <dd>
            {worktreeSelectable(worktree)
              ? "Available"
              : worktreeUnavailableReason(worktree)}
          </dd>
          <dt className="text-muted-foreground">Divergence</dt>
          <dd>
            {worktree.projectState.diverged
              ? "Committed .project differs from primary"
              : "No committed divergence"}
          </dd>
          <dt className="text-muted-foreground">Changes</dt>
          <dd>
            {worktree.projectState.dirtyFiles?.length
              ? worktree.projectState.dirtyFiles.join(", ")
              : "No uncommitted .project changes"}
          </dd>
        </dl>
        {!active.writable && (
          <p className="border-t pt-2 text-xs text-muted-foreground">
            {active.writeDisabledReason}
          </p>
        )}
      </PopoverContent>
    </Popover>
  )
}
