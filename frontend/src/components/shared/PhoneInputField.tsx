"use client"

import React, { useMemo } from "react"

export interface PhoneInputFieldProps {
  value: string
  onChange: (value: string, rawDigits: string) => void
  label?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  error?: string | null
  helperText?: string
  id?: string
  name?: string
  className?: string
  inputClassName?: string
  showDigitCount?: boolean
  minDigits?: number
  maxDigits?: number
  theme?: "purple" | "yellow" | "default"
  onBlur?: () => void
  onFocus?: () => void
}

/**
 * Format digit angka nomor Indonesia menjadi kelompok chunks yang rapi (3-4-4-2)
 * Contoh: 81245678901 -> 812-4567-8901
 */
export function formatIndoPhoneChunks(digits: string): string {
  const chunks: string[] = []
  if (digits.length > 0) chunks.push(digits.slice(0, 3))
  if (digits.length > 3) chunks.push(digits.slice(3, 7))
  if (digits.length > 7) chunks.push(digits.slice(7, 11))
  if (digits.length > 11) chunks.push(digits.slice(11, 13))
  return chunks.join("-")
}

/**
 * Ekstrak digit angka nomor ponsel Indonesia murni (tanpa awalan 0 atau 62)
 */
export function extractIndoPhoneDigits(val: string): string {
  if (!val) return ""
  let digits = String(val).replace(/\D/g, "")
  if (digits.startsWith("62")) {
    digits = digits.slice(2)
  } else if (digits.startsWith("0")) {
    digits = digits.slice(1)
  }
  return digits.slice(0, 13)
}

export default function PhoneInputField({
  value,
  onChange,
  label,
  placeholder = "812-3456-7890",
  required = false,
  disabled = false,
  error = null,
  helperText,
  id,
  name,
  className = "",
  inputClassName = "",
  showDigitCount = true,
  minDigits = 10,
  maxDigits = 13,
  theme = "purple",
  onBlur,
  onFocus,
}: PhoneInputFieldProps) {
  // Ekstrak digit lokal murni
  const rawDigits = useMemo(() => {
    return extractIndoPhoneDigits(value)
  }, [value])

  // Tampilan berformat di dalam input
  const displayFormatted = useMemo(() => {
    return formatIndoPhoneChunks(rawDigits)
  }, [rawDigits])

  const isValidLength = rawDigits.length >= minDigits && rawDigits.length <= maxDigits

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputVal = e.target.value
    const onlyDigits = inputVal.replace(/\D/g, "")

    let cleaned = onlyDigits
    if (cleaned.startsWith("62")) {
      cleaned = cleaned.slice(2)
    } else if (cleaned.startsWith("0")) {
      cleaned = cleaned.slice(1)
    }
    cleaned = cleaned.slice(0, maxDigits)

    const formattedChunks = formatIndoPhoneChunks(cleaned)
    const formattedWithPrefix = cleaned ? `+62 ${formattedChunks}` : ""

    onChange(formattedWithPrefix, cleaned)
  }

  // Ring & Focus styling berdasarkan tema
  const focusBorderClass = useMemo(() => {
    if (error) {
      return "border-red-400 bg-red-50/20 focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-400/20"
    }
    if (theme === "yellow") {
      return "border-gray-200 bg-gray-50/50 focus-within:bg-white focus-within:border-[#E8C32A] focus-within:ring-2 focus-within:ring-[#E8C32A]"
    }
    return "border-gray-200 bg-white focus-within:border-[#561269] focus-within:ring-2 focus-within:ring-[#561269]/15"
  }, [error, theme])

  const prefixBadgeClass = useMemo(() => {
    if (error) {
      return "bg-red-50 border-r border-red-200 text-red-600"
    }
    return "bg-purple-50/80 border-r border-gray-200 text-[#561269]"
  }, [error])

  return (
    <div className={`w-full font-poppins ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center justify-between"
        >
          <span>
            {label} {required && <span className="text-red-500">*</span>}
          </span>
          {showDigitCount && rawDigits.length > 0 && (
            <span
              className={`text-[10px] font-bold transition-colors ${
                isValidLength ? "text-emerald-700" : "text-amber-700"
              }`}
            >
              {rawDigits.length} digit
            </span>
          )}
        </label>
      )}

      <div
        className={`flex rounded-xl overflow-hidden border shadow-2xs transition-all ${focusBorderClass} ${
          disabled ? "opacity-60 bg-gray-100 cursor-not-allowed" : ""
        }`}
      >
        {/* Prefix +62 Badge (Mirip Badge 'Rp' pada tarif layanan) */}
        <span
          className={`inline-flex items-center px-3.5 text-xs font-bold select-none shrink-0 ${prefixBadgeClass}`}
        >
          +62
        </span>

        {/* Input Text Berformat */}
        <input
          id={id}
          name={name}
          type="tel"
          inputMode="numeric"
          disabled={disabled}
          required={required}
          value={displayFormatted}
          onChange={handleChange}
          onBlur={onBlur}
          onFocus={onFocus}
          placeholder={placeholder}
          className={`flex-1 block w-full px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-gray-900 bg-transparent outline-none placeholder:text-gray-400 placeholder:font-normal ${inputClassName}`}
        />

        {/* Suffix Penghitung Digit (Mirip Badge ',00' pada tarif) */}
        {showDigitCount && (
          <span className="inline-flex items-center px-2.5 bg-gray-50/80 border-l border-gray-200 text-gray-400 text-[10px] sm:text-[11px] font-medium select-none shrink-0">
            {rawDigits.length > 0 ? `${rawDigits.length} digit` : "10-13 digit"}
          </span>
        )}
      </div>

      {/* Pesan Error / Helper */}
      {error ? (
        <p className="text-xs text-red-600 font-medium mt-1.5 flex items-center gap-1.5 animate-in fade-in duration-150">
          <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <span>{error}</span>
        </p>
      ) : helperText ? (
        <p className="text-[11px] text-gray-400 mt-1">{helperText}</p>
      ) : null}
    </div>
  )
}
