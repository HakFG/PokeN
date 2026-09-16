'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';

/**
 * JogosBackground — "Terminal Interdimensional de Transferência"
 *
 * Conceito autoral (não é nenhuma das 3 opções sugeridas, mas bebe um pouco
 * de cada uma): uma câmara de transferência de Pokémon estilo PC de Bill,
 * com feixes de dados subindo entre as cores do jogo, pokébolas holográficas
 * em wireframe flutuando como elementos de HUD, símbolos rúnicos elementais
 * (inspirados nos Unown / Mundo Distorcido) à deriva em profundidade, e um
 * easter egg raro: um brilho Shiny de 4 pontas que surge esporadicamente.
 *
 * 100% autocontido: Canvas API nativo (sem framer-motion no loop de anim,
 * usado apenas para detectar prefers-reduced-motion de forma reativa).
 */

const BG_BASE = '#1D132D';
const CYAN = '#22D3EE';
const AMBER = '#FBBF24';
const VIOLET = '#8B5CF6';
const RED = '#EF4444';

type DataBeam = {
  x: number;
  y: number;
  size: number;
  speed: number;
  swayAmp: number;
  swaySpeed: number;
  swayPhase: number;
  color: string;
  opacity: number;
};

type Pokeball = {
  xFrac: number;
  yFrac: number;
  radius: number;
  rotation: number;
  rotSpeed: number;
  bobPhase: number;
  bobAmp: number;
  color: string;
  alpha: number;
};

type Rune = {
  xFrac: number;
  yFrac: number;
  size: number;
  type: number;
  rotation: number;
  rotSpeed: number;
  driftPhase: number;
  driftAmp: number;
  color: string;
  alpha: number;
};

type Sparkle = {
  x: number;
  y: number;
  size: number;
  maxSize: number;
  life: number;
  maxLife: number;
  color: string;
};

function drawPokeballOutline(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  rotation: number,
  color: string,
  alpha: number,
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.1;
  ctx.shadowColor = color;
  ctx.shadowBlur = 8;

  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(-radius, 0);
  ctx.lineTo(radius, 0);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.28, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.12, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.globalAlpha = alpha * 0.8;
  ctx.fill();

  ctx.restore();
}

function drawRune(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  type: number,
  rotation: number,
  color: string,
  alpha: number,
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.shadowColor = color;
  ctx.shadowBlur = 6;
  ctx.beginPath();

  switch (type % 5) {
    case 0: {
      // Fogo — triângulo com chama interna
      ctx.moveTo(0, -size);
      ctx.lineTo(size * 0.87, size * 0.5);
      ctx.lineTo(-size * 0.87, size * 0.5);
      ctx.closePath();
      ctx.moveTo(0, -size * 0.35);
      ctx.quadraticCurveTo(size * 0.25, 0, 0, size * 0.35);
      ctx.quadraticCurveTo(-size * 0.25, 0, 0, -size * 0.35);
      break;
    }
    case 1: {
      // Água — ondas concêntricas
      ctx.moveTo(-size, 0);
      ctx.quadraticCurveTo(-size * 0.5, -size * 0.5, 0, 0);
      ctx.quadraticCurveTo(size * 0.5, size * 0.5, size, 0);
      ctx.moveTo(-size * 0.7, size * 0.4);
      ctx.quadraticCurveTo(-size * 0.2, -size * 0.1, size * 0.3, size * 0.4);
      break;
    }
    case 2: {
      // Elétrico — raio
      ctx.moveTo(size * 0.15, -size);
      ctx.lineTo(-size * 0.35, size * 0.1);
      ctx.lineTo(size * 0.05, size * 0.1);
      ctx.lineTo(-size * 0.15, size);
      ctx.lineTo(size * 0.45, -size * 0.15);
      ctx.lineTo(size * 0.05, -size * 0.15);
      ctx.closePath();
      break;
    }
    case 3: {
      // Psíquico — olho estilizado
      ctx.moveTo(-size, 0);
      ctx.quadraticCurveTo(0, -size * 0.7, size, 0);
      ctx.quadraticCurveTo(0, size * 0.7, -size, 0);
      ctx.moveTo(size * 0.25, 0);
      ctx.arc(0, 0, size * 0.25, 0, Math.PI * 2);
      break;
    }
    default: {
      // Dragão — espiral simples
      for (let i = 0; i < 40; i += 1) {
        const t = i / 40;
        const ang = t * Math.PI * 2.4;
        const r = t * size;
        const px = Math.cos(ang) * r;
        const py = Math.sin(ang) * r;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      break;
    }
  }

  ctx.stroke();
  ctx.restore();
}

function drawShinySparkle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  alpha: number,
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.globalAlpha = alpha;
  ctx.fillStyle = AMBER;
  ctx.shadowColor = AMBER;
  ctx.shadowBlur = size * 1.4;

  const drawSpike = (len: number, width: number) => {
    ctx.beginPath();
    ctx.moveTo(0, -len);
    ctx.quadraticCurveTo(width, 0, 0, len);
    ctx.quadraticCurveTo(-width, 0, 0, -len);
    ctx.closePath();
    ctx.fill();
  };

  drawSpike(size, size * 0.16);
  ctx.rotate(Math.PI / 2);
  drawSpike(size, size * 0.16);
  ctx.rotate(-Math.PI / 4);
  drawSpike(size * 0.55, size * 0.09);
  ctx.rotate(Math.PI / 2);
  drawSpike(size * 0.55, size * 0.09);

  ctx.restore();
}

export default function JogosBackground() {
  const reduceMotion = useReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | undefined>(undefined);

  const runeSeed = useMemo(
    () => Array.from({ length: 6 }, (_, i) => ({
      type: i,
      color: [CYAN, VIOLET, AMBER, CYAN, RED, VIOLET][i % 6],
    })),
    [],
  );

  useEffect(() => {
    if (reduceMotion) return undefined;

    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    let cssWidth = window.innerWidth;
    let cssHeight = window.innerHeight;

    const resize = () => {
      cssWidth = window.innerWidth;
      cssHeight = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = cssWidth * dpr;
      canvas.height = cssHeight * dpr;
      canvas.style.width = `${cssWidth}px`;
      canvas.style.height = `${cssHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const beamColors = [CYAN, AMBER, VIOLET];
    const beams: DataBeam[] = Array.from({ length: 34 }, () => ({
      x: Math.random() * cssWidth,
      y: Math.random() * cssHeight,
      size: 2 + Math.random() * 2.5,
      speed: 18 + Math.random() * 26,
      swayAmp: 10 + Math.random() * 20,
      swaySpeed: 0.4 + Math.random() * 0.6,
      swayPhase: Math.random() * Math.PI * 2,
      color: beamColors[Math.floor(Math.random() * beamColors.length)],
      opacity: 0.35 + Math.random() * 0.45,
    }));

    const pokeballs: Pokeball[] = Array.from({ length: 5 }, (_, i) => ({
      xFrac: 0.1 + ((i * 0.19) % 0.85),
      yFrac: 0.15 + ((i * 0.31) % 0.7),
      radius: 20 + (i % 3) * 10,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (0.05 + Math.random() * 0.08) * (i % 2 === 0 ? 1 : -1),
      bobPhase: Math.random() * Math.PI * 2,
      bobAmp: 8 + Math.random() * 10,
      color: [CYAN, AMBER, VIOLET, CYAN, AMBER][i],
      alpha: 0.16 + Math.random() * 0.1,
    }));

    const runes: Rune[] = runeSeed.map((seed, i) => ({
      xFrac: 0.08 + ((i * 0.27) % 0.9),
      yFrac: 0.1 + ((i * 0.41) % 0.85),
      size: 22 + (i % 3) * 8,
      type: seed.type,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: 0.02 + Math.random() * 0.03,
      driftPhase: Math.random() * Math.PI * 2,
      driftAmp: 14 + Math.random() * 12,
      color: seed.color,
      alpha: 0.1 + Math.random() * 0.08,
    }));

    let sparkles: Sparkle[] = [];
    let sparkleTimer = 0;
    let sparkleThreshold = 4 + Math.random() * 6;

    let lastTime: number | null = null;
    let elapsed = 0;

    const loop = (timestamp: number) => {
      if (lastTime === null) lastTime = timestamp;
      const dt = Math.min((timestamp - lastTime) / 1000, 0.05);
      lastTime = timestamp;
      elapsed += dt;

      ctx.clearRect(0, 0, cssWidth, cssHeight);

      // Camada 1 — runas elementais à deriva (fundo, muito sutil)
      runes.forEach((rune) => {
        rune.rotation += rune.rotSpeed * dt;
        const drift = Math.sin(elapsed * 0.3 + rune.driftPhase) * rune.driftAmp;
        drawRune(
          ctx,
          rune.xFrac * cssWidth + drift,
          rune.yFrac * cssHeight,
          rune.size,
          rune.type,
          rune.rotation,
          rune.color,
          rune.alpha,
        );
      });

      // Camada 2 — pokébolas holográficas HUD
      pokeballs.forEach((ball) => {
        ball.rotation += ball.rotSpeed * dt;
        const bob = Math.sin(elapsed * 0.5 + ball.bobPhase) * ball.bobAmp;
        drawPokeballOutline(
          ctx,
          ball.xFrac * cssWidth,
          ball.yFrac * cssHeight + bob,
          ball.radius,
          ball.rotation,
          ball.color,
          ball.alpha,
        );
      });

      // Camada 3 — feixes de dados/transferência subindo
      beams.forEach((beam) => {
        beam.y -= beam.speed * dt;
        if (beam.y < -20) {
          beam.y = cssHeight + 20;
          beam.x = Math.random() * cssWidth;
        }
        const sway = Math.sin(elapsed * beam.swaySpeed + beam.swayPhase) * beam.swayAmp;
        const drawX = beam.x + sway;
        ctx.save();
        ctx.globalAlpha = beam.opacity;
        ctx.fillStyle = beam.color;
        ctx.shadowColor = beam.color;
        ctx.shadowBlur = beam.size * 3;
        ctx.beginPath();
        ctx.arc(drawX, beam.y, beam.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Easter egg raro — brilho Shiny de 4 pontas
      sparkleTimer += dt;
      if (sparkleTimer > sparkleThreshold) {
        sparkleTimer = 0;
        sparkleThreshold = 5 + Math.random() * 8;
        sparkles.push({
          x: cssWidth * (0.15 + Math.random() * 0.7),
          y: cssHeight * (0.15 + Math.random() * 0.6),
          size: 0,
          maxSize: 16 + Math.random() * 10,
          life: 0,
          maxLife: 1.6,
          color: AMBER,
        });
      }
      sparkles.forEach((sparkle) => {
        sparkle.life += dt;
      });
      sparkles = sparkles.filter((sparkle) => sparkle.life < sparkle.maxLife);
      sparkles.forEach((sparkle) => {
        const t = sparkle.life / sparkle.maxLife;
        const growth = t < 0.3 ? t / 0.3 : 1 - ((t - 0.3) / 0.7);
        const alpha = Math.max(growth, 0);
        drawShinySparkle(ctx, sparkle.x, sparkle.y, sparkle.maxSize * Math.max(growth, 0.15), alpha);
      });

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [reduceMotion, runeSeed]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      style={{
        background: `radial-gradient(ellipse at 50% 0%, rgba(139, 92, 246, 0.14) 0%, rgba(29, 19, 45, 0) 55%), ${BG_BASE}`,
      }}
    >
      {!reduceMotion && (
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      )}

      {reduceMotion && (
        <svg
          className="absolute inset-0 h-full w-full opacity-40"
          xmlns="http://www.w3.org/2000/svg"
        >
          {[
            { cx: '12%', cy: '20%', r: 30, color: CYAN },
            { cx: '85%', cy: '15%', r: 24, color: AMBER },
            { cx: '78%', cy: '75%', r: 34, color: VIOLET },
            { cx: '20%', cy: '80%', r: 22, color: CYAN },
          ].map((ball, i) => (
            <g key={i} opacity={0.14}>
              <circle cx={ball.cx} cy={ball.cy} r={ball.r} stroke={ball.color} fill="none" strokeWidth={1} />
              <circle cx={ball.cx} cy={ball.cy} r={ball.r * 0.28} stroke={ball.color} fill="none" strokeWidth={1} />
            </g>
          ))}
        </svg>
      )}

      {/* Vinheta para manter foco nos cards/conteúdo em primeiro plano */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 50% 45%, transparent 40%, rgba(13, 8, 23, 0.55) 100%)',
        }}
      />
    </div>
  );
}