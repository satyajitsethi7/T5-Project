import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

interface SplitTextProps {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
  ease?: string;
  splitType?: 'chars' | 'words' | 'lines';
  from?: Record<string, any>;
  to?: Record<string, any>;
  threshold?: number;
  rootMargin?: string;
  textAlign?: 'left' | 'center' | 'right';
  onLetterAnimationComplete?: () => void;
  showCallback?: boolean;
}

export default function SplitText({
  text,
  className = '',
  delay = 50,
  duration = 1.25,
  ease = 'power3.out',
  splitType = 'chars',
  from = { opacity: 0, y: 40 },
  to = { opacity: 1, y: 0 },
  textAlign = 'center',
  onLetterAnimationComplete,
  showCallback = false,
}: SplitTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!containerRef.current) return;

      const elements = gsap.utils.toArray<HTMLElement>('.split-char');

      if (elements.length === 0) return;

      gsap.fromTo(
        elements,
        { ...from },
        {
          ...to,
          duration,
          ease,
          stagger: delay / 1000,
          onComplete: () => {
            if (showCallback && onLetterAnimationComplete) {
              onLetterAnimationComplete();
            }
          },
        }
      );
    },
    { scope: containerRef }
  );

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ textAlign, display: 'inline-block' }}
    >
      {text.split('').map((char, index) =>
        char === ' ' ? (
          <span key={index} className="split-char inline-block whitespace-pre relative">
            &nbsp;
          </span>
        ) : (
          <span key={index} className="split-char inline-block relative">
            {char}
          </span>
        )
      )}
    </div>
  );
}
