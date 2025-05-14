import { Label } from "@/components/ui/label"
import { SidebarInput } from "@/components/ui/sidebar"
import { Search } from "lucide-react"

interface SearchInputProps {
  searchQuery: string
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export function SearchInput({ searchQuery, onSearchChange }: SearchInputProps) {
  return (
    <div className="relative">
      <Label htmlFor="search" className="sr-only">
        Search chats
      </Label>
      <SidebarInput
        id="search"
        placeholder="Search chats..."
        className="pl-9 py-2 bg-sidebar-primary/5 text-sidebar-foreground border border-sidebar-border/40 focus-visible:ring-1 focus-visible:ring-sidebar-primary/50 focus-visible:border-sidebar-primary/50 rounded-lg transition-all duration-200 placeholder:text-muted-foreground/60"
        value={searchQuery}
        onChange={onSearchChange}
      />
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 select-none text-muted-foreground/60" />
    </div>
  )
} 