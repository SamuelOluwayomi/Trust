"use client";

import { useEffect, useRef, useState } from "react";

export default function Background() {
  const [vantaEffect, setVantaEffect] = useState<any>(null);
  const vantaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadScript = (src: string) => {
      return new Promise((resolve, reject) => {
        // If already loaded, resolve immediately
        if (document.querySelector(`script[src="${src}"]`)) {
          resolve(true);
          return;
        }
        const script = document.createElement("script");
        script.src = src;
        script.async = true;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    };

    const initVanta = async () => {
      try {
        // Vanta Waves specifically needs an older Three.js (r121) to render Geometry
        // @ts-ignore
        if (!window.THREE) {
          await loadScript("https://cdnjs.cloudflare.com/ajax/libs/three.js/r121/three.min.js");
        }
        // @ts-ignore
        if (!window.VANTA || !window.VANTA.WAVES) {
          await loadScript("https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.waves.min.js");
        }

        if (!vantaEffect && vantaRef.current) {
          // @ts-ignore
          setVantaEffect(
            // @ts-ignore
            window.VANTA.WAVES({
              el: vantaRef.current,
              mouseControls: false, // Prevent intercepting clicks
              touchControls: false,
              gyroControls: false,
              minHeight: 200.00,
              minWidth: 200.00,
              scale: 1.00,
              scaleMobile: 1.00,
              color: 0x003c14, // Hex for 15380
              shininess: 30.00,
              waveHeight: 15.00,
              waveSpeed: 1.00,
              zoom: 1.00
            })
          );
        }
      } catch (err) {
        console.error("Vanta initialization failed:", err);
      }
    };

    initVanta();

    return () => {
      if (vantaEffect) {
        vantaEffect.destroy();
      }
    };
  }, [vantaEffect]);

  return (
    <div className="fixed inset-0 z-0 bg-[#020617] overflow-hidden pointer-events-none">
      <div ref={vantaRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
}
