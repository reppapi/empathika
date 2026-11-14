"use client"

import { useEffect, useState, Suspense } from "react"
import { usePathname, useSearchParams } from "next/navigation"

function ProgressBarTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isNavigating, setIsNavigating] = useState(false)
  const [progress, setProgress] = useState(0)

  // Selesaikan animasi ketika rute selesai berpindah
  useEffect(() => {
    if (isNavigating || progress > 0) {
      setProgress(100)
      const timer = setTimeout(() => {
        setIsNavigating(false)
        setProgress(0)
      }, 250)
      return () => clearTimeout(timer)
    }
  }, [pathname, searchParams])

  // Tangkap klik pada link untuk memulai progress bar instan
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a")
      if (!target) return

      const href = target.getAttribute("href")
      const targetAttr = target.getAttribute("target")
      if (
        targetAttr === "_blank" ||
        !href ||
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        href.startsWith("javascript:")
      ) {
        return
      }

      try {
        const url = new URL(href, window.location.href)
        // Jika navigasi internal dan mengarah ke URL berbeda
        if (
          url.origin === window.location.origin &&
          (url.pathname !== window.location.pathname || url.search !== window.location.search)
        ) {
          setIsNavigating(true)
          setProgress(25)

          // Gerakan progress bertahap agar terasa hidup
          const t1 = setTimeout(() => {
            setProgress((p) => (p >= 25 && p < 75 ? 65 : p))
          }, 120)

          const t2 = setTimeout(() => {
            setProgress((p) => (p >= 65 && p < 90 ? 85 : p))
          }, 350)

          return () => {
            clearTimeout(t1)
            clearTimeout(t2)
          }
        }
      } catch {}
    }

    document.addEventListener("click", handleAnchorClick, true)
    return () => {
      document.removeEventListener("click", handleAnchorClick, true)
    }
  }, [])

  if (!isNavigating && progress === 0) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-[99999] pointer-events-none h-[2.5px] overflow-hidden">
      <div
        className="h-full bg-gradient-to-r from-[#9333ea] via-[#eab308] to-[#561269] shadow-[0_0_10px_rgba(234,179,8,0.7)]"
        style={{
          width: `${progress}%`,
          opacity: progress === 100 ? 0 : 1,
          transition:
            progress === 100
              ? "width 150ms ease-out, opacity 250ms ease-in"
              : progress === 25
              ? "width 200ms ease-out"
              : "width 400ms cubic-bezier(0.1, 0.7, 0.1, 1)",
        }}
      />
    </div>
  )
}

export function NavigationProgressBar() {
  return (
    <Suspense fallback={null}>
      <ProgressBarTracker />
    </Suspense>
  )
}
