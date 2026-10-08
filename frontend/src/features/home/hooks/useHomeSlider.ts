import { useState, useEffect } from 'react';

export function useHomeSlider(slidesCount: number) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isHovered) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev === slidesCount - 1 ? 0 : prev + 1));
    }, 6000);
    return () => clearInterval(interval);
  }, [isHovered, slidesCount]);

  const nextSlide = () => setCurrentSlide((prev) => (prev === slidesCount - 1 ? 0 : prev + 1));
  const prevSlide = () => setCurrentSlide((prev) => (prev === 0 ? slidesCount - 1 : prev - 1));

  return {
    currentSlide,
    setCurrentSlide,
    setIsHovered,
    nextSlide,
    prevSlide,
  };
}
