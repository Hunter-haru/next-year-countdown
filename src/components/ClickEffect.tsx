import { useEffect, useRef } from "preact/hooks";

interface ClickParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  angle: number;
}

interface ClickEffectProps {
  intensity?: number; // 0-1, controls effect strength
}

export function ClickEffect({ intensity = 0.3 }: ClickEffectProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<ClickParticle[]>([]);
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

    const createClickExplosion = (x: number, y: number) => {
      const particleCount = Math.floor(15 + intensity * 20);
      
      for (let i = 0; i < particleCount; i++) {
        const angle = (Math.PI * 2 * i) / particleCount;
        const speed = 3 + Math.random() * 5 + intensity * 5;
        const maxLife = 40 + intensity * 40;
        
        particlesRef.current.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: maxLife,
          maxLife,
          size: 2 + Math.random() * 3 + intensity * 2,
          color: `hsl(${Math.random() * 60 + (intensity * 60)}, 100%, ${60 + intensity * 20}%)`,
          angle,
        });
      }

      // Add some random particles for more chaotic effect
      const randomCount = Math.floor(5 + intensity * 10);
      for (let i = 0; i < randomCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 2 + Math.random() * 8;
        const maxLife = 30 + Math.random() * 40;
        
        particlesRef.current.push({
          x: x + (Math.random() - 0.5) * 20,
          y: y + (Math.random() - 0.5) * 20,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: maxLife,
          maxLife,
          size: 1 + Math.random() * 4,
          color: `hsl(${Math.random() * 360}, 100%, 70%)`,
          angle,
        });
      }
    };

    const handleClick = (e: MouseEvent) => {
      createClickExplosion(e.clientX, e.clientY);
    };

    const handleTouchStart = (e: TouchEvent) => {
      for (let i = 0; i < e.touches.length; i++) {
        const touch = e.touches[i];
        createClickExplosion(touch.clientX, touch.clientY);
      }
    };

    canvas.addEventListener("click", handleClick);
    canvas.addEventListener("touchstart", handleTouchStart, { passive: true });

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles
      particlesRef.current = particlesRef.current.filter((particle) => {
        // Apply gravity
        particle.vy += 0.2;
        
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.life--;

        if (particle.life <= 0) {
          return false;
        }

        const alpha = particle.life / particle.maxLife;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = particle.color;
        ctx.shadowBlur = 15 + intensity * 15;
        ctx.shadowColor = particle.color;

        // Draw as a sparkle (small diamond shape)
        ctx.beginPath();
        const halfSize = particle.size / 2;
        ctx.moveTo(particle.x, particle.y - particle.size);
        ctx.lineTo(particle.x + halfSize, particle.y);
        ctx.lineTo(particle.x, particle.y + particle.size);
        ctx.lineTo(particle.x - halfSize, particle.y);
        ctx.closePath();
        ctx.fill();

        // Add a glowing circle at the center
        ctx.globalAlpha = alpha * 0.5;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * 0.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
        return true;
      });

      // Limit particle count for performance
      const maxParticles = 300 + intensity * 300;
      if (particlesRef.current.length > maxParticles) {
        particlesRef.current = particlesRef.current.slice(-maxParticles);
      }

      animationIdRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("click", handleClick);
      canvas.removeEventListener("touchstart", handleTouchStart);
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, [intensity]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full"
      style={{ zIndex: 3, cursor: "pointer" }}
    />
  );
}

