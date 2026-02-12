import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardSlide } from "@/components/slides/DashboardSlide";
import { QRTemplatesSlide } from "@/components/slides/QRTemplatesSlide";
import { ReviewFlowSlide } from "@/components/slides/ReviewFlowSlide";
import { InsightsSlide } from "@/components/slides/InsightsSlide";

const SLIDES = [
  { id: "dashboard", Component: DashboardSlide },
  { id: "qr", Component: QRTemplatesSlide },
  { id: "review", Component: ReviewFlowSlide },
  { id: "insights", Component: InsightsSlide },
];

const ROTATE_INTERVAL_MS = 3000;
const ANIMATION_DURATION = 0.5;
const EASE = [0.42, 0, 0.58, 1] as const;

export function LaptopMockup() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setIndex((i) => (i + 1) % SLIDES.length);
    }, ROTATE_INTERVAL_MS);
    return () => clearInterval(t);
  }, []);

  const current = SLIDES[index];
  const CurrentComponent = current.Component;

  return (
    <div className="relative flex justify-center items-center w-full" style={{ perspective: "1200px" }}>
      {/* Subtle teal glow behind laptop (RevsBoost logo theme) */}
      <div
        className="absolute inset-0 -z-10 rounded-full blur-[80px] pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(46, 232, 230, 0.2) 0%, transparent 70%)",
          opacity: 0.9,
        }}
      />
      {/* Glow pulse */}
      <motion.div
        className="absolute -z-10 w-[400px] h-[200px] rounded-full blur-[60px] pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, rgba(46, 232, 230, 0.25) 0%, transparent 70%)",
          bottom: "-20%",
        }}
        animate={{ opacity: [0.12, 0.22, 0.12] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="relative"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: EASE }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Laptop frame — screen */}
        <div
          className="relative rounded-t-xl border border-[var(--landing-border-strong)] overflow-hidden shadow-2xl"
          style={{
            background: "linear-gradient(180deg, #1e2a3a 0%, #162C4E 100%)",
            boxShadow: "0 25px 50px -12px rgba(22, 44, 78, 0.35)",
          }}
        >
          {/* Bezel */}
          <div className="px-2 pt-2 pb-1.5">
            <div className="w-2 h-2 rounded-full bg-[var(--landing-text-muted)]/40 mx-auto" />
          </div>
          {/* Screen container */}
          <div
            className="relative mx-2 mb-2 rounded-lg overflow-hidden border border-black/50"
            style={{
              aspectRatio: "16/10",
              minWidth: "280px",
              width: "min(85vw, 1000px)",
              maxWidth: "100%",
              background: "#0d1520",
            }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={current.id}
                className="absolute inset-0"
                initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: 20, filter: "blur(4px)" }}
                transition={{ duration: ANIMATION_DURATION, ease: EASE }}
              >
                <CurrentComponent />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Base / keyboard chassis — substantial height, realistic depth */}
        <div
          className="relative rounded-b-xl border border-t-0 border-[var(--landing-border)] -mt-px overflow-hidden"
          style={{
            background: "linear-gradient(180deg, #1a2740 0%, #162C4E 35%, #0f172a 100%)",
            width: "calc(100% + 32px)",
            marginLeft: "-16px",
            minHeight: "55px",
            paddingTop: "14px",
            paddingBottom: "12px",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06), 0 4px 12px rgba(22, 44, 78, 0.25)",
          }}
        >
          {/* Subtle shadow from screen onto top of base */}
          <div
            className="absolute top-0 left-0 right-0 h-px opacity-60"
            style={{ background: "linear-gradient(90deg, transparent, rgba(0,0,0,0.5), transparent)" }}
          />
          {/* Horizontal reflection line for depth */}
          <div
            className="absolute left-[15%] right-[15%] h-px opacity-30"
            style={{
              top: "40%",
              background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)",
            }}
          />
          {/* Trackpad suggestion */}
          <div
            className="mx-auto rounded-lg border border-white/[0.06] opacity-80"
            style={{
              width: "28%",
              minWidth: "80px",
              maxWidth: "140px",
              height: "10px",
              background: "linear-gradient(180deg, rgba(255,255,255,0.03) 0%, transparent 100%)",
            }}
          />
          {/* Defined bottom edge */}
          <div
            className="absolute bottom-0 left-0 right-0 h-[2px] rounded-b-xl opacity-70"
            style={{ background: "linear-gradient(90deg, transparent 10%, rgba(255,255,255,0.06) 50%, transparent 90%)" }}
          />
        </div>

        {/* Reflection below laptop */}
        <div
          className="absolute left-0 right-0 -bottom-8 h-8 rounded-b-xl opacity-20"
          style={{
            background: "linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.06) 100%)",
            transform: "scaleY(-1)",
            filter: "blur(2px)",
          }}
        />
      </motion.div>
    </div>
  );
}
