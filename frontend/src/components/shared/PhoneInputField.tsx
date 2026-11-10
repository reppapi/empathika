"use client"

import React, { useMemo, useState } from "react"

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
  if (!digits) return ""
  const chunks: string[] = []
  if (digits.length > 0) chunks.push(digits.slice(0, 3))
  if (digits.length > 3) chunks.push(digits.slice(3, 7))
  if (digits.length > 7) chunks.push(digits.slice(7, 11))
  if (digits.length > 11) chunks.push(digits.slice(11, 13))
  return chunks.join("-")
}

/**
 * Ekstrak digit angka nomor ponsel Indonesia murni (tanpa awalan 62 atau 0)
 * Contoh:
 * - "0812-3456-7890" -> "81234567890"
 * - "+62 812-3456-7890" -> "81234567890"
 * - "6281234567890" -> "81234567890"
 * - "81234567890" -> "81234567890"
 */
export function extractIndoPhoneDigits(val: string): string {
  if (!val) return ""
  let digits = String(val).replace(/\D/g, "")
  if (digits.startsWith("620")) {
    digits = digits.slice(3)
  } else if (digits.startsWith("62")) {
    digits = digits.slice(2)
  } else if (digits.startsWith("0")) {
    digits = digits.slice(1)
  }
  return digits.slice(0, 13)
}

/**
 * Komponen Input Nomor Telepon / WhatsApp Bersama (Shared Component)
 * - Tampilan visual terstandarisasi mirip PriceInputField pada tarif layanan admin:
 *   [Prefix +62 Badge] [Input Berformat Chunks 812-3456-7890] [Suffix Badge Digit Counter]
 * - Otomatis menangani awalan "08", "62", "+62", atau "8" sehingga pengguna bebas mengetik
 * - Nilai yang dikembalikan ke onChange: string berformat "+62 812-3456-7890" dan rawDigits "81234567890"
 */
export function PhoneInputField({
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
  // State sementara jika pengguna baru saja mengetikkan angka tunggal "0"
  const [typedSingleZero, setTypedSingleZero] = useState(false)

  // Ekstrak digit lokal murni (812...)
  const rawDigits = useMemo(() => {
    return extractIndoPhoneDigits(value)
  }, [value])

  // Tampilan berformat di dalam input (e.g. 812-4567-8901 atau sementara "0")
  const displayFormatted = useMemo(() => {
    if (typedSingleZero && !rawDigits) {
      return "0"
    }
    return formatIndoPhoneChunks(rawDigits)
  }, [rawDigits, typedSingleZero])

  const isValidLength = rawDigits.length >= minDigits && rawDigits.length <= maxDigits

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputVal = e.target.value
    const onlyDigits = inputVal.replace(/\D/g, "")

    // Jika pengguna baru mengetikkan angka 0 pertama kali, beri feedback visual "0"
    if (onlyDigits === "0") {
      setTypedSingleZero(true)
      onChange("", "")
      return
    }

    setTypedSingleZero(false)

    // Bersihkan awalan 620, 62, atau 0 karena sudah ada badge prefix +62
    let cleaned = onlyDigits
    if (cleaned.startsWith("620")) {
      cleaned = cleaned.slice(3)
    } else if (cleaned.startsWith("62")) {
      cleaned = cleaned.slice(2)
    } else if (cleaned.startsWith("0")) {
      cleaned = cleaned.slice(1)
    }
    cleaned = cleaned.slice(0, maxDigits)

    const formattedChunks = formatIndoPhoneChunks(cleaned)
    const formattedWithPrefix = cleaned ? `+62 ${formattedChunks}` : ""

    onChange(formattedWithPrefix, cleaned)
  }

  // Tangani backspace agar tidak tersangkut di tanda strip "-"
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      const input = e.currentTarget
      const start = input.selectionStart
      const end = input.selectionEnd
      if (start !== null && start === end && start > 0) {
        const val = input.value
        if (val[start - 1] === "-") {
          e.preventDefault()
          const before = val.slice(0, start - 2)
          const after = val.slice(start)
          const newRaw = (before + after).replace(/\D/g, "")
          let cleaned = newRaw
          if (cleaned.startsWith("620")) cleaned = cleaned.slice(3)
          else if (cleaned.startsWith("62")) cleaned = cleaned.slice(2)
          else if (cleaned.startsWith("0")) cleaned = cleaned.slice(1)
          cleaned = cleaned.slice(0, maxDigits)
          const formattedChunks = formatIndoPhoneChunks(cleaned)
          const formattedWithPrefix = cleaned ? `+62 ${formattedChunks}` : ""
          onChange(formattedWithPrefix, cleaned)
        }
      }
    }
  }

  const handleInputBlur = () => {
    if (typedSingleZero) {
      setTypedSingleZero(false)
    }
    if (onBlur) onBlur()
  }

  // Styling wrapper container (fokus ring & border)
  const focusBorderClass = useMemo(() => {
    if (error) {
      return "border-red-400 bg-red-50/20 focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-400/20"
    }
    if (theme === "yellow") {
      return "border-gray-200 bg-white focus-within:border-[#E8C32A] focus-within:ring-2 focus-within:ring-[#E8C32A]/30"
    }
    return "border-gray-200 bg-white focus-within:border-[#561269] focus-within:ring-2 focus-within:ring-[#561269]/20"
  }, [error, theme])

  // Styling badge prefix +62 (mirip badge 'Rp' pada tarif layanan)
  const prefixBadgeClass = useMemo(() => {
    if (error) {
      return "bg-red-50 border-r border-red-200 text-red-700"
    }
    if (theme === "yellow") {
      return "bg-amber-50/80 border-r border-amber-200/80 text-amber-900"
    }
    return "bg-purple-50/80 border-r border-purple-200/80 text-[#561269]"
  }, [error, theme])

  // Styling badge suffix digit counter (mirip badge ',00' pada tarif layanan)
  const suffixBadgeClass = useMemo(() => {
    if (!rawDigits) {
      return "bg-gray-50/80 border-l border-gray-200 text-gray-400 font-medium"
    }
    if (isValidLength) {
      return "bg-emerald-50/80 border-l border-emerald-200/80 text-emerald-800 font-bold"
    }
    if (rawDigits.length > maxDigits) {
      return "bg-rose-50/80 border-l border-rose-200/80 text-rose-800 font-bold"
    }
    return "bg-amber-50/80 border-l border-amber-200/80 text-amber-800 font-bold"
  }, [rawDigits, isValidLength, maxDigits])

  return (
    <div className={`w-full font-poppins ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className="block text-xs font-bold text-gray-700 mb-1.5"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div
        className={`flex rounded-xl overflow-hidden border shadow-2xs transition-all ${focusBorderClass} ${
          disabled ? "opacity-60 bg-gray-100 cursor-not-allowed" : ""
        }`}
      >
        {/* Prefix +62 Badge (Gaya Badge 'Rp' pada tarif layanan) */}
        <span
          className={`inline-flex items-center px-3.5 text-xs font-bold select-none shrink-0 tracking-wide ${prefixBadgeClass}`}
        >
          +62
        </span>

        {/* Input Text Berformat Chunks */}
        <input
          id={id}
          name={name}
          type="tel"
          inputMode="numeric"
          disabled={disabled}
          required={required}
          value={displayFormatted}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onBlur={handleInputBlur}
          onFocus={onFocus}
          placeholder={placeholder}
          className={`flex-1 block w-full px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-gray-900 bg-transparent outline-none placeholder:text-gray-400 placeholder:font-normal ${inputClassName}`}
        />

        {/* Suffix Badge Counter Digit (Gaya Badge ',00' pada tarif layanan) */}
        {showDigitCount && (
          <span
            className={`inline-flex items-center px-2.5 sm:px-3 text-[10px] sm:text-[11px] select-none shrink-0 transition-colors ${suffixBadgeClass}`}
          >
            {!rawDigits
              ? "10-13 digit"
              : isValidLength
              ? `✓ ${rawDigits.length} digit`
              : rawDigits.length > maxDigits
              ? `! ${rawDigits.length} digit`
              : `${rawDigits.length} digit`}
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

export default PhoneInputField
