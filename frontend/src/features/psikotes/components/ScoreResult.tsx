interface ScoreResultProps {
  hasil: {
    skor: number
    kategori: string
    interpretasi: string
    rekomendasi: string
  }
}

export function ScoreResult({ hasil }: ScoreResultProps) {
  return (
    <div className="rounded-xl border-2 border-primary p-6 text-center">
      <div className="text-5xl font-bold text-primary">{hasil.skor}</div>
      <div className="mt-2 text-xl font-semibold">{hasil.kategori}</div>
      <p className="mt-4 text-gray-600">{hasil.interpretasi}</p>
      <div className="mt-4 rounded-lg bg-blue-50 p-4 text-left">
        <p className="font-medium">Rekomendasi:</p>
        <p className="text-sm text-gray-600">{hasil.rekomendasi}</p>
      </div>
    </div>
  )
}

