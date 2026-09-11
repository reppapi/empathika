export function EmptyState({ message = "Tidak ada data." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-gray-400">
      <p className="text-lg">{message}</p>
    </div>
  )
}

