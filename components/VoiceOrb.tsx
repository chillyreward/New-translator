"use client";

import { useEffect, useRef } from "react";

/**
 * AI Voice Orb — animated 3D gradient blob with audio waveform icon.
 * Purple/blue/red gradient mesh, morphing blob shape, soft glow.
 */
export function VoiceOrb({ size = 340 }: { size?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef  = useRef<number>(0);
  const tRef      = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width  = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    const cx = size / 2;
    const cy = size / 2;
    const R  = size * 0.36; // base blob radius

    // Build a morphing blob path using sin/cos harmonics
    function blobPath(t: number, wobble: number): Path2D {
      const path = new Path2D();
      const pts  = 120;
      for (let i = 0; i <= pts; i++) {
        const angle = (i / pts) * Math.PI * 2;
        const r =
          R +
          wobble * Math.sin(3 * angle + t * 1.1) * 18 +
          wobble * Math.sin(5 * angle - t * 0.7) * 10 +
          wobble * Math.cos(2 * angle + t * 0.9) * 12;
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);
        if (i === 0) path.moveTo(x, y);
        else path.lineTo(x, y);
      }
      path.closePath();
      return path;
    }

    function draw(t: number) {
      ctx!.clearRect(0, 0, size, size);

      // ── Outer glow ────────────────────────────────────────────────
      const glow = ctx!.createRadialGradient(cx, cy, R * 0.3, cx, cy, R * 1.55);
      glow.addColorStop(0,   "rgba(139, 92, 246, 0.22)");  // violet
      glow.addColorStop(0.5, "rgba(59, 130, 246, 0.12)");  // blue
      glow.addColorStop(1,   "rgba(239, 68, 68, 0.0)");    // transparent
      ctx!.fillStyle = glow;
      ctx!.beginPath();
      ctx!.arc(cx, cy, R * 1.55, 0, Math.PI * 2);
      ctx!.fill();

      // ── Blob shadow / depth ───────────────────────────────────────
      ctx!.save();
      ctx!.shadowColor = "rgba(139, 92, 246, 0.55)";
      ctx!.shadowBlur  = 48;
      ctx!.fillStyle   = "rgba(139, 92, 246, 0.18)";
      ctx!.fill(blobPath(t, 1.0));
      ctx!.restore();

      // ── Main blob gradient fill ───────────────────────────────────
      const blob = blobPath(t, 1.0);

      // Rotating mesh gradient — shift hue over time
      const hueShift = (t * 18) % 360;
      const grad = ctx!.createLinearGradient(
        cx + R * Math.cos(t * 0.4),
        cy + R * Math.sin(t * 0.4),
        cx - R * Math.cos(t * 0.4),
        cy - R * Math.sin(t * 0.4)
      );
      grad.addColorStop(0,    `hsl(${260 + hueShift % 40}, 90%, 62%)`);  // purple
      grad.addColorStop(0.35, `hsl(${220 + hueShift % 30}, 85%, 58%)`);  // blue
      grad.addColorStop(0.65, `hsl(${190 + hueShift % 20}, 80%, 55%)`);  // cyan-blue
      grad.addColorStop(1,    `hsl(${340 + hueShift % 50}, 85%, 60%)`);  // pink-red

      ctx!.fillStyle = grad;
      ctx!.fill(blob);

      // ── Inner highlight (3D sheen) ────────────────────────────────
      const sheen = ctx!.createRadialGradient(
        cx - R * 0.28, cy - R * 0.32, R * 0.05,
        cx - R * 0.1,  cy - R * 0.1,  R * 0.75
      );
      sheen.addColorStop(0,   "rgba(255,255,255,0.38)");
      sheen.addColorStop(0.4, "rgba(255,255,255,0.08)");
      sheen.addColorStop(1,   "rgba(255,255,255,0.0)");
      ctx!.fillStyle = sheen;
      ctx!.fill(blob);

      // ── Secondary inner blob (depth layer) ───────────────────────
      const innerBlob = blobPath(t * 1.3 + 1.2, 0.55);
      const innerGrad = ctx!.createRadialGradient(cx, cy, 0, cx, cy, R * 0.7);
      innerGrad.addColorStop(0,   "rgba(255,255,255,0.18)");
      innerGrad.addColorStop(0.6, "rgba(139,92,246,0.10)");
      innerGrad.addColorStop(1,   "rgba(59,130,246,0.0)");
      ctx!.fillStyle = innerGrad;
      ctx!.fill(innerBlob);

      // ── Audio waveform icon ───────────────────────────────────────
      drawWaveform(ctx!, cx, cy, t);
    }

    function drawWaveform(ctx: CanvasRenderingContext2D, cx: number, cy: number, t: number) {
      const bars   = 7;
      const gap    = 7;
      const maxH   = R * 0.52;
      const barW   = 5;
      const totalW = bars * barW + (bars - 1) * gap;
      const startX = cx - totalW / 2;

      // Heights animate like a live waveform
      const heights = [0.35, 0.65, 0.9, 1.0, 0.9, 0.65, 0.35].map((h, i) => {
        const wave = Math.sin(t * 2.2 + i * 0.9) * 0.28 + 0.72;
        return h * wave;
      });

      ctx.save();
      ctx.globalAlpha = 0.92;

      heights.forEach((h, i) => {
        const barH = maxH * h;
        const x    = startX + i * (barW + gap);
        const y    = cy - barH / 2;

        // Bar gradient — white to semi-transparent
        const barGrad = ctx.createLinearGradient(x, y, x, y + barH);
        barGrad.addColorStop(0,   "rgba(255,255,255,0.95)");
        barGrad.addColorStop(0.5, "rgba(255,255,255,0.80)");
        barGrad.addColorStop(1,   "rgba(255,255,255,0.50)");

        ctx.fillStyle = barGrad;
        ctx.beginPath();
        ctx.roundRect(x, y, barW, barH, barW / 2);
        ctx.fill();
      });

      ctx.restore();
    }

    function loop() {
      tRef.current += 0.012;
      draw(tRef.current);
      frameRef.current = requestAnimationFrame(loop);
    }

    loop();
    return () => cancelAnimationFrame(frameRef.current);
  }, [size]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: size, height: size }}
      className="select-none pointer-events-none"
      aria-hidden="true"
    />
  );
}
