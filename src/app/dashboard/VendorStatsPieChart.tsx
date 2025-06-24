"use client";
import { useEffect, useRef } from "react";

interface VendorStatsPieChartProps {
  active: number;
  inactive: number;
  total: number;
}

export default function VendorStatsPieChart({ active, inactive, total }: VendorStatsPieChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const size = canvas.width;
    const center = size / 2;
    const radius = center - 8;
    const activeAngle = (active / total) * 2 * Math.PI;
    // Animate draw
    let progress = 0;
    function drawPie() {
      if (!ctx) return;
      ctx.clearRect(0, 0, size, size);
      // Inactive (red)
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, 0, 2 * Math.PI);
      ctx.fillStyle = "#fee2e2";
      ctx.fill();
      // Active (blue, animated)
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, -Math.PI/2, -Math.PI/2 + activeAngle * progress);
      ctx.closePath();
      ctx.fillStyle = "#bfdbfe";
      ctx.fill();
      if (progress < 1) {
        progress += 0.04;
        requestAnimationFrame(drawPie);
      }
    }
    drawPie();
    // Center text
    ctx.font = "bold 18px sans-serif";
    ctx.fillStyle = "#22223b";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(`${active} / ${total}`, center, center);
  }, [active, inactive, total]);

  return (
    <div className="flex flex-col items-center justify-center mt-10 mb-10">
      <canvas ref={canvasRef} width={120} height={120} style={{ display: 'block' }} />
      <div className="flex gap-3 mt-6 text-sm">
        <div className="flex items-center gap-1 "><span className="inline-block w-3 h-3 rounded-full bg-blue-300 "></span>Active Vendors</div>
        <div className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-full bg-red-300"></span>Inactive Vendors</div>
      </div>
    </div>
  );
}
