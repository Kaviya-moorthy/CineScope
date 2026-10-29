import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Carousel({ label, children }) {
  const ref = useRef(null);
  const scroll = (dir) => ref.current?.scrollBy({ left: dir * ref.current.clientWidth * 0.85, behavior: 'smooth' });
  return (
    <div className="carousel">
      <button type="button" className="carousel-btn prev" aria-label={`Scroll ${label} left`} onClick={() => scroll(-1)}><ChevronLeft size={20} aria-hidden="true" /></button>
      <div className="carousel-track" ref={ref} role="region" aria-label={label} tabIndex={0}>{children}</div>
      <button type="button" className="carousel-btn next" aria-label={`Scroll ${label} right`} onClick={() => scroll(1)}><ChevronRight size={20} aria-hidden="true" /></button>
    </div>
  );
}
