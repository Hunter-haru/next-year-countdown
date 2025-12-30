import { useEffect, useRef } from "preact/hooks";

interface AnimatedBackgroundProps {
  intensity?: number; // 0-1, controls brightness and animation speed
}

export function AnimatedBackground({ intensity = 0.3 }: AnimatedBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    let animationId: number;
    let time = 0;

    const animate = () => {
      time += 0.005 * (1 + intensity);

      // Create dynamic gradient
      const gradient = ctx.createLinearGradient(
        canvas.width * Math.sin(time * 0.5),
        0,
        canvas.width * Math.cos(time * 0.3),
        canvas.height
      );

      // Base colors that shift with intensity
      const hue1 = (200 + intensity * 60 + time * 10) % 360;
      const hue2 = (280 + intensity * 60 + time * 15) % 360;
      const hue3 = (320 + intensity * 60 + time * 8) % 360;

      const brightness = 20 + intensity * 40;
      const saturation = 60 + intensity * 30;

      gradient.addColorStop(0, `hsl(${hue1}, ${saturation}%, ${brightness}%)`);
      gradient.addColorStop(0.5, `hsl(${hue2}, ${saturation}%, ${brightness * 0.8}%)`);
      gradient.addColorStop(1, `hsl(${hue3}, ${saturation}%, ${brightness * 0.6}%)`);

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Add animated circles for depth
      const circleCount = Math.floor(3 + intensity * 5);
      for (let i = 0; i < circleCount; i++) {
        const x = canvas.width * (0.5 + 0.4 * Math.sin(time * (0.5 + i * 0.1)));
        const y = canvas.height * (0.5 + 0.4 * Math.cos(time * (0.3 + i * 0.15)));
        const radius = 50 + intensity * 100 + 30 * Math.sin(time * 2 + i);
        
        const circleGradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        const alpha = 0.1 + intensity * 0.2;
        circleGradient.addColorStop(0, `hsla(${(hue1 + i * 30) % 360}, 80%, 70%, ${alpha})`);
        circleGradient.addColorStop(1, "rgba(0, 0, 0, 0)");
        
        ctx.fillStyle = circleGradient;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationId);
    };
  }, [intensity]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full -z-10"
      style={{ background: "#0a0a1a" }}
    />
  );
}

