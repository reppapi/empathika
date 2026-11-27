"use client"

import { useState, useMemo } from "react"
import { BookedSession } from "../../components/psikolog/types"
import { getMonday, formatDateKey } from "../../components/psikolog/utils/psikologDateUtils"

export function usePsikologWeekNavigation(
  date: Date | undefined,
  bookedSessions: BookedSession[],
  onResetSelection?: () => void,
  onDateChange?: (d: Date) => void
) {
  const [currentWeekMonday, setCurrentWeekMonday] = useState<Date>(() => getMonday(new Date()))

  const weekDays = useMemo(() => {
    const dayNames = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"]
    const monthNamesShort = [
      "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
      "Jul", "Agus", "Sep", "Okt", "Nov", "Des",
    ]

    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(currentWeekMonday)
      d.setDate(currentWeekMonday.getDate() + i)
      const dateKey = formatDateKey(d)
      return {
        dayName: dayNames[i],
        dateKey,
        dateLabel: `${d.getDate()} ${monthNamesShort[d.getMonth()]}`,
        isSameAsSelected: date ? dateKey === formatDateKey(date) : false,
      }
    })
  }, [currentWeekMonday, date])

  const weekRangeLabel = useMemo(() => {
    const start = new Date(currentWeekMonday)
    const end = new Date(currentWeekMonday)
    end.setDate(currentWeekMonday.getDate() + 6)

    const monthNames = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember",
    ]

    if (start.getMonth() === end.getMonth()) {
      return `${start.getDate()} - ${end.getDate()} ${monthNames[start.getMonth()]} ${start.getFullYear()}`
    } else {
      return `${start.getDate()} ${monthNames[start.getMonth()].slice(0, 4)} - ${end.getDate()} ${
        monthNames[end.getMonth()]
      } ${end.getFullYear()}`
    }
  }, [currentWeekMonday])

  const firstMondayOfMonth = useMemo(() => {
    const now = new Date()
    const d = getMonday(new Date(now.getFullYear(), now.getMonth(), 1))
    d.setHours(0, 0, 0, 0)
    return d
  }, [])

  const maxNavMonday = useMemo(() => {
    const now = new Date()
    const defaultEndMonday = getMonday(new Date(now.getFullYear(), now.getMonth() + 1, 0))
    defaultEndMonday.setHours(0, 0, 0, 0)

    let furthest = defaultEndMonday

    bookedSessions.forEach((s) => {
      if (s.date && !s.isCancelled && s.status !== "Dibatalkan") {
        const parts = s.date.split("-").map(Number)
        if (parts.length === 3 && parts[0] && parts[1] && parts[2]) {
          const sessionDate = new Date(parts[0], parts[1] - 1, parts[2])
          sessionDate.setHours(0, 0, 0, 0)
          const sessionMonday = getMonday(sessionDate)
          sessionMonday.setHours(0, 0, 0, 0)
          if (sessionMonday.getTime() > furthest.getTime()) {
            furthest = sessionMonday
          }
        }
      }
    })

    if (date) {
      const selectedMonday = getMonday(date)
      selectedMonday.setHours(0, 0, 0, 0)
      if (selectedMonday.getTime() > furthest.getTime()) {
        furthest = selectedMonday
      }
    }

    return furthest
  }, [bookedSessions, date])

  const canGoPrevWeek = useMemo(() => {
    const prevMonday = new Date(currentWeekMonday)
    prevMonday.setDate(prevMonday.getDate() - 7)
    prevMonday.setHours(0, 0, 0, 0)
    return prevMonday >= firstMondayOfMonth
  }, [currentWeekMonday, firstMondayOfMonth])

  const canGoNextWeek = useMemo(() => {
    const nextMonday = new Date(currentWeekMonday)
    nextMonday.setDate(nextMonday.getDate() + 7)
    nextMonday.setHours(0, 0, 0, 0)
    return nextMonday <= maxNavMonday
  }, [currentWeekMonday, maxNavMonday])

  const currentWeekMondayToday = useMemo(() => {
    const d = getMonday(new Date())
    d.setHours(0, 0, 0, 0)
    return d
  }, [])

  const isCurrentWeek = useMemo(() => {
    const cur = new Date(currentWeekMonday)
    cur.setHours(0, 0, 0, 0)
    return cur.getTime() === currentWeekMondayToday.getTime()
  }, [currentWeekMonday, currentWeekMondayToday])

  const goToCurrentWeek = () => {
    const now = new Date()
    setCurrentWeekMonday(getMonday(now))
    onDateChange?.(now)
    onResetSelection?.()
  }

  const goToPrevWeek = () => {
    if (!canGoPrevWeek) return
    const prev = new Date(currentWeekMonday)
    prev.setDate(currentWeekMonday.getDate() - 7)
    setCurrentWeekMonday(prev)
    onResetSelection?.()
  }

  const goToNextWeek = () => {
    if (!canGoNextWeek) return
    const next = new Date(currentWeekMonday)
    next.setDate(currentWeekMonday.getDate() + 7)
    setCurrentWeekMonday(next)
    onResetSelection?.()
  }

  return {
    currentWeekMonday,
    setCurrentWeekMonday,
    weekDays,
    weekRangeLabel,
    canGoPrevWeek,
    canGoNextWeek,
    isCurrentWeek,
    goToPrevWeek,
    goToNextWeek,
    goToCurrentWeek,
  }
}
