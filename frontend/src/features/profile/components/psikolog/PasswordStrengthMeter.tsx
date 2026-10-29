// File: frontend/src/features/profile/components/psikolog/PasswordStrengthMeter.tsx
"use client"

import React from "react"
import { Check, X } from "lucide-react"

interface PasswordStrengthMeterProps {
  password: string
}

export function PasswordStrengthMeter({ password }: PasswordStrengthMeterProps) {
  const rules = [
    { label: "Minimal 8 karakter", valid: password.length >= 8 },
    { label: "Memiliki huruf besar (A-Z)", valid: /[A-Z]/.test(password) },
    { label: "Memiliki huruf kecil (a-z)", valid: /[a-z]/.test(password) },
    { label: "Memiliki angka (0-9)", valid: /[0-9]/.test(password) },
    { label: "Memiliki karakter simbol (@$!%*?&#)", valid: /[^a-zA-Z0-9]/.test(password) },
  ]

  const passedCount = rules.filter((r) => r.valid).length

  const getStrengthMeta = () => {
    if (password.length === 0) return { label: "", color: "bg-gray-200", percent: 0 }
    if (passedCount <= 2) return { label: "Sangat Lemah", color: "bg-red-500", percent: 25 }
    if (passedCount === 3) return { label: "Cukup", color: "bg-amber-500", percent: 50 }
    if (passedCount === 4) return { label: "Kuat", color: "bg-blue-500", percent: 75 }
    return { label: "Sangat Kuat", color: "bg-emerald-600", percent: 100 }
  }

  const strength = getStrengthMeta()

  return (
    <div className="mt-2 space-y-2.5 font-poppins">
      {password.length > 0 && (
        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-gray-500">Kekuatan Sandi:</span>
            <span className="font-semibold text-gray-700">{strength.label}</span>
          </div>
          <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${strength.color}`}
              style={{ width: `${strength.percent}%` }}
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
        {rules.map((rule, idx) => (
          <div key={idx} className="flex items-center gap-1.5 text-xs">
            {rule.valid ? (
              <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
            ) : (
              <X className="h-3.5 w-3.5 text-gray-400 shrink-0" />
            )}
            <span className={rule.valid ? "text-emerald-700 font-medium" : "text-gray-500"}>
              {rule.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
