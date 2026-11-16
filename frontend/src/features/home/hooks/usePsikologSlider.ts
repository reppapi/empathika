import { useState, useEffect } from 'react';

export function usePsikologSlider(itemCount: number, initialIndex?: number) {
  // Hitung posisi tengah dinamis dari jumlah psikolog (misal: dari 5 kartu -> index 2; dari 6 kartu -> index 3)
  const getMiddleIndex = (count: number) => {
    if (count <= 0) return 0;
    return Math.floor(count / 2);
  };

  const [activePsyIndex, setActivePsyIndex] = useState(() => {
    const defaultIdx = initialIndex !== undefined ? initialIndex : getMiddleIndex(itemCount);
    return itemCount > 0 ? Math.min(defaultIdx, Math.max(0, itemCount - 1)) : 0;
  });

  const scrollPsyTo = (index: number, behavior: ScrollBehavior = 'smooth') => {
    const container = document.getElementById('psy-scroll-container');
    const cards = container?.querySelectorAll('.psy-card');
    if (container && cards && cards[index]) {
      const card = cards[index] as HTMLElement;
      const scrollTarget = card.offsetLeft - container.clientWidth / 2 + card.clientWidth / 2;
      container.scrollTo({ left: Math.max(0, scrollTarget), behavior });
    }
  };

  useEffect(() => {
    if (itemCount === 0) return;
    const targetIdx =
      initialIndex !== undefined
        ? Math.min(initialIndex, Math.max(0, itemCount - 1))
        : getMiddleIndex(itemCount);

    setActivePsyIndex(targetIdx);

    // Posisikan card tengah ke tengah layar seketika saat pertama buka web
    const applyScroll = (behavior: ScrollBehavior = 'auto') => {
      scrollPsyTo(targetIdx, behavior);
    };

    applyScroll('auto');
    const raf = requestAnimationFrame(() => applyScroll('auto'));
    const timer1 = setTimeout(() => applyScroll('auto'), 60);
    const timer2 = setTimeout(() => applyScroll('smooth'), 250);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [itemCount, initialIndex]);

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
