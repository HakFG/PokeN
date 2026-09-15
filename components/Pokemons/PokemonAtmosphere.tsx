'use client';

import { useEffect, useRef } from 'react';

/**
 * Atmosfera de fundo: "campo de sinal vital" povoado.
 * Camadas, de trás pra frente:
 *  1. Nuvens de leitura (blobs radiais lentos)
 *  2. Pokébolas-silhueta flutuando com parallax (3 profundidades)
 *  3. Poeira/partículas cintilantes densas
 *  4. Pings de detecção (varredura pontual)
 *  5. Rastros de energia raros (o "momento de impacto")
 * Tudo em canvas único por performance; DOM fica só com o wrapper.
 */

interface Blob {
  x: number; y: number; r: number; vx: number; vy: number;
  rgb: [number, number, number]; phase: number;
}

interface PokeBall {
  x: number; y: number; size: number; depth: number; // 0 = longe, 1 = perto
  vx: number; vy: number; rotation: number; rotationSpeed: number;
  opacity: number;
}

interface Mote {
  x: number; y: number; r: number; baseAlpha: number; twinkleSpeed: number; phase: number;
  vy: number;
}

interface Ping {
  x: number; y: number; born: number; life: number; hue: string;
}

interface EnergyTrail {
  x1: number; y1: number; x2: number; y2: number; born: number; life: number; hue: string;
}

const BLOB_PALETTE: [number, number, number][] = [
  [34, 211, 238],
  [139, 92, 246],
  [251, 191, 36],
];

function drawPokeball(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number, rotation: number, opacity: number,
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  const r = size / 2;
  ctx.strokeStyle = `rgba(226,232,255,${opacity})`;
  ctx.lineWidth = Math.max(1, size * 0.045);

  // contorno externo
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.stroke();

  // linha do meio (só metade superior/inferior pra sugerir a divisão sem preencher)
  ctx.beginPath();
  ctx.moveTo(-r, 0);
  ctx.lineTo(-r * 0.32, 0);
  ctx.moveTo(r * 0.32, 0);
  ctx.lineTo(r, 0);
  ctx.stroke();

  // botão central
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.32, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.14, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(226,232,255,${opacity * 0.5})`;
  ctx.fill();

  ctx.restore();
}

export default function PokemonAtmosphere() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    // --- 1. nuvens de leitura ---
    const blobs: Blob[] = Array.from({ length: 7 }, (_, i) => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: 160 + Math.random() * 180,
      vx: (Math.random() - 0.5) * 6,
      vy: (Math.random() - 0.5) * 6,
      rgb: BLOB_PALETTE[i % BLOB_PALETTE.length],
      phase: Math.random() * Math.PI * 2,
    }));

    // --- 2. pokébolas em 3 planos de profundidade ---
    const pokeballCount = 16;
    const pokeballs: PokeBall[] = Array.from({ length: pokeballCount }, () => {
      const depth = [0.25, 0.55, 1][Math.floor(Math.random() * 3)];
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        size: (18 + Math.random() * 26) * (0.6 + depth * 0.6),
        depth,
        vx: (Math.random() - 0.5) * 2.2 * depth,
        vy: (-2 - Math.random() * 4) * depth, // deriva pra cima, feito bolha subindo devagar
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.15 * depth,
        opacity: 0.05 + depth * 0.13,
      };
    });

    // --- 3. poeira/partículas cintilantes ---
    const moteCount = 90;
    const motes: Mote[] = Array.from({ length: moteCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: 0.6 + Math.random() * 1.6,
      baseAlpha: 0.15 + Math.random() * 0.45,
      twinkleSpeed: 0.5 + Math.random() * 1.6,
      phase: Math.random() * Math.PI * 2,
      vy: -(2 + Math.random() * 5),
    }));

    // --- 4. pings ---
    const pings: Ping[] = [];
    let nextPingAt = performance.now() + 1400;
    const spawnPing = (now: number) => {
      const margin = 0.16;
      pings.push({
        x: (margin + Math.random() * (1 - margin * 2)) * width,
        y: (margin + Math.random() * (1 - margin * 2)) * height,
        born: now,
        life: 3000 + Math.random() * 1200,
        hue: Math.random() > 0.3 ? '34,211,238' : '251,191,36',
      });
      nextPingAt = now + 1800 + Math.random() * 2400;
    };

    // --- 5. rastros de energia (raros) ---
    const trails: EnergyTrail[] = [];
    let nextTrailAt = performance.now() + 4000;
    const spawnTrail = (now: number) => {
      const fromLeft = Math.random() > 0.5;
      const y1 = Math.random() * height * 0.6;
      trails.push({
        x1: fromLeft ? -60 : width + 60,
        y1,
        x2: fromLeft ? width * (0.35 + Math.random() * 0.4) : width * (0.25 + Math.random() * 0.4),
        y2: y1 + (Math.random() - 0.3) * 160,
        born: now,
        life: 900 + Math.random() * 400,
        hue: Math.random() > 0.5 ? '34,211,238' : '251,191,36',
      });
      nextTrailAt = now + 6000 + Math.random() * 8000;
    };

    let raf = 0;
    const start = performance.now();

    const drawBlobs = (t: number, animate: boolean) => {
      for (const b of blobs) {
        if (animate) {
          b.x += b.vx * 0.016;
          b.y += b.vy * 0.016;
          if (b.x < -b.r * 0.4 || b.x > width + b.r * 0.4) b.vx *= -1;
          if (b.y < -b.r * 0.4 || b.y > height + b.r * 0.4) b.vy *= -1;
        }
        const breathe = animate ? 1 + Math.sin(t * 0.35 + b.phase) * 0.08 : 1;
        const grad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r * breathe);
        grad.addColorStop(0, `rgba(${b.rgb[0]},${b.rgb[1]},${b.rgb[2]},0.11)`);
        grad.addColorStop(0.6, `rgba(${b.rgb[0]},${b.rgb[1]},${b.rgb[2]},0.04)`);
        grad.addColorStop(1, `rgba(${b.rgb[0]},${b.rgb[1]},${b.rgb[2]},0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r * breathe, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const drawPokeballs = (animate: boolean) => {
      // longe -> perto, pra profundidade ficar consistente
      const ordered = [...pokeballs].sort((a, b) => a.depth - b.depth);
      for (const p of ordered) {
        if (animate) {
          p.x += p.vx * 0.05;
          p.y += p.vy * 0.05;
          p.rotation += p.rotationSpeed * 0.02;
          if (p.y < -p.size) { p.y = height + p.size; p.x = Math.random() * width; }
          if (p.x < -p.size) p.x = width + p.size;
          if (p.x > width + p.size) p.x = -p.size;
        }
        drawPokeball(ctx, p.x, p.y, p.size, p.rotation, p.opacity);
      }
    };

    const drawMotes = (t: number, animate: boolean) => {
      for (const m of motes) {
        if (animate) {
          m.y += m.vy * 0.016;
          if (m.y < -6) { m.y = height + 6; m.x = Math.random() * width; }
        }
        const twinkle = animate ? 0.5 + Math.sin(t * m.twinkleSpeed + m.phase) * 0.5 : 0.7;
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(226,232,255,${m.baseAlpha * twinkle})`;
        ctx.fill();
      }
    };

    const drawPings = (now: number) => {
      if (now >= nextPingAt && pings.length < 5) spawnPing(now);
      for (let i = pings.length - 1; i >= 0; i--) {
        const p = pings[i];
        const progress = (now - p.born) / p.life;
        if (progress >= 1) { pings.splice(i, 1); continue; }
        const radius = 6 + progress * 50;
        ctx.beginPath();
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${p.hue},${(1 - progress) * 0.55})`;
        ctx.lineWidth = 1.2;
        ctx.stroke();
        const dotAlpha = Math.max(0, 1 - progress * 2.2) * 0.9;
        if (dotAlpha > 0) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${p.hue},${dotAlpha})`;
          ctx.fill();
        }
      }
    };

    const drawTrails = (now: number) => {
      if (now >= nextTrailAt && trails.length < 1) spawnTrail(now);
      for (let i = trails.length - 1; i >= 0; i--) {
        const tr = trails[i];
        const progress = (now - tr.born) / tr.life;
        if (progress >= 1) { trails.splice(i, 1); continue; }
        const ease = 1 - Math.pow(1 - Math.min(progress * 1.4, 1), 3);
        const hx = tr.x1 + (tr.x2 - tr.x1) * ease;
        const hy = tr.y1 + (tr.y2 - tr.y1) * ease;
        const tailX = tr.x1 + (tr.x2 - tr.x1) * Math.max(0, ease - 0.22);
        const tailY = tr.y1 + (tr.y2 - tr.y1) * Math.max(0, ease - 0.22);
        const fade = progress > 0.75 ? 1 - (progress - 0.75) / 0.25 : 1;

        const grad = ctx.createLinearGradient(tailX, tailY, hx, hy);
        grad.addColorStop(0, `rgba(${tr.hue},0)`);
        grad.addColorStop(1, `rgba(${tr.hue},${0.7 * fade})`);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(hx, hy);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(hx, hy, 2.4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${tr.hue},${0.9 * fade})`;
        ctx.shadowColor = `rgba(${tr.hue},0.8)`;
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    };

    const renderFrame = (now: number, animate: boolean) => {
      const t = (now - start) / 1000;
      ctx.clearRect(0, 0, width, height);
      drawBlobs(t, animate);
      drawPokeballs(animate);
      drawMotes(t, animate);
      if (animate) {
        drawPings(now);
        drawTrails(now);
      }
    };

    if (reduceMotion) {
      renderFrame(performance.now(), false);
    } else {
      const loop = (now: number) => {
        renderFrame(now, true);
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    }

    return () => {
      window.removeEventListener('resize', resize);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#1D132D]" aria-hidden="true">
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(120% 80% at 50% 0%, rgba(29,19,45,0) 0%, rgba(29,19,45,0.55) 60%, rgba(13,8,20,0.9) 100%)',
        }}
      />
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#1D132D]/70" />
    </div>
  );
}