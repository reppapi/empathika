"use client"

import React from "react"

interface ActivationWarningModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  message: string
  expiryDateText?: string
  remainingText?: string
}

export default function ActivationWarningModal({
  isOpen,
  onClose,
  title = "Peringatan Generate Link",
  message,
  expiryDateText,
  remainingText,
}: ActivationWarningModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-amber-200 overflow-hidden transform transition-all p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 text-2xl">
            ⚠️
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-slate-800 mb-1">{title}</h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">{message}</p>

            {(expiryDateText || remainingText) && (
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-xs text-amber-900 space-y-1">
                {expiryDateText && (
                  <div className="flex justify-between">
                    <span className="text-amber-700 font-medium">Batas Kedaluwarsa:</span>
                    <span className="font-semibold">{expiryDateText}</span>
                  </div>
                )}
                {remainingText && (
                  <div className="flex justify-between">
                    <span className="text-amber-700 font-medium">Generate ulang dalam:</span>
                    <span className="font-semibold text-amber-800">{remainingText}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-medium text-sm hover:bg-slate-800 transition active:scale-95 cursor-pointer shadow-md shadow-slate-900/10"
          >
            Mengerti
          </button>
        </div>
      </div>
    </div>
  )
}
