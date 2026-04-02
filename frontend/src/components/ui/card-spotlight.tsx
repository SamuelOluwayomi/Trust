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
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      {...props}
    >
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
      {children}
    </div>
  );
};
