"use client";
import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const CardSpotlight = ({
  children,
  radius = 350,
  color = "#1a6ec7",
  className,
  ...props
}: {
  radius?: number;
  color?: string;
  children: React.ReactNode;
  className?: string;
  [key: string]: unknown;
}) => {
  const mouseX = useRef(0);
  const mouseY = useRef(0);
  const [isHovering, setIsHovering] = useState(false);

  function handleMouseMove({
    currentTarget,
    clientX,
    clientY,
  }: React.MouseEvent<HTMLDivElement>) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.current = clientX - left;
    mouseY.current = clientY - top;
  }

  return (
    <div
      className={cn(
        "group/spotlight relative rounded-2xl border border-white/12 p-8 overflow-hidden transition-all duration-500 hover:border-white/18 hover:shadow-[0_8px_40px_rgba(16,185,129,0.08)]",
        className
      )}
      style={{
        background: "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 50%, rgba(16,185,129,0.02) 100%)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        boxShadow: "inset 0 1px 0 0 rgba(255,255,255,0.06), 0 4px 24px rgba(0,0,0,0.3)",
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      {...props}
    >
      {/* Top shimmer highlight */}
      <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
      {/* Inner glow overlay */}
      <div className="absolute inset-0 rounded-2xl bg-linear-to-br from-emerald-500/4 via-transparent to-transparent pointer-events-none" />
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition duration-300 group-hover/spotlight:opacity-100"
        style={{
          background: `radial-gradient(${radius}px circle at ${mouseX.current}px ${mouseY.current}px, ${color}22, transparent 80%)`,
        }}
        animate={{
          background: isHovering
            ? `radial-gradient(${radius}px circle at ${mouseX.current}px ${mouseY.current}px, ${color}22, transparent 80%)`
            : "none",
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
};
