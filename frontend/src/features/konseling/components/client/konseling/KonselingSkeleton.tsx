"use client"

import React from "react"

export function KonselingSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
      {[1, 2, 3].map((n) => (
        <div
          key={n}
          className="rounded-3xl border border-gray-100 bg-white overflow-hidden shadow-sm animate-pulse flex flex-col h-[380px]"
        >
          <div className="h-44 bg-gray-200 w-full" />
          <div className="p-6 flex flex-col flex-1 gap-3">
            <div className="h-5 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-100 rounded w-full" />
            <div className="h-4 bg-gray-100 rounded w-2/3" />
            <div className="mt-auto h-10 bg-gray-200 rounded-full w-full" />
          </div>
        </div>
      ))}
    </div>
  )
}
