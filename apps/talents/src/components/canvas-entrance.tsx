"use client";

import { useEffect, useRef, useState } from "react";

// Ported from the Astra reference (`app/entrance.tsx`): the same Canvas 2D
// destination-out compositing, smoothstep easing, and exponential scale
// math, driving the "camera passes through the symbol" reveal. Uses our
// deterministic transparent brand asset instead of Astra's own symbol file.
// Session gating, pre-hydration first paint, and reduced-motion handling
// live in TransitionShell — this component only owns the animation itself.
const NATURAL_FINISH_SECONDS = 4.8;
const WATCHDOG_MS = 6500;
const SYMBOL_SRC = "/media/sodales-symbol-transparent.png";

function smooth(v: number) {
  const clamped = Math.max(0, Math.min(1, v));
  return clamped * clamped * (3 - 2 * clamped);
}

export function CanvasEntrance({ run, onDone }: { run: number; onDone: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [visible, setVisible] = useState(true);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;
  const finishRef = useRef<() => void>(() => {});

  useEffect(() => {
    setVisible(true);

    let raf = 0;
    let ended = false;
    const el = canvasRef.current;
    if (!el) {
      setVisible(false);
      doneRef.current();
      return;
    }
    const ctx = el.getContext("2d");
    if (!ctx) {
      setVisible(false);
      doneRef.current();
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const img = new Image();
    img.src = SYMBOL_SRC;

    function finish() {
      if (ended) return;
      ended = true;
      window.clearTimeout(timeout);
      cancelAnimationFrame(raf);
      setVisible(false);
      document.body.style.overflow = previousOverflow;
      doneRef.current();
    }
    finishRef.current = finish;

    const timeout = window.setTimeout(finish, WATCHDOG_MS);

    img.onload = () => {
      const start = performance.now();

      const draw = (now: number) => {
        if (ended) return;

        const t = (now - start) / 1000;
        const w = window.innerWidth;
        const h = window.innerHeight;
        const dpr = Math.min(window.devicePixelRatio, 1.5);

        if (el.width !== w * dpr || el.height !== h * dpr) {
          el.width = w * dpr;
          el.height = h * dpr;
        }
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, w, h);

        const reveal = smooth((t - 1.05) / 1.3);
        const flight = smooth((t - 1.6) / 3.1);
        const fade = smooth((t - 3.1) / 1.5);

        // Obsidian field, present until the tail fade recedes it.
        ctx.globalCompositeOperation = "source-over";
        ctx.globalAlpha = 1 - fade;
        ctx.fillStyle = "#111111";
        ctx.fillRect(0, 0, w, h);

        const base = Math.min(w * 0.33, 220);
        const size = base * Math.exp(flight * Math.log((Math.max(w, h) * 9) / base));
        const x = w / 2 - size / 2;
        const y = h / 2 - size / 2;

        // Erase the obsidian through the symbol's own alpha — the aperture.
        ctx.globalCompositeOperation = "destination-out";
        ctx.globalAlpha = reveal;
        ctx.drawImage(img, x, y, size, size);

        // Violet symbol flash, independently fading in then out.
        ctx.globalCompositeOperation = "source-over";
        ctx.globalAlpha = smooth(t / 0.75) * (1 - smooth((t - 1.05) / 2.05));
        ctx.drawImage(img, x, y, size, size);
        ctx.globalAlpha = 1;

        if (el.parentElement) el.parentElement.style.background = "transparent";

        if (t >= NATURAL_FINISH_SECONDS) {
          finish();
        } else {
          raf = requestAnimationFrame(draw);
        }
      };

      raf = requestAnimationFrame(draw);
    };

    img.onerror = finish;

    const dismiss = (event: KeyboardEvent) => {
      if (event.key === "Escape") finish();
    };
    window.addEventListener("keydown", dismiss);

    return () => {
      ended = true;
      window.clearTimeout(timeout);
      cancelAnimationFrame(raf);
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", dismiss);
    };
  }, [run]);

  if (!visible) return null;

  return (
    <div
      aria-label="Sodales entrance"
      role="presentation"
      className="fixed inset-0 z-[110] bg-obsidian"
    >
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-[22%] text-center text-[10px] uppercase tracking-[0.22em] text-[#a39baa]"
        style={{ animation: "entrance-caption-fade 4.7s both" }}
      >
        Independent minds. Shared ambition.
      </span>
      <button
        type="button"
        aria-label="Dismiss introduction"
        onClick={() => finishRef.current()}
        className="absolute inset-0 h-full w-full cursor-pointer border-0 bg-transparent p-0"
      />
    </div>
  );
}
