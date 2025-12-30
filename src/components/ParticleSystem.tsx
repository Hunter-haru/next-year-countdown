import { useEffect, useRef } from "preact/hooks";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  type: "firework" | "star" | "snow";
  gravity?: number;
  fade?: number;
}

interface ParticleSystemProps {
  intensity?: number; // 0-1, controls particle density and speed
  types?: Array<"firework" | "star" | "snow">;
  celebrationMode?: boolean;
}

export function ParticleSystem({ 
  intensity = 0.3, 
  types = ["star", "snow"],
  celebrationMode = false
}: ParticleSystemProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
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

    const createParticle = (type?: "firework" | "star" | "snow", x?: number, y?: number): Particle => {
      const particleType = type || types[Math.floor(Math.random() * types.length)];
      
      if (particleType === "firework") {
        return {
          x: x ?? Math.random() * canvas.width,
          y: y ?? Math.random() * canvas.height * 0.5,
          vx: (Math.random() - 0.5) * 8,
          vy: (Math.random() - 0.5) * 8,
          life: 60,
          maxLife: 60,
          size: 2 + Math.random() * 3,
          color: `hsl(${Math.random() * 360}, 100%, 60%)`,
          type: "firework",
          gravity: 0.1,
          fade: 0.02,
        };
      } else if (particleType === "star") {
        return {
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: 0,
          vy: 0,
          life: Math.random() * 100,
          maxLife: 100,
          size: 1 + Math.random() * 2,
          color: `hsl(${200 + Math.random() * 60}, 80%, 80%)`,
          type: "star",
        };
      } else {
        // snow
        return {
          x: Math.random() * canvas.width,
          y: -10,
          vx: (Math.random() - 0.5) * 0.5,
          vy: 0.5 + Math.random() * 1.5,
          life: 1000,
          maxLife: 1000,
          size: 2 + Math.random() * 3,
          color: "rgba(255, 255, 255, 0.8)",
          type: "snow",
        };
      }
    };

    const createFireworkBurst = (x: number, y: number, count: number = 30) => {
      for (let i = 0; i < count; i++) {
        particlesRef.current.push(createParticle("firework", x, y));
      }
    };

    // Initialize particles
    const initialCount = Math.floor(20 + intensity * 30);
    for (let i = 0; i < initialCount; i++) {
      particlesRef.current.push(createParticle());
    }

    let lastFireworkTime = 0;
    let lastSpawnTime = 0;

    const animate = (timestamp: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Spawn new particles based on intensity
      if (timestamp - lastSpawnTime > 200 / (intensity + 0.1)) {
        const spawnCount = celebrationMode ? 3 : Math.floor(1 + intensity * 2);
        for (let i = 0; i < spawnCount; i++) {
          particlesRef.current.push(createParticle());
        }
        lastSpawnTime = timestamp;
      }

      // Spawn fireworks in celebration mode or based on intensity
      const shouldSpawnFirework = celebrationMode || 
        (types.includes("firework") && Math.random() < intensity * 0.1);
      
      if (shouldSpawnFirework && timestamp - lastFireworkTime > (celebrationMode ? 200 : 2000)) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height * 0.6;
        const count = celebrationMode ? 30 : 15;
        createFireworkBurst(x, y, count);
        lastFireworkTime = timestamp;
      }

      // Update and draw particles
      particlesRef.current = particlesRef.current.filter((particle) => {
        // Update position
        particle.x += particle.vx * (1 + intensity);
        particle.y += particle.vy * (1 + intensity);

        if (particle.gravity) {
          particle.vy += particle.gravity;
        }

        particle.life--;

        // Remove off-screen or dead particles
        if (particle.life <= 0 || 
            particle.x < -10 || particle.x > canvas.width + 10 ||
            particle.y < -10 || particle.y > canvas.height + 10) {
          return false;
        }

        // Draw particle
        const alpha = particle.fade 
          ? Math.max(0, particle.life / particle.maxLife)
          : Math.sin((particle.life / particle.maxLife) * Math.PI);

        ctx.save();

        if (particle.type === "star") {
          // Twinkling stars
          const twinkle = Math.sin(timestamp * 0.01 + particle.x) * 0.5 + 0.5;
          ctx.globalAlpha = alpha * twinkle * (0.5 + intensity * 0.5);
          ctx.fillStyle = particle.color;
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          ctx.fill();
        } else if (particle.type === "firework") {
          // Firework particles with trail
          ctx.globalAlpha = alpha;
          ctx.fillStyle = particle.color;
          ctx.shadowBlur = 10;
          ctx.shadowColor = particle.color;
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          ctx.fill();
        } else if (particle.type === "snow") {
          // Snowflakes
          ctx.globalAlpha = alpha * 0.8;
          ctx.fillStyle = particle.color;
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
        return true;
      });

      animationIdRef.current = requestAnimationFrame(animate);
    };

    animationIdRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", resize);
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, [intensity, types, celebrationMode]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none"
      style={{ zIndex: 1 }}
    />
  );
}

