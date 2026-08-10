// ─── SVG + Canvas animated arc reactor ────────────────────────────────────

import { useEffect, useRef } from 'react';

interface ArcReactorProps {
  size?: number;
  isThinking?: boolean;
  isBooting?: boolean;
}

export default function ArcReactor({ size = 180, isThinking = false, isBooting = false }: ArcReactorProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const spokesRef = useRef<SVGGElement>(null);
  const coilsRef = useRef<SVGGElement>(null);
  const innerRef = useRef<SVGGElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const particles: Array<{ x: number; y: number; vx: number; vy: number; life: number; max: number; size: number }> = [];
    let raf = 0;
    let running = true;

    const spawn = () => {
      const angle = Math.random() * Math.PI * 2;
      const dist = (size / 2) * (0.25 + Math.random() * 0.6);
      particles.push({
        x: size / 2 + Math.cos(angle) * dist,
        y: size / 2 + Math.sin(angle) * dist,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        life: 0,
        max: 40 + Math.random() * 60,
        size: 0.6 + Math.random() * 1.4,
      });
    };

    const frame = (t: number) => {
      if (!running) return;
      ctx.clearRect(0, 0, size, size);
      const speed = isThinking ? 1.8 : isBooting ? 0.8 : 1;
      // particle core
      const glow = isThinking ? 55 : isBooting ? 22 : 30;
      const grad = ctx.createRadialGradient(size / 2, size / 2, 2, size / 2, size / 2, size / 2);
      grad.addColorStop(0, `rgba(125, 243, 255, ${0.5 + glow / 100})`);
      grad.addColorStop(0.4, `rgba(0, 229, 255, ${0.25 + glow / 200})`);
      grad.addColorStop(1, 'rgba(0, 229, 255, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, size, size);

      if (particles.length < (isThinking ? 90 : 45)) spawn();
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life += speed;
        if (p.life > p.max) { particles.splice(i, 1); continue; }
        p.x += p.vx * speed;
        p.y += p.vy * speed;
        const alpha = Math.sin((p.life / p.max) * Math.PI) * 0.9;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(160, 245, 255, ${alpha})`;
        ctx.fill();
      }
      raf = requestAnimationFrame(frame);
    };

    // rotating layers
    const animateSvg = (t: number) => {
      const speed = isThinking ? 3.2 : isBooting ? 1 : 1.6;
      const rot1 = (t / 1000) * speed * 60;
      const rot2 = -rot1 * 0.62;
      const rot3 = rot1 * 0.35 + 22;
      if (spokesRef.current) spokesRef.current.style.transform = `rotate(${rot1}deg)`;
      if (coilsRef.current) coilsRef.current.style.transform = `rotate(${rot2}deg)`;
      if (innerRef.current) innerRef.current.style.transform = `rotate(${rot3}deg)`;
      if (wrapRef.current) {
        wrapRef.current.style.filter = isThinking
          ? 'drop-shadow(0 0 18px rgba(0,229,255,0.75))'
          : isBooting
            ? 'drop-shadow(0 0 8px rgba(0,229,255,0.35))'
            : 'drop-shadow(0 0 10px rgba(0,229,255,0.45))';
      }
      raf = requestAnimationFrame(animateSvg);
    };

    const tick = (t: number) => {
      frame(t);
      animateSvg(t);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
    };
  }, [size, isThinking, isBooting]);

  const stroke = isThinking ? '#9df6ff' : '#00e5ff';
  const glow = isThinking ? 1 : 0.6;

  return (
    <div ref={wrapRef} className="relative" style={{ width: size, height: size, transition: 'filter .4s' }}>
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        className="absolute left-0 top-0"
        style={{ width: size, height: size, pointerEvents: 'none' }}
      />
      <svg
        viewBox="0 0 200 200"
        width={size}
        height={size}
        className="absolute left-0 top-0"
        style={{ overflow: 'visible' }}
      >
        <defs>
          <radialGradient id="arc-core" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="30%" stopColor="#7df3ff" stopOpacity="0.9" />
            <stop offset="70%" stopColor="#0aa3b8" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#06586b" stopOpacity="0.2" />
          </radialGradient>
          <linearGradient id="arc-ring" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00e5ff" />
            <stop offset="50%" stopColor="#3d7bff" />
            <stop offset="100%" stopColor="#00e5ff" />
          </linearGradient>
        </defs>

        {/* housing ring */}
        <circle cx="100" cy="100" r="96" fill="none" stroke="#1b2a44" strokeWidth="10" opacity="0.9" />
        <circle cx="100" cy="100" r="96" fill="none" stroke="url(#arc-ring)" strokeWidth="4" opacity={glow} />
        <circle cx="100" cy="100" r="90" fill="none" stroke={stroke} strokeWidth="1.2" strokeDasharray="3 5" opacity="0.7" />

        {/* rotating segmented spokes */}
        <g ref={spokesRef} style={{ transformOrigin: '100px 100px' }}>
          {Array.from({ length: 12 }).map((_, i) => (
            <rect
              key={i}
              x={i % 2 === 0 ? 8 : 12}
              y="98"
              width={i % 2 === 0 ? 20 : 14}
              height="4"
              rx="2"
              fill={stroke}
              opacity={i % 2 === 0 ? 0.85 : 0.45}
              transform={`rotate(${i * 30} 100 100)`}
            />
          ))}
        </g>

        {/* counter-rotating coil arcs */}
        <g ref={coilsRef} style={{ transformOrigin: '100px 100px' }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <path
              key={i}
              d="M 18 100 A 82 82 0 0 1 182 100"
              fill="none"
              stroke="#3d7bff"
              strokeWidth="5"
              strokeLinecap="round"
              opacity="0.5"
              transform={`rotate(${i * 90} 100 100)`}
            />
          ))}
        </g>

        {/* inner segments */}
        <g ref={innerRef} style={{ transformOrigin: '100px 100px' }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <path
              key={i}
              d="M 100 30 L 116 52 L 84 52 Z"
              fill="rgba(0,229,255,0.16)"
              stroke={stroke}
              strokeWidth="1.4"
              transform={`rotate(${i * 60} 100 100)`}
            />
          ))}
        </g>

        {/* triangle structure */}
        <path d="M 100 28 L 158 141 L 42 141 Z" fill="none" stroke={stroke} strokeWidth="1.6" opacity="0.55" />
        <path d="M 100 55 L 136 124 L 64 124 Z" fill="none" stroke={stroke} strokeWidth="1.2" opacity="0.35" />

        {/* electromagnet coils */}
        {Array.from({ length: 3 }).map((_, i) => {
          const angle = (i * 120 - 90) * (Math.PI / 180);
          const x = 100 + Math.cos(angle) * 68;
          const y = 100 + Math.sin(angle) * 68;
          return (
            <g key={i} transform={`translate(${x} ${y})`}>
              <rect x="-7" y="-13" width="14" height="26" rx="4" fill="#0b1220" stroke={stroke} strokeWidth="1.6" />
              <rect x="-7" y="-13" width="14" height="8" rx="4" fill={stroke} opacity="0.5" />
            </g>
          );
        })}

        {/* core */}
        <circle cx="100" cy="100" r="38" fill="url(#arc-core)" />
        <circle cx="100" cy="100" r="38" fill="none" stroke="#ffffff" strokeWidth="1.5" opacity="0.5" />
        <circle cx="100" cy="100" r="30" fill="none" stroke={stroke} strokeWidth="1" opacity="0.7" />
        {/* pulsing ring */}
        <circle cx="100" cy="100" r="30" fill="none" stroke={stroke} strokeWidth="2" className="anim-ping-ring" style={{ transformOrigin: 'center' }} />
        {/* core rings */}
        <circle cx="100" cy="100" r="22" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1" />
        <circle cx="100" cy="100" r="14" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1" />
      </svg>
    </div>
  );
}
