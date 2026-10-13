import type { Psikotes } from "@/types/psikotes.types"

interface QuestionCardProps {
  question: Psikotes["soal"][0]
  onAnswer: (jawaban: string) => void
  currentAnswer?: string
}

export function QuestionCard({ question, onAnswer, currentAnswer }: QuestionCardProps) {
  return (
    <div className="rounded-lg border p-4">
      <p className="mb-4 font-medium">{question.text}</p>
      <div className="flex flex-col gap-2">
        {question.pilihan.map((p) => (
          <button
            key={p.value}
            onClick={() => onAnswer(p.value)}
            className={`rounded-md border px-4 py-2 text-left transition-colors ${
              currentAnswer === p.value ? "border-primary bg-primary/10" : "hover:bg-gray-50"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  )
}

