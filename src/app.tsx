import { useState, useEffect, useRef } from "preact/hooks";
import { AnimatedBackground } from "./components/AnimatedBackground";
import { AnimatedNumber } from "./components/AnimatedNumber";
import { ParticleSystem } from "./components/ParticleSystem";
import { MouseTrail } from "./components/MouseTrail";
import { ClickEffect } from "./components/ClickEffect";

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalMs: number;
}

export function App() {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    totalMs: 0,
  });
  const [intensity, setIntensity] = useState(0.3);
  const [isNewYear, setIsNewYear] = useState(false);
  const [showFlash, setShowFlash] = useState(false);
  const [lastServerTime, setLastServerTime] = useState<Date | null>(null);
  const lastSecondRef = useRef(-1);
  const celebrationTriggeredRef = useRef(false);

  const fetchServerTime = async () => {
    try {
      const response = await fetch(window.location.href, { method: "HEAD" });
      const dateHeader = response.headers.get("Date") || new Date().toString();
      return new Date(dateHeader);
    } catch (error) {
      console.error("Failed to fetch server time:", error);
      return null;
    }
  };

  const validateTime = async (currentServerTime: Date) => {
    if (!lastServerTime) return true;

    const timeDiff = Math.abs(
      currentServerTime.getTime() - lastServerTime.getTime()
    );
    const expectedDiff = 3600000; // 1 hour in milliseconds
    const tolerance = 5000; // 5 seconds tolerance

    return Math.abs(timeDiff - expectedDiff) <= tolerance;
  };

  const calculateIntensity = (totalMs: number) => {
    // Calculate intensity based on time remaining
    const oneHour = 3600000;
    const tenMinutes = 600000;
    const oneMinute = 60000;
    const tenSeconds = 10000;

    if (totalMs <= tenSeconds) {
      return 1.0; // Maximum intensity
    } else if (totalMs <= oneMinute) {
      return 0.8;
    } else if (totalMs <= tenMinutes) {
      return 0.6;
    } else if (totalMs <= oneHour) {
      return 0.4;
    } else {
      return 0.3; // Base intensity
    }
  };

  useEffect(() => {
    const startCountdown = async (serverDate: Date) => {
      const currentYear = serverDate.getFullYear();
      const nextYear = currentYear + 1;
      const targetDate = new Date(`January 1, ${nextYear} 00:00:00`);

      const updateCountdown = () => {
        const now = new Date();
        const timeDiff = targetDate.getTime() - now.getTime();

        if (timeDiff <= 0) {
          // New Year reached!
          if (!celebrationTriggeredRef.current) {
            setIsNewYear(true);
            celebrationTriggeredRef.current = true;
            
            // Flash effect
            setShowFlash(true);
            setTimeout(() => setShowFlash(false), 200);
            setTimeout(() => setShowFlash(true), 400);
            setTimeout(() => setShowFlash(false), 600);
          }
          
          setTimeRemaining({
            days: 0,
            hours: 0,
            minutes: 0,
            seconds: 0,
            totalMs: 0,
          });
          setIntensity(1.0);
          return;
        }

        const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

        setTimeRemaining({
          days,
          hours,
          minutes,
          seconds,
          totalMs: timeDiff,
        });

        // Update intensity based on time remaining
        const newIntensity = calculateIntensity(timeDiff);
        setIntensity(newIntensity);

        // Update last second
        lastSecondRef.current = seconds;
      };

      const intervalId = setInterval(updateCountdown, 1000); // Update every second
      updateCountdown();

      // Set up hourly server time validation
      const validateInterval = setInterval(async () => {
        const newServerTime = await fetchServerTime();
        if (!newServerTime) return;

        const isValid = await validateTime(newServerTime);
        if (!isValid) {
          console.error("Server time validation failed - restarting countdown");
          clearInterval(intervalId);
          clearInterval(validateInterval);
          setLastServerTime(newServerTime);
          startCountdown(newServerTime);
        } else {
          setLastServerTime(newServerTime);
        }
      }, 3600000); // Check every hour

      return () => {
        clearInterval(intervalId);
        clearInterval(validateInterval);
      };
    };

    const initializeCountdown = async () => {
      const serverTime = await fetchServerTime();
      if (serverTime) {
        setLastServerTime(serverTime);
        startCountdown(serverTime);
      }
    };

    initializeCountdown();
  }, []); // Only run once on mount

  // Determine particle types based on intensity
  const particleTypes: Array<"firework" | "star" | "snow"> = intensity > 0.6 
    ? ["firework", "star"]
    : ["star", "snow"];

  return (
    <div className="h-screen w-screen flex items-center justify-center overflow-hidden relative">
      {/* Background effects */}
      <AnimatedBackground intensity={intensity} />
      
      {/* Particle effects */}
      <ParticleSystem 
        intensity={intensity} 
        types={particleTypes}
        celebrationMode={isNewYear}
      />
      
      {/* Interactive effects */}
      <MouseTrail intensity={intensity} />
      <ClickEffect intensity={intensity} />

      {/* Flash effect for new year */}
      {showFlash && (
        <div 
          className="fixed inset-0 bg-white pointer-events-none animate-flash"
          style={{ zIndex: 100 }}
        />
      )}

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center p-4">
        <h1 
          className="text-3xl sm:text-4xl md:text-6xl font-bold mb-8 text-center"
          style={{
            color: intensity > 0.5 
              ? `hsl(45, 100%, ${70 + intensity * 20}%)`
              : "rgba(255, 255, 255, 0.9)",
            textShadow: intensity > 0.5
              ? "0 0 20px rgba(255, 215, 0, 0.8)"
              : "0 0 10px rgba(255, 255, 255, 0.5)",
          }}
        >
          {isNewYear ? "🎉 Happy New Year! 🎉" : "Countdown to Next Year"}
        </h1>

        {!isNewYear && (
          <div className="flex flex-wrap justify-center items-center gap-4">
            <AnimatedNumber 
              value={timeRemaining.days} 
              label="Days" 
              intensity={intensity}
            />
            <span 
              className="text-4xl sm:text-6xl font-bold"
              style={{ 
                color: intensity > 0.5 ? `hsl(45, 100%, 70%)` : "rgba(255, 255, 255, 0.7)"
              }}
            >
              :
            </span>
            <AnimatedNumber 
              value={timeRemaining.hours} 
              label="Hours" 
              intensity={intensity}
            />
            <span 
              className="text-4xl sm:text-6xl font-bold"
              style={{ 
                color: intensity > 0.5 ? `hsl(45, 100%, 70%)` : "rgba(255, 255, 255, 0.7)"
              }}
            >
              :
            </span>
            <AnimatedNumber 
              value={timeRemaining.minutes} 
              label="Minutes" 
              intensity={intensity}
            />
            <span 
              className="text-4xl sm:text-6xl font-bold"
              style={{ 
                color: intensity > 0.5 ? `hsl(45, 100%, 70%)` : "rgba(255, 255, 255, 0.7)"
              }}
            >
              :
            </span>
            <AnimatedNumber 
              value={timeRemaining.seconds} 
              label="Seconds" 
              intensity={intensity}
            />
          </div>
        )}
      </div>
    </div>
  );
}
