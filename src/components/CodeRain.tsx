import { useEffect, useRef } from "react";
import { useTheme } from "../contexts/ThemeContext";

const chars = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789<>/{}[]|&^%$#@!";

interface Drop {
  x: number;
  y: number;
  speed: number;
  length: number;
  chars: string[];
}

export default function CodeRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();
  const themeRef = useRef(theme);

  // Keep theme in sync without triggering re-render
  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let drops: Drop[] = [];
    const fontSize = 14;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
      const cols = Math.floor(canvas.width / fontSize);
      drops = Array.from({ length: cols }, (_, i) => ({
        x: i * fontSize,
        y: -Math.random() * canvas.height,
        speed: 0.3 + Math.random() * 0.5,
        length: 5 + Math.floor(Math.random() * 15),
        chars: Array.from({ length: 20 }, () => chars[Math.floor(Math.random() * chars.length)]),
      }));
    };

    resize();
    window.addEventListener("resize", resize);

    let lastTime = 0;
    const interval = 50;

    const draw = (time: number) => {
      if (time - lastTime < interval) {
        animId = requestAnimationFrame(draw);
        return;
      }
      lastTime = time;

      const isDark = themeRef.current === "dark";

      // Use the current theme's background color for fade
      ctx.fillStyle = isDark ? "rgba(13,13,13,0.08)" : "rgba(244,241,236,0.08)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = fontSize + "px 'Space Mono', monospace";
      const rgb = isDark ? "255,255,255" : "26,26,26";

      for (let i = 0; i < drops.length; i++) {
        const d = drops[i];
        d.y += d.speed;

        if (d.y - d.length * fontSize > canvas.height) {
          d.y = -d.length * fontSize;
          d.speed = 0.3 + Math.random() * 0.5;
          d.length = 5 + Math.floor(Math.random() * 15);
        }

        if (Math.random() < 0.02) {
          d.chars[Math.floor(Math.random() * d.chars.length)] = chars[Math.floor(Math.random() * chars.length)];
        }

        for (let j = 0; j < d.length; j++) {
          const cy = d.y - j * fontSize;
          if (cy < 0 || cy > canvas.height) continue;

          const brightFactor = j === 0 ? 0.9 : Math.max(0.05, 0.3 - j / d.length * 0.3);
          ctx.fillStyle = `rgba(${rgb},${brightFactor * (isDark ? 0.85 : 0.6)})`;
          ctx.fillText(d.chars[j % d.chars.length], d.x, cy);
        }
      }

      animId = requestAnimationFrame(draw);
    };

    animId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []); // Empty deps - never re-initialize

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
        opacity: 0.5,
      }}
    />
  );
}
