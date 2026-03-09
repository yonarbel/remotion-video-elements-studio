import React, { useMemo } from "react";
import { z } from "zod";
import {
  AbsoluteFill,
  Audio,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
  Sequence,
  random,
} from "remotion";
import { whoosh, whip, ding } from "@remotion/sfx";
import { loadFont as loadSans } from "@remotion/google-fonts/Inter";

const { fontFamily: sans } = loadSans("normal", {
  weights: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

const JFROG_GREEN = "#40BE46";
const DONE_GREEN = "#40BE46";
const IDLE_BORDER = "rgba(255,255,255,0.15)";
const IDLE_BG = "rgba(255,255,255,0.04)";
const IDLE_TEXT = "rgba(255,255,255,0.35)";
const ACTIVE_TEXT = "#ffffff";

const CL = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

const CONFETTI_COLORS = [
  JFROG_GREEN,
  "#58a6ff",
  "#f0a030",
  "#f85149",
  "#bc8cff",
  "#ffffff",
  "#79c0ff",
  "#7ee787",
];

export const StepProgressBarSchema = z.object({
  steps: z.string(),
  position: z.enum(["top", "bottom"]),
  celebrate: z.boolean(),
  celebrationHold: z.number().min(0).max(10),
});

export const StepProgressBar: React.FC<
  z.infer<typeof StepProgressBarSchema>
> = ({ steps: stepsRaw, position, celebrate, celebrationHold }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const stepLabels = stepsRaw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const count = stepLabels.length;

  if (count === 0) return null;

  const ENTER_DUR = Math.round(fps * 0.5);
  const EXIT_DUR = Math.round(fps * 0.5);
  const holdFrames = celebrate ? Math.round(celebrationHold * fps) : 0;
  const exitStart = durationInFrames - EXIT_DUR;

  const advanceStart = ENTER_DUR + Math.round(fps * 0.3);
  const advanceEnd = exitStart - holdFrames - Math.round(fps * 0.2);
  const advanceDuration = advanceEnd - advanceStart;
  const framesPerStep =
    count > 1 ? advanceDuration / (count - 1) : advanceDuration;

  const rawProgress =
    frame < advanceStart
      ? 0
      : frame >= advanceEnd
        ? count - 1
        : (frame - advanceStart) / framesPerStep;
  const activeIdx = Math.floor(rawProgress);

  const stepActivationFrames = stepLabels.map((_, i) =>
    i === 0 ? advanceStart : Math.round(advanceStart + i * framesPerStep),
  );

  const lastStepFrame = stepActivationFrames[count - 1];
  const allDone = activeIdx >= count - 1 && frame >= lastStepFrame;

  // ── Entrance ──
  const enterSpring = spring({
    frame,
    fps,
    delay: 0,
    config: { damping: 14, stiffness: 140 },
  });
  const enterOffset =
    position === "top"
      ? interpolate(enterSpring, [0, 1], [-100, 0])
      : interpolate(enterSpring, [0, 1], [100, 0]);
  const enterOpacity = interpolate(enterSpring, [0, 1], [0, 1], CL);

  // ── Exit ──
  const exitProgress = interpolate(
    frame,
    [exitStart, durationInFrames],
    [0, 1],
    CL,
  );
  const exitOffset =
    position === "top"
      ? interpolate(exitProgress, [0, 1], [0, -100], CL)
      : interpolate(exitProgress, [0, 1], [0, 100], CL);
  const exitOpacity = interpolate(exitProgress, [0, 0.7, 1], [1, 1, 0], CL);

  // ── Celebration shake ──
  let shakeX = 0;
  let shakeY = 0;
  if (celebrate && allDone) {
    const elapsed = frame - lastStepFrame;
    const shakeDuration = Math.round(fps * 0.4);
    if (elapsed < shakeDuration) {
      const decay = interpolate(elapsed, [0, shakeDuration], [1, 0], CL);
      const freq = 1.8;
      shakeX = Math.sin(elapsed * freq) * 6 * decay;
      shakeY = Math.cos(elapsed * freq * 1.3) * 3 * decay;
    }
  }

  return (
    <AbsoluteFill style={{ backgroundColor: "transparent" }}>
      {/* Entrance sound */}
      <Sequence from={0} layout="none">
        <Audio src={whoosh} volume={0.35} />
      </Sequence>

      {/* Step activation dings */}
      {stepActivationFrames.slice(1).map((f, i) => (
        <Sequence key={i} from={f} layout="none">
          <Audio src={ding} volume={0.2} />
        </Sequence>
      ))}

      {/* Exit sound */}
      <Sequence from={exitStart - Math.round(fps * 0.1)} layout="none">
        <Audio src={whip} volume={0.3} />
      </Sequence>

      {/* Confetti layer (behind the bar) */}
      {celebrate && allDone && (
        <ConfettiExplosion
          originY={position === "top" ? 100 : 980}
          triggerFrame={lastStepFrame}
          fps={fps}
        />
      )}

      {/* Progress bar container */}
      <div
        style={{
          position: "absolute",
          ...(position === "top" ? { top: 40 } : { bottom: 40 }),
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          transform: `translateY(${enterOffset + exitOffset}px) translate(${shakeX}px, ${shakeY}px)`,
          opacity: enterOpacity * exitOpacity,
        }}
      >
        <div
          style={{
            backgroundColor: "rgba(10, 12, 16, 0.92)",
            backdropFilter: "blur(24px)",
            borderRadius: 16,
            border: `1px solid ${allDone && celebrate ? JFROG_GREEN + "50" : "rgba(255,255,255,0.08)"}`,
            padding: "16px 36px",
            boxShadow: allDone && celebrate
              ? `0 8px 40px rgba(0,0,0,0.5), 0 0 20px ${JFROG_GREEN}30`
              : "0 8px 40px rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            gap: 0,
          }}
        >
          {stepLabels.map((label, i) => {
            const isCompleted = i < activeIdx || (allDone && i === count - 1);
            const isActive = i === activeIdx && !allDone;

            const stepSpring = spring({
              frame: Math.max(0, frame - stepActivationFrames[i]),
              fps,
              config: { damping: 12, stiffness: 180 },
            });

            const circleScale =
              isActive || isCompleted
                ? interpolate(stepSpring, [0, 1], [0.6, 1])
                : 1;

            const labelOpacity = spring({
              frame: Math.max(
                0,
                frame - (stepActivationFrames[i] + Math.round(fps * 0.1)),
              ),
              fps,
              config: { damping: 14, stiffness: 120 },
            });

            return (
              <React.Fragment key={i}>
                {i > 0 && (
                  <ConnectorLine
                    filled={i <= activeIdx}
                    progress={
                      i <= activeIdx
                        ? 1
                        : i === activeIdx + 1
                          ? rawProgress - activeIdx
                          : 0
                    }
                  />
                )}

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 8,
                    minWidth: 80,
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transform: `scale(${circleScale})`,
                      backgroundColor: isCompleted
                        ? DONE_GREEN
                        : isActive
                          ? "rgba(64, 190, 70, 0.15)"
                          : IDLE_BG,
                      border: `2px solid ${
                        isCompleted
                          ? DONE_GREEN
                          : isActive
                            ? JFROG_GREEN
                            : IDLE_BORDER
                      }`,
                      boxShadow: isActive
                        ? `0 0 14px ${JFROG_GREEN}40`
                        : "none",
                    }}
                  >
                    {isCompleted ? (
                      <CheckSvg />
                    ) : (
                      <span
                        style={{
                          fontFamily: sans,
                          fontSize: 14,
                          fontWeight: 700,
                          color: isActive ? JFROG_GREEN : IDLE_TEXT,
                        }}
                      >
                        {i + 1}
                      </span>
                    )}
                  </div>

                  <span
                    style={{
                      fontFamily: sans,
                      fontSize: 12,
                      fontWeight: isActive || isCompleted ? 600 : 400,
                      color: isActive || isCompleted ? ACTIVE_TEXT : IDLE_TEXT,
                      textAlign: "center",
                      whiteSpace: "nowrap",
                      opacity: isActive || isCompleted ? labelOpacity : 0.5,
                    }}
                  >
                    {label}
                  </span>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ─── Confetti explosion ─── */
const PARTICLE_COUNT = 60;

interface Particle {
  x: number; // start offset from center (-1..1)
  angle: number; // launch angle in radians
  speed: number; // pixels per frame
  size: number;
  color: string;
  rotation: number; // degrees per frame
  shape: "rect" | "circle";
}

const ConfettiExplosion: React.FC<{
  originY: number;
  triggerFrame: number;
  fps: number;
}> = ({ originY, triggerFrame, fps }) => {
  const frame = useCurrentFrame();
  const elapsed = frame - triggerFrame;

  const particles = useMemo<Particle[]>(() => {
    return Array.from({ length: PARTICLE_COUNT }, (_, i) => {
      const seed = `confetti-${i}`;
      return {
        x: (random(seed + "-x") - 0.5) * 2,
        angle: random(seed + "-a") * Math.PI * 2,
        speed: 4 + random(seed + "-s") * 10,
        size: 4 + random(seed + "-sz") * 6,
        color:
          CONFETTI_COLORS[
            Math.floor(random(seed + "-c") * CONFETTI_COLORS.length)
          ],
        rotation: (random(seed + "-r") - 0.5) * 18,
        shape: random(seed + "-sh") > 0.5 ? "rect" : "circle",
      };
    });
  }, []);

  if (elapsed < 0) return null;

  const gravity = 0.15;
  const lifetime = Math.round(fps * 2.5);

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      {particles.map((p, i) => {
        const t = elapsed;
        if (t > lifetime) return null;

        const vx = Math.cos(p.angle) * p.speed;
        const vy = Math.sin(p.angle) * p.speed;

        const px = 960 + p.x * 200 + vx * t;
        const py = originY + vy * t + 0.5 * gravity * t * t;
        const rot = p.rotation * t;
        const fade = interpolate(t, [lifetime * 0.6, lifetime], [1, 0], CL);

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: px,
              top: py,
              width: p.size,
              height: p.shape === "rect" ? p.size * 1.6 : p.size,
              backgroundColor: p.color,
              borderRadius: p.shape === "circle" ? "50%" : 2,
              transform: `rotate(${rot}deg)`,
              opacity: fade,
            }}
          />
        );
      })}
    </div>
  );
};

/* ─── Connector line ─── */
const ConnectorLine: React.FC<{
  filled: boolean;
  progress: number;
}> = ({ filled, progress }) => (
  <div
    style={{
      width: 48,
      height: 2,
      backgroundColor: "rgba(255,255,255,0.08)",
      borderRadius: 1,
      marginLeft: 6,
      marginRight: 6,
      marginBottom: 24,
      position: "relative",
      overflow: "hidden",
    }}
  >
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        height: "100%",
        width: `${(filled ? 1 : Math.max(0, Math.min(1, progress))) * 100}%`,
        backgroundColor: JFROG_GREEN,
        borderRadius: 1,
        boxShadow: `0 0 6px ${JFROG_GREEN}40`,
      }}
    />
  </div>
);

/* ─── Checkmark SVG ─── */
const CheckSvg: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path
      d="M3.5 8.5L6.5 11.5L12.5 5"
      stroke="#fff"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
