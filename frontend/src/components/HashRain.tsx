import { useEffect, useRef } from 'react';

const CHARS = '0123456789abcdef';
const TOKENS = ['SHA256', 'HMAC', 'PREV_HASH', 'BLK#', '0x', 'OPA', 'CANARY'];

export const HashRain: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const fontSize = 14;
    let width = 0, height = 0, columns = 0;
    let drops: number[] = [];
    let speeds: number[] = [];
    let labels: (string | null)[] = [];

    const pickLabel = () =>
      Math.random() < 0.06 ? TOKENS[Math.floor(Math.random() * TOKENS.length)] : null;

    const resize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      columns = Math.floor(width / fontSize);
      drops = Array.from({ length: columns }, () => Math.random() * -100);
      speeds = Array.from({ length: columns }, () => 0.3 + Math.random() * 0.7);
      labels = Array.from({ length: columns }, pickLabel);
    };
    resize();
    window.addEventListener('resize', resize);

    let raf = 0;
    const draw = () => {
      ctx.fillStyle = 'rgba(8, 11, 17, 0.14)';
      ctx.fillRect(0, 0, width, height);
      ctx.font = `${fontSize}px "JetBrains Mono", monospace`;

      for (let i = 0; i < columns; i++) {
        const x = i * fontSize;
        const y = drops[i] * fontSize;
        const label = labels[i];
        const text = label ? label[0] : CHARS[Math.floor(Math.random() * CHARS.length)];
        const isHead = Math.random() > 0.97;

        ctx.fillStyle = isHead ? 'rgba(191, 219, 254, 0.9)' : 'rgba(59, 130, 246, 0.3)';
        ctx.fillText(text, x, y);

        if (y > height && Math.random() > 0.975) {
          drops[i] = 0;
          speeds[i] = 0.3 + Math.random() * 0.7;
          labels[i] = pickLabel();
        }
        drops[i] += speeds[i] * 0.5;
      }
      raf = requestAnimationFrame(draw);
    };

    ctx.fillStyle = '#080b11';
    ctx.fillRect(0, 0, width, height);
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none opacity-40" />;
};
