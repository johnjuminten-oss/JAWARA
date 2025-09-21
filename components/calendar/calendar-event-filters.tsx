"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { EventType, EventTypeGroups } from "@/types/event-types"
import { Check } from "lucide-react"

interface CalendarEventFiltersProps {
  selectedTypes: EventType[]
  onFilterChange: (types: EventType[]) => void
}

export function CalendarEventFilters({
  selectedTypes,
  onFilterChange,
}: CalendarEventFiltersProps) {
  const handleGroupToggle = (types: EventType[]) => {
    // If all types in the group are selected, unselect them
    // Otherwise, select any that aren't already selected
    const allSelected = types.every((type) => selectedTypes.includes(type))
    
    if (allSelected) {
      onFilterChange(selectedTypes.filter((type) => !types.includes(type)))
    } else {
      const newTypes = [...new Set([...selectedTypes, ...types])] as EventType[]
      onFilterChange(newTypes)
    }
  }

  const handleTypeToggle = (type: EventType) => {
    if (selectedTypes.includes(type)) {
      onFilterChange(selectedTypes.filter((t) => t !== type))
    } else {
      onFilterChange([...selectedTypes, type])
    }
  }

  return (
    <ScrollArea className="w-full">
      <div className="flex flex-wrap gap-2 p-2">
        {/* Group filters */}
        <div className="flex flex-wrap gap-1.5 border-b pb-2 w-full">
          {Object.entries(EventTypeGroups).map(([group, types]) => {
            const allSelected = types.every((type) => selectedTypes.includes(type))
            const typesArray = Array.from(types) as EventType[] // Convert readonly array to mutable
            return (
              <Button
                key={group}
                variant={allSelected ? "default" : "outline"}
                size="sm"
                onClick={() => handleGroupToggle(typesArray)}
                className="capitalize"
              >
                {allSelected && <Check className="w-3 h-3 mr-1" />}
                {group}
              </Button>
            )
          })}
        </div>

        {/* Individual type filters */}
        <div className="flex flex-wrap gap-1.5">
          {Object.entries(EventTypeGroups).flatMap(([_, types]) =>
            types.map((type) => (
              <Button
                key={type}
                variant={selectedTypes.includes(type) ? "default" : "outline"}
                size="sm"
                onClick={() => handleTypeToggle(type)}
                className="capitalize text-xs"
              >
                {selectedTypes.includes(type) && <Check className="w-3 h-3 mr-1" />}
                {type.replace(/_/g, " ")}
              </Button>
            ))
          )}
        </div>
      </div>
    </ScrollArea>
  )
}