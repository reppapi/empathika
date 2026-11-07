"use client"

import * as React from "react"
import { Calendar } from "@/components/ui/calendar"

export interface PilihTanggalBoxProps {
  date: Date | undefined
  setDate: (date: Date) => void
  stepNumber?: number | string
  title?: string
  subtitle?: string
  minDate?: Date
  datesWithSlots?: Date[]
  earliestAvailableDate?: Date | null
  months?: string[]
  formatDateToKey?: (d: Date) => string
  legendLabel?: string
  showLegend?: boolean
  className?: string
  footerContent?: React.ReactNode
}

export function PilihTanggalBox({
  date,
  setDate,
  stepNumber = 2,
  title = "Pilih Tanggal",
  subtitle,
  minDate,
  datesWithSlots,
  earliestAvailableDate,
  months,
  formatDateToKey,
  legendLabel,
  showLegend = true,
  className = "",
  footerContent,
}: PilihTanggalBoxProps) {
  const today = React.useMemo(() => {
    const d = minDate ? new Date(minDate) : new Date()
    d.setHours(0, 0, 0, 0)
    return d
  }, [minDate])

  const hasSlotModifiers = datesWithSlots && datesWithSlots.length > 0

  return (
    <div
      className={`bg-white rounded-2xl border border-[#DCD0E1] p-4 sm:p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col justify-between ${className}`}
    >
      <div>
        {/* Header Box */}
        <div className="flex items-center gap-2.5 mb-3">
          {stepNumber !== undefined && (
            <div className="w-5 h-5 rounded-full bg-[#EAB308] text-black text-xs font-bold flex items-center justify-center shrink-0">
              {stepNumber}
            </div>
          )}
          <div>
            <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
            {subtitle && <p className="text-[10px] text-gray-500 mt-0.5">{subtitle}</p>}
          </div>
        </div>

        {/* Calendar Area */}
        <div className="w-full flex justify-center">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(newDate) => {
              if (newDate) {
                const check = new Date(newDate)
                check.setHours(0, 0, 0, 0)
                if (check >= today) {
                  setDate(newDate)
                }
              }
            }}
            fromDate={today}
            disabled={{ before: today }}
            modifiers={hasSlotModifiers ? { hasSlots: datesWithSlots } : undefined}
            modifiersClassNames={
              hasSlotModifiers
                ? {
                    hasSlots:
                      "font-bold text-[#561269] relative after:content-[''] after:absolute after:bottom-0.5 after:w-1.5 after:h-1.5 after:bg-[#EAB308] after:rounded-full after:left-1/2 after:-translate-x-1/2",
                  }
                : undefined
            }
            className="w-full p-0"
            classNames={{
              months: "w-full",
              month: "w-full space-y-2",
              caption: "flex justify-center pt-0 relative items-center mb-1",
              caption_label: "text-sm font-semibold text-[#561269]",
              table: "w-full border-collapse",
              head_row: "flex w-full justify-between items-center mb-1",
              head_cell:
                "text-slate-500 font-semibold text-[11px] sm:text-xs flex-1 text-center h-7 flex items-center justify-center",
              row: "flex w-full mt-1 justify-between items-center",
              cell: "flex-1 flex items-center justify-center p-0 relative h-8 sm:h-9",
              day: "h-8 w-8 sm:h-9 sm:w-9 p-0 font-medium text-xs sm:text-sm rounded-lg flex items-center justify-center hover:bg-purple-50 transition-colors",
            }}
          />
        </div>
      </div>

      {/* Legend & Quick Switch Helper */}
      {((showLegend && legendLabel) || earliestAvailableDate || footerContent) && (
        <div className="mt-2.5 pt-2.5 border-t border-gray-100">
          <div className="flex flex-col sm:flex-row items-center justify-between text-[11px] text-gray-500 gap-1.5">
            {showLegend && legendLabel && (
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#EAB308] inline-block shadow-xs shrink-0"></span>
                <span className="text-gray-600 font-medium text-[10px] sm:text-[11px]">{legendLabel}</span>
              </div>
            )}
            {earliestAvailableDate &&
              date &&
              months &&
              formatDateToKey &&
              formatDateToKey(date) !== formatDateToKey(earliestAvailableDate) && (
                <button
                  type="button"
                  onClick={() => setDate(earliestAvailableDate)}
                  className="text-[#561269] font-semibold hover:underline flex items-center gap-1 cursor-pointer text-[10px] sm:text-[11px]"
                >
                  <span>
                    Lompat ke {earliestAvailableDate.getDate()}{" "}
                    {months[earliestAvailableDate.getMonth()].substring(0, 3)}
                  </span>
                  <span>&rarr;</span>
                </button>
              )}
          </div>
          {footerContent}
        </div>
      )}
    </div>
  )
}
