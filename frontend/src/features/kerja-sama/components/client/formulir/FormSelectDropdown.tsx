"use client"

import React, { useState, useEffect, useRef } from "react"
import { ChevronDown, Check } from "lucide-react"

export interface FormSelectDropdownProps {
  value: string
  onChange: (val: string) => void
  options: string[]
  placeholder?: string
}

export default function FormSelectDropdown({
  value,
  onChange,
  options,
  placeholder = "Pilih opsi...",
}: FormSelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  const selectedOption = value || options[0] || ""

  return (
    <div ref={dropdownRef} className="relative w-full">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-3 rounded-xl text-sm text-gray-800 bg-white transition-all flex items-center justify-between text-left cursor-pointer border ${
          isOpen
            ? "border-[#561269] ring-2 ring-[#561269]/20 outline-none"
            : "border-gray-300 hover:border-[#561269] focus:outline-none"
        }`}
      >
        <span className={selectedOption ? "text-gray-900 font-medium" : "text-gray-400"}>
          {selectedOption || placeholder}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-gray-500 transition-transform duration-200 shrink-0 ml-2 ${
            isOpen ? "rotate-180 text-[#561269]" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-30 left-0 right-0 mt-1.5 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden py-1 animate-in fade-in zoom-in-95 duration-150">
          <div className="max-h-64 overflow-y-auto">
            {options.map((opt) => {
              const isSelected = selectedOption === opt
              return (
                <div
                  key={opt}
                  onClick={() => {
                    onChange(opt)
                    setIsOpen(false)
                  }}
                  className={`px-4 py-2.5 text-sm flex items-center justify-between cursor-pointer transition-colors ${
                    isSelected
                      ? "bg-purple-50 text-[#561269] font-bold"
                      : "text-gray-800 hover:bg-gray-50"
                  }`}
                >
                  <span>{opt}</span>
                  {isSelected && (
                    <Check className="w-4 h-4 text-[#561269] shrink-0 ml-2" />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
