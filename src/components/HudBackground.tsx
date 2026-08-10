// ─── Full-screen HUD canvas background ────────────────────────────────────

import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
}

export default function HudBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    let running = true;
    let width = 0;
    let height = 0;
    let particles: Particle[] = [];
    const binaries: Array<{ x: number; y: number; speed: number; chars: string[] }> = [];
    const hexSize = 26;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const init = () => {
      resize();
      const count = 80;
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: 0.8 + Math.random() * 1.8,
      }));
      binaries.length = 0;
      for (let i = 0; i < 8; i++) {
        binaries.push({
          x: Math.random() * width,
          y: Math.random() * height,
          speed: 0.4 + Math.random() * 1.1,
          chars: Array.from({ length: 8 + Math.floor(Math.random() * 14) }, () => (Math.random() > 0.5 ? '1' : '0')),
        });
      }
    };

    const drawHexGrid = () => {
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.045)';
      ctx.lineWidth = 1;
      const rowH = hexSize * Math.sqrt(3) / 2;
      for (let row = -1; row * rowH < height + hexSize; row++) {
        for (let col = -1; col * (hexSize * 1.5) < width + hexSize; col++) {
          const x = col * (hexSize * 1.5) + (row % 2 === 0 ? 0 : hexSize * 0.75);
          const y = row * rowH;
          ctx.beginPath();
          for (let i = 0; i < 6; i++) {
            const a = (Math.PI / 3) * i + Math.PI / 6;
            const px = x + Math.cos(a) * (hexSize * 0.62);
            const py = y + Math.sin(a) * (hexSize * 0.62);
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.stroke();
        }
      }
    };

    const drawArcs = (t: number) => {
      const cx = width / 2;
      const cy = height / 2;
      const r1 = Math.min(width, height) * 0.36;
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 4; i++) {
        const start = (t / 1000) * (12 + i * 9) + (i * Math.PI) / 2;
        ctx.beginPath();
        ctx.arc(cx, cy, r1 + i * 22, start, start + Math.PI * 0.9);
        ctx.strokeStyle = `rgba(0, 229, 255, ${0.28 - i * 0.05})`;
        ctx.stroke();
      }
      // dotted circles
      ctx.setLineDash([2, 8]);
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.arc(cx, cy, r1 + i * 30, (t / 1000) * 4 * (i % 2 === 0 ? 1 : -1), (t / 1000) * 4 * (i % 2 === 0 ? 1 : -1) + Math.PI * 1.4);
        ctx.strokeStyle = 'rgba(61, 123, 255, 0.18)';
        ctx.stroke();
      }
      ctx.setLineDash([]);
    };

    const drawScanBeam = (t: number) => {
      const y = ((t / 1000) * 40) % (height + 200) - 100;
      const grad = ctx.createLinearGradient(0, y - 40, 0, y + 40);
      grad.addColorStop(0, 'rgba(0, 229, 255, 0)');
      grad.addColorStop(0.5, 'rgba(0, 229, 255, 0.05)');
      grad.addColorStop(1, 'rgba(0, 229, 255, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, y - 40, width, 80);
      ctx.fillStyle = 'rgba(0, 229, 255, 0.12)';
      ctx.fillRect(0, y, width, 1);
    };

    const drawCorners = () => {
      const len = 26;
      const off = 14;
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.4)';
      ctx.lineWidth = 2;
      const corners: Array<[number, number, number, number]> = [
        [off, off, 1, 1], [width - off, off, -1, 1],
        [off, height - off, 1, -1], [width - off, height - off, -1, -1],
      ];
      for (const [x, y, dx, dy] of corners) {
        ctx.beginPath();
        ctx.moveTo(x + dx * len, y);
        ctx.lineTo(x, y);
        ctx.lineTo(x, y + dy * len);
        ctx.stroke();
      }
    };

    const drawBinaries = () => {
      ctx.font = '10px monospace';
      for (const b of binaries) {
        b.y += b.speed;
        if (b.y > height + 60) {
          b.y = -60;
          b.x = Math.random() * width;
        }
        for (let i = 0; i < b.chars.length; i++) {
          const y = b.y - i * 13;
          if (y < 0 || y > height) continue;
          ctx.fillStyle = i === 0 ? 'rgba(34, 224, 122, 0.65)' : 'rgba(0, 229, 255, 0.18)';
          ctx.fillText(b.chars[i], b.x, y);
        }
      }
    };

    const drawParticles = (t: number) => {
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 229, 255, 0.5)';
        ctx.fill();
      }
      // connections
      ctx.lineWidth = 0.5;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.hypot(dx, dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(0, 229, 255, ${0.16 * (1 - dist / 120)})`;
            ctx.stroke();
          }
        }
      }
      void t;
    };

    const drawVignette = () => {
      const grad = ctx.createRadialGradient(width / 2, height / 2, Math.min(width, height) * 0.25, width / 2, height / 2, Math.max(width, height) * 0.75);
      grad.addColorStop(0, 'rgba(6, 10, 16, 0)');
      grad.addColorStop(1, 'rgba(6, 10, 16, 0.6)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    };

    const frame = (t: number) => {
      if (!running) return;
      ctx.clearRect(0, 0, width, height);
      drawHexGrid();
      drawArcs(t);
      drawParticles(t);
      drawScanBeam(t);
      drawBinaries();
      drawCorners();
      drawVignette();
      raf = requestAnimationFrame(frame);
    };

    init();
    const onResize = () => {
      resize();
      init();
    };
    window.addEventListener('resize', onResize);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(raf);
      } else {
        running = true;
        raf = requestAnimationFrame(frame);
      }
    });
    raf = requestAnimationFrame(frame);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed left-0 top-0"
      style={{ width: '100vw', height: '100vh', pointerEvents: 'none', zIndex: 0, opacity: 0.85 }}
      aria-hidden
    />
  );
}
