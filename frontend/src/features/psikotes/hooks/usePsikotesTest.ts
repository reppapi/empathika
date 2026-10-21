import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function usePsikotesTest(
  totalQuestions: number,
  testId: string,
  calculateScore?: (answers: Record<number, number>) => number
) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showError, setShowError] = useState(false);

  const handleOptionSelect = (optionIndex: number) => {
    setAnswers((prev) => ({ ...prev, [currentIndex]: optionIndex }));
    setShowError(false);
  };

  const goToNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    if (answers[currentIndex] === undefined) {
      setShowError(true);
      return;
    }

    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      const score = calculateScore ? calculateScore(answers) : 0;
      const query = new URLSearchParams(searchParams.toString());
      query.set("skor", String(score));
      router.push(`/psikotes/${testId}/hasil?${query.toString()}` as any);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setShowError(false);
    }
  };

  return {
    currentIndex,
    answers,
    showError,
    handleOptionSelect,
    handleNext,
    handlePrev,
    goToNext,
  };
}
