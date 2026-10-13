"use client"

import React from "react"
import Link from "next/link"

/**
 * 1. Tombol Detail:
 * Acuan: Data Peserta Psikotes
 * Gaya: p-2 text-gray-400 hover:text-[#561269] hover:bg-[#561269]/10 rounded-lg transition-colors
 * Ikon: Eye (Lihat Detail)
 */
export function DetailIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.8}
      stroke="currentColor"
      className={className}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
      />
    </svg>
  )
}

/**
 * 2. Tombol Edit:
 * Acuan: Tabel Daftar Event
 * Ikon: Sesuai tabel Daftar Event
 * Gaya: p-2 text-gray-400 hover:text-[#561269] hover:bg-[#561269]/10 rounded-lg transition-colors
 */
export function EditIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.8}
      stroke="currentColor"
      className={className}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
      />
    </svg>
  )
}

/**
 * 3. Tombol Hapus:
 * Acuan: Halaman Data Psikolog
 * Gaya: rounded-xl border border-gray-200 bg-white p-1.5 text-gray-500 hover:text-red-600 hover:border-red-200 transition
 * Ikon: Trash
 */
export function DeleteIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      className={className}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
      />
    </svg>
  )
}

interface ActionButtonProps {
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
  href?: string
  title?: string
  className?: string
  disabled?: boolean
}

export function ActionButtonDetail({
  onClick,
  href,
  title = "Lihat Detail",
  className = "",
  disabled = false,
}: ActionButtonProps) {
  const baseClasses =
    "p-2 text-gray-400 hover:text-[#561269] hover:bg-[#561269]/10 rounded-lg transition-colors inline-flex items-center justify-center shrink-0 disabled:opacity-40"

  if (href) {
    return (
      <Link
        href={href as any}
        title={title}
        className={`${baseClasses} ${className}`}
        aria-label={title}
      >
        <DetailIcon />
      </Link>
    )
  }

  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      disabled={disabled}
      className={`${baseClasses} ${className}`}
      aria-label={title}
    >
      <DetailIcon />
    </button>
  )
}

export function ActionButtonEdit({
  onClick,
  href,
  title = "Edit",
  className = "",
  disabled = false,
}: ActionButtonProps) {
  const baseClasses =
    "p-2 text-gray-400 hover:text-[#561269] hover:bg-[#561269]/10 rounded-lg transition-colors inline-flex items-center justify-center shrink-0 disabled:opacity-40"

  if (href) {
    return (
      <Link
        href={href as any}
        title={title}
        className={`${baseClasses} ${className}`}
        aria-label={title}
      >
        <EditIcon />
      </Link>
    )
  }

  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      disabled={disabled}
      className={`${baseClasses} ${className}`}
      aria-label={title}
    >
      <EditIcon />
    </button>
  )
}

export function ActionButtonDelete({
  onClick,
  title = "Hapus",
  className = "",
  disabled = false,
}: ActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      disabled={disabled}
      className={`rounded-xl border border-gray-200 bg-white p-1.5 text-gray-500 hover:text-red-600 hover:border-red-200 transition inline-flex items-center justify-center shrink-0 disabled:opacity-40 ${className}`}
      aria-label={title}
    >
      <DeleteIcon />
    </button>
  )
}
