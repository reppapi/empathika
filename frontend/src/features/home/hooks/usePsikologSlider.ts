import { useState, useEffect } from 'react';

export function usePsikologSlider(itemCount: number, initialIndex: number = 2) {
  const [activePsyIndex, setActivePsyIndex] = useState(initialIndex);

  const scrollPsyTo = (index: number) => {
    const container = document.getElementById('psy-scroll-container');
    const cards = container?.querySelectorAll('.psy-card');
    if (container && cards && cards[index]) {
      const card = cards[index] as HTMLElement;
      const scrollTarget = card.offsetLeft - container.clientWidth / 2 + card.clientWidth / 2;
      container.scrollTo({ left: scrollTarget, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    // Center the carousel on initial load
    const timer = setTimeout(() => {
      scrollPsyTo(initialIndex);
    }, 100);
    return () => clearTimeout(timer);
  }, [initialIndex]);

  const nextPsy = () => {
    if (activePsyIndex < itemCount - 1) scrollPsyTo(activePsyIndex + 1);
  };

  const prevPsy = () => {
    if (activePsyIndex > 0) scrollPsyTo(activePsyIndex - 1);
  };

  const handlePsyScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const scrollCenter = container.scrollLeft + container.clientWidth / 2;
    
    const cards = container.querySelectorAll('.psy-card');
    let closestIdx = 0;
    let minDistance = Infinity;
    
    cards.forEach((card, idx) => {
      const el = card as HTMLElement;
      const cardCenter = el.offsetLeft + el.clientWidth / 2;
      const distance = Math.abs(cardCenter - scrollCenter);
      
      if (distance < minDistance) {
        minDistance = distance;
        closestIdx = idx;
      }
    });
    
    if (activePsyIndex !== closestIdx) {
      setActivePsyIndex(closestIdx);
    }
  };

  return {
    activePsyIndex,
    nextPsy,
    prevPsy,
    scrollPsyTo,
    handlePsyScroll,
  };
}
