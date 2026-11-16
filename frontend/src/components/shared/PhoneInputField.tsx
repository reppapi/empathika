"use client"

import React, { useMemo, useState } from "react"

export interface PhoneInputFieldProps {
  value: string
  onChange: (value: string, rawDigits: string) => void
  label?: string | null
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
 * Contoh: 82173739213 -> 821-7373-9213
 */
export function formatIndoPhoneChunks(digits: string): string {
  if (!digits) return ""
  const chunks: string[] = []
  if (digits.length > 0) chunks.push(digits.slice(0, 3))
  if (digits.length > 3) chunks.push(digits.slice(3, 7))
  if (digits.length > 7) chunks.push(digits.slice(7, 11))
  if (digits.length > 11) chunks.push(digits.slice(11, 14))
  return chunks.join("-")
}

/**
 * Ekstrak digit angka nomor ponsel Indonesia murni (tanpa awalan 620, 62, atau 0)
 * Contoh:
 * - "0821-7373-9213" -> "82173739213"
 * - "+62 821-7373-9213" -> "82173739213"
 * - "6282173739213" -> "82173739213"
 * - "82173739213" -> "82173739213"
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
 * Format nomor telepon Indonesia lengkap dengan awalan "+62 " dan pemisah chunk "-"
 * Contoh: "82173739213" -> "+62 821-7373-9213"
 */
export function formatIndoPhoneWithPrefix(val: string): string {
  if (!val || val === "—") return ""
  const digits = extractIndoPhoneDigits(val)
  if (!digits) return ""
  return `+62 ${formatIndoPhoneChunks(digits)}`
}

/**
 * Komponen Input Nomor WhatsApp / Telepon Bersama (Shared Component)
 * - Desain terpadu kotak bergaris ungu Empathika (border-2 border-[#561269] rounded-2xl bg-white)
 * - Label tebal "No WhatsApp *" dengan bintang merah
 * - Otomatis menangani awalan "+62", "62", "08", atau "8" sehingga pengguna bebas mengetik
 * - Nilai yang dikembalikan ke onChange: string berformat "+62 821-7373-9213" dan rawDigits "82173739213"
 */
export function PhoneInputField({
  value,
  onChange,
  label = "No WhatsApp",
  placeholder = "+62 821-7373-9213",
  required = false,
  disabled = false,
  error = null,
  helperText,
  id,
  name,
  className = "",
  inputClassName = "",
  showDigitCount = false,
  minDigits = 10,
  maxDigits = 14,
  onBlur,
  onFocus,
}: PhoneInputFieldProps) {
  // State sementara jika pengguna baru mengetikkan angka tunggal "0"
  const [typedSingleZero, setTypedSingleZero] = useState(false)

  // Ekstrak digit lokal murni (821...)
  const rawDigits = useMemo(() => {
    return extractIndoPhoneDigits(value)
  }, [value])

  // Tampilan berformat di dalam input (e.g. +62 821-7373-9213)
  const displayValue = useMemo(() => {
    if (typedSingleZero && !rawDigits) {
      return "+62 "
    }
    if (!value) return ""
    if (value.startsWith("+62 ")) {
      return value
    }
    if (!rawDigits) return ""
    return `+62 ${formatIndoPhoneChunks(rawDigits)}`
  }, [value, rawDigits, typedSingleZero])

  const isValidLength = rawDigits.length >= minDigits && rawDigits.length <= maxDigits

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputVal = e.target.value

    // Jika pengguna menghapus teks hingga kosong atau hanya tersisa awalan prefix
    const trimmed = inputVal.trim()
    if (!trimmed || trimmed === "+" || trimmed === "+6" || trimmed === "+62" || trimmed === "+62 ") {
      setTypedSingleZero(false)
      onChange("", "")
      return
    }

    const onlyDigits = inputVal.replace(/\D/g, "")

    // Jika pengguna baru mengetikkan angka 0 pertama kali
    if (onlyDigits === "0") {
      setTypedSingleZero(true)
      onChange("", "")
      return
    }

    setTypedSingleZero(false)

    // Bersihkan awalan 620, 62, atau 0
    let cleaned = onlyDigits
    if (cleaned.startsWith("620")) {
      cleaned = cleaned.slice(3)
    } else if (cleaned.startsWith("62")) {
      cleaned = cleaned.slice(2)
    } else if (cleaned.startsWith("0")) {
      cleaned = cleaned.slice(1)
    }
    cleaned = cleaned.slice(0, maxDigits)

    if (!cleaned) {
      onChange("", "")
      return
    }

    const formattedChunks = formatIndoPhoneChunks(cleaned)
    const formattedWithPrefix = `+62 ${formattedChunks}`

    onChange(formattedWithPrefix, cleaned)
  }

  // Tangani backspace agar tidak tersangkut di tanda strip "-" atau spasi
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      const input = e.currentTarget
      const start = input.selectionStart
      const end = input.selectionEnd
      if (start !== null && start === end && start > 0) {
        const val = input.value
        // Jika karakter sebelum kursor adalah tanda hubung '-' atau spasi ' '
        if (val[start - 1] === "-" || val[start - 1] === " ") {
          e.preventDefault()
          // Mundur melewati tanda pemisah untuk menghapus digit sebelumnya
          let deleteIndex = start - 1
          while (deleteIndex >= 0 && (val[deleteIndex] === "-" || val[deleteIndex] === " ")) {
            deleteIndex--
          }
          if (deleteIndex < 4) {
            // Sudah sampai atau melewati awalan "+62 "
            setTypedSingleZero(false)
            onChange("", "")
            return
          }
          const before = val.slice(0, deleteIndex)
          const after = val.slice(start)
          const onlyDigits = (before + after).replace(/\D/g, "")
          let cleaned = onlyDigits
          if (cleaned.startsWith("620")) cleaned = cleaned.slice(3)
          else if (cleaned.startsWith("62")) cleaned = cleaned.slice(2)
          else if (cleaned.startsWith("0")) cleaned = cleaned.slice(1)
          cleaned = cleaned.slice(0, maxDigits)

          if (!cleaned) {
            setTypedSingleZero(false)
            onChange("", "")
            return
          }
          const formattedChunks = formatIndoPhoneChunks(cleaned)
          const formattedWithPrefix = `+62 ${formattedChunks}`
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

  return (
    <div className={`w-full font-poppins ${className}`}>
      {label !== null && label !== "" && (
        <label
          htmlFor={id}
          className="block text-sm sm:text-base font-bold text-gray-900 mb-2 select-none"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div
        className={`group relative flex items-center w-full rounded-2xl border-2 transition-all duration-200 bg-white ${
          error
            ? "border-red-500 focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-400/20"
            : "border-[#561269] hover:border-[#430d52] focus-within:border-[#561269] focus-within:ring-2 focus-within:ring-[#561269]/20"
        } ${disabled ? "opacity-60 bg-gray-100 cursor-not-allowed border-gray-300" : ""}`}
      >
        <input
          id={id}
          name={name}
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          disabled={disabled}
          required={required}
          value={displayValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onBlur={handleInputBlur}
          onFocus={onFocus}
          placeholder={placeholder}
          className={`w-full px-4 sm:px-5 py-3 sm:py-3.5 text-base sm:text-lg font-semibold text-gray-900 bg-transparent outline-none border-none placeholder:text-gray-400 placeholder:font-normal tracking-wide ${inputClassName}`}
        />

        {showDigitCount && rawDigits && (
          <span
            className={`mr-3 inline-flex items-center px-2 py-0.5 rounded-md text-[10px] sm:text-[11px] font-bold select-none shrink-0 transition-colors ${
              isValidLength
                ? "bg-emerald-50 text-emerald-700"
                : rawDigits.length > maxDigits
                ? "bg-rose-50 text-rose-700"
                : "bg-amber-50 text-amber-700"
            }`}
          >
            {isValidLength
              ? `✓ ${rawDigits.length} digit`
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
        <p className="text-[11px] text-gray-500 mt-1.5">{helperText}</p>
      ) : null}
    </div>
  )
}

export default PhoneInputField
