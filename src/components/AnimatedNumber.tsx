import { useEffect, useState, useRef } from "preact/hooks";

interface AnimatedNumberProps {
  value: number;
  label: string;
  intensity?: number; // 0-1, controls animation intensity
}

export function AnimatedNumber({ value, label, intensity = 0 }: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const [isFlipping, setIsFlipping] = useState(false);
  const prevValueRef = useRef(value);

  useEffect(() => {
    if (prevValueRef.current !== value) {
      setIsFlipping(true);
      
      // Delay the value change to create flip effect
      const timeout = setTimeout(() => {
        setDisplayValue(value);
        setIsFlipping(false);
      }, 150);

      prevValueRef.current = value;

      return () => clearTimeout(timeout);
    }
  }, [value]);

  const glowClass = intensity > 0.7 ? "animate-glow-intense" : intensity > 0.3 ? "animate-glow" : "";
  const zoomClass = intensity > 0.7 ? "animate-zoom-intense" : intensity > 0.3 ? "animate-zoom-pulse" : "";

  return (
    <div className="flex flex-col items-center mx-2 sm:mx-4">
      <div
        className={`relative overflow-hidden ${zoomClass}`}
        style={{ perspective: "1000px" }}
      >
        <div
          className={`text-4xl sm:text-6xl md:text-8xl font-bold tabular-nums ${glowClass} transition-all duration-300`}
          style={{
            transform: isFlipping ? "rotateX(90deg)" : "rotateX(0deg)",
            transition: "transform 0.3s ease",
            color: intensity > 0.5 
              ? `hsl(${45 + intensity * 15}, 100%, ${60 + intensity * 20}%)`
              : `hsl(200, 80%, ${70 + intensity * 20}%)`,
          }}
        >
          {displayValue.toString().padStart(2, "0")}
        </div>
      </div>
      <div
        className="text-xs sm:text-sm md:text-base mt-2 uppercase tracking-wider font-semibold"
        style={{
          color: intensity > 0.5 
            ? `hsl(${45 + intensity * 15}, 100%, ${50 + intensity * 30}%)`
            : "rgba(255, 255, 255, 0.7)",
        }}
      >
        {label}
      </div>
    </div>
  );
}

