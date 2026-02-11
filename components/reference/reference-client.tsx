"use client"

import { useState, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search } from "lucide-react"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { FlagGrid } from "./flag-grid"
import { ReferenceStats } from "./reference-stats"
import { Doc } from "@/convex/_generated/dataModel"

export function ReferenceClient() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  
  const flags = useQuery(api.flags.getAllFlags)
  const isLoading = flags === undefined

  const filteredFlags = useMemo(() => {
    if (!flags) return []

    return flags.filter((flag: Doc<"flags">) => {
      const query = searchQuery.toLowerCase()
      const matchesSearch = 
        flag.name.toLowerCase().includes(query) ||
        flag.meaning.toLowerCase().includes(query) ||
        (flag.phonetic && flag.phonetic.toLowerCase().includes(query))

      const matchesCategory = 
        selectedCategory === "all" || 
        (selectedCategory === "letters" ? flag.type === "flag-letter" :
         selectedCategory === "numbers" ? flag.type === "flag-number" :
         selectedCategory === "pennants" ? flag.type === "pennant-number" :
         selectedCategory === "special" ? (flag.type === "special-pennant" || flag.type === "substitute") :
         flag.category === selectedCategory)

      return matchesSearch && matchesCategory
    })
  }, [flags, searchQuery, selectedCategory])

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <Tabs 
          defaultValue="all" 
          value={selectedCategory} 
          onValueChange={setSelectedCategory} 
          className="w-full md:w-auto overflow-x-auto pb-1 md:pb-0"
        >
          <TabsList className="w-full md:w-auto">
            <TabsTrigger value="all" className="flex-1 md:flex-none">All</TabsTrigger>
            <TabsTrigger value="letters" className="flex-1 md:flex-none">Letters</TabsTrigger>
            <TabsTrigger value="numbers" className="flex-1 md:flex-none">Numbers</TabsTrigger>
            <TabsTrigger value="pennants" className="flex-1 md:flex-none">Pennants</TabsTrigger>
            <TabsTrigger value="special" className="flex-1 md:flex-none">Special</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="relative w-full md:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by name, meaning..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="min-h-96">
        {!isLoading && (
            <ReferenceStats flags={filteredFlags} category={selectedCategory} />
        )}
        <FlagGrid flags={filteredFlags} isLoading={isLoading} />
      </div>
    </div>
  )
}
