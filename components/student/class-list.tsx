"use client"

import React from "react"

interface ClassListProps {
  classes: {
    id: string
    name: string
  }[]
}

export function ClassList({ classes }: ClassListProps) {
  return (
    <div
      className="max-h-48 sm:max-h-64 overflow-y-auto rounded-lg shadow-md"
      style={{
        scrollBehavior: "smooth",
        scrollbarWidth: "thin",
        scrollbarColor: "rgba(107, 114, 128, 0.8) rgba(229, 231, 235, 0.5)",
      }}
    >
      <style jsx>{`
        div::-webkit-scrollbar {
          width: 8px;
        }
        div::-webkit-scrollbar-thumb {
          background-color: rgba(107, 114, 128, 0.8);
          border-radius: 8px;
          box-shadow: 0 0 2px rgba(0, 0, 0, 0.2);
        }
        div::-webkit-scrollbar-track {
          background-color: rgba(229, 231, 235, 0.5);
          border-radius: 8px;
        }
      `}</style>
      <ul className="divide-y divide-gray-200">
        {classes.map((cls) => (
          <li key={cls.id} className="p-2 sm:p-3 text-sm sm:text-base hover:bg-gray-100 cursor-pointer">
            {cls.name}
          </li>
        ))}
      </ul>
    </div>
  )
}
