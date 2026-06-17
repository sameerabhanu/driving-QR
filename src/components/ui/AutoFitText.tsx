"use client";

import { useEffect, useRef, useState } from "react";

interface AutoFitTextProps {
  text: string;
  className?: string;
  minSize?: number;
  maxSize?: number;
}

export default function AutoFitText({
  text,
  className,
  minSize = 18,
  maxSize = 72,
}: AutoFitTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [fontSize, setFontSize] = useState(maxSize);

  useEffect(() => {
    const container = containerRef.current;
    const textElement = textRef.current;
    if (!container || !textElement) {
      return;
    }

    const fitText = () => {
      let low = minSize;
      let high = maxSize;
      let best = minSize;
      const targetWidth = Math.floor(container.clientWidth * 0.97);

      while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        textElement.style.fontSize = `${mid}px`;

        if (textElement.scrollWidth <= targetWidth) {
          best = mid;
          low = mid + 1;
        } else {
          high = mid - 1;
        }
      }

      setFontSize(best);
    };

    fitText();

    const observer = new ResizeObserver(() => {
      fitText();
    });
    observer.observe(container);

    if ("fonts" in document) {
      document.fonts.ready.then(() => fitText());
    }

    return () => {
      observer.disconnect();
    };
  }, [text, minSize, maxSize]);

  return (
    <div ref={containerRef} className="w-full py-1">
      <span
        ref={textRef}
        className={`inline-block ${className ?? ""}`}
        style={{ fontSize: `${fontSize}px` }}
      >
        {text}
      </span>
    </div>
  );
}
