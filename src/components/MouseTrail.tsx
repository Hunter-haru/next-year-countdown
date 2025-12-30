import { useEffect, useRef } from "preact/hooks";

interface TrailParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  size: number;
  color: string;
}

interface MouseTrailProps {
  intensity?: number; // 0-1, controls trail strength and particle count
}

export function MouseTrail({ intensity = 0.3 }: MouseTrailProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<TrailParticle[]>([]);
  const mouseRef = useRef({ x: 0, y: 0, prevX: 0, prevY: 0 });
  const animationIdRef = useRef<number>();

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

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.prevX = mouseRef.current.x;
      mouseRef.current.prevY = mouseRef.current.y;
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;

      // Create trail particles based on intensity
      const particleCount = Math.floor(1 + intensity * 3);
      const speed = Math.sqrt(
        Math.pow(mouseRef.current.x - mouseRef.current.prevX, 2) +
        Math.pow(mouseRef.current.y - mouseRef.current.prevY, 2)
      );

      if (speed > 1) {
        for (let i = 0; i < particleCount; i++) {
          particlesRef.current.push({
            x: mouseRef.current.x + (Math.random() - 0.5) * 10,
            y: mouseRef.current.y + (Math.random() - 0.5) * 10,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            life: 30 + intensity * 30,
            size: 2 + intensity * 3 + Math.random() * 2,
            color: `hsl(${180 + intensity * 180}, 80%, ${60 + intensity * 20}%)`,
          });
        }
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        mouseRef.current.prevX = mouseRef.current.x;
        mouseRef.current.prevY = mouseRef.current.y;
        mouseRef.current.x = touch.clientX;
        mouseRef.current.y = touch.clientY;

        const particleCount = Math.floor(1 + intensity * 3);
        for (let i = 0; i < particleCount; i++) {
          particlesRef.current.push({
            x: mouseRef.current.x + (Math.random() - 0.5) * 10,
            y: mouseRef.current.y + (Math.random() - 0.5) * 10,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            life: 30 + intensity * 30,
            size: 2 + intensity * 3 + Math.random() * 2,
            color: `hsl(${180 + intensity * 180}, 80%, ${60 + intensity * 20}%)`,
          });
        }
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleTouchMove, { passive: true });

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles
      particlesRef.current = particlesRef.current.filter((particle) => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.life--;

        if (particle.life <= 0) {
          return false;
        }

        const alpha = particle.life / (30 + intensity * 30);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = particle.color;
        ctx.shadowBlur = 10 + intensity * 10;
        ctx.shadowColor = particle.color;

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();

        return true;
      });

      // Limit particle count for performance
      const maxParticles = 200 + intensity * 200;
      if (particlesRef.current.length > maxParticles) {
        particlesRef.current = particlesRef.current.slice(-maxParticles);
      }

      animationIdRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, [intensity]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none"
      style={{ zIndex: 2 }}
    />
  );
}

