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
  size: z.enum(["small", "medium", "large"]),
  celebrate: z.boolean(),
  celebrationHold: z.number().min(0).max(10),
});

const SIZE_CONFIG = {
  small: { circle: 36, font: 12, labelFont: 12, lineW: 48, pad: "16px 36px", gap: 6, radius: 16 },
  medium: { circle: 52, font: 18, labelFont: 16, lineW: 72, pad: "24px 52px", gap: 10, radius: 18 },
  large: { circle: 72, font: 26, labelFont: 22, lineW: 100, pad: "32px 64px", gap: 14, radius: 22 },
} as const;

export const StepProgressBar: React.FC<
  z.infer<typeof StepProgressBarSchema>
> = ({ steps: stepsRaw, position, size, celebrate, celebrationHold }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const sz = SIZE_CONFIG[size];

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
  const LAST_STEP_LOAD = Math.round(fps * 1.2);
  const advanceEnd = exitStart - holdFrames - LAST_STEP_LOAD - Math.round(fps * 0.2);
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
  const lastStepDoneFrame = lastStepFrame + LAST_STEP_LOAD;
  const allDone = frame >= lastStepDoneFrame;

  // 0→1 progress of the circular loader on the last step
  const isLastStepLoading = activeIdx >= count - 1 && !allDone;
  const loadArcProgress = isLastStepLoading
    ? interpolate(frame, [lastStepFrame, lastStepDoneFrame], [0, 1], CL)
    : 0;

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
            borderRadius: sz.radius,
            border: `1px solid ${allDone && celebrate ? JFROG_GREEN + "50" : "rgba(255,255,255,0.08)"}`,
            padding: sz.pad,
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
                    width={sz.lineW}
                    thickness={Math.max(2, Math.round(sz.circle / 18))}
                    labelOffset={sz.labelFont + sz.gap}
                  />
                )}

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: sz.gap,
                    minWidth: sz.circle + 40,
                  }}
                >
                  <div
                    style={{
                      position: "relative",
                      width: sz.circle,
                      height: sz.circle,
                      transform: `scale(${circleScale})`,
                    }}
                  >
                    {/* Circular loading arc for the last step */}
                    {i === count - 1 && isLastStepLoading && (
                      <CircularArc
                        size={sz.circle}
                        progress={loadArcProgress}
                        strokeWidth={3}
                      />
                    )}

                    <div
                      style={{
                        width: sz.circle,
                        height: sz.circle,
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: isCompleted
                          ? DONE_GREEN
                          : isActive || (i === count - 1 && isLastStepLoading)
                            ? "rgba(64, 190, 70, 0.15)"
                            : IDLE_BG,
                        border: `2px solid ${
                          isCompleted
                            ? DONE_GREEN
                            : isActive || (i === count - 1 && isLastStepLoading)
                              ? "rgba(64, 190, 70, 0.25)"
                              : IDLE_BORDER
                        }`,
                        boxShadow:
                          isActive || (i === count - 1 && isLastStepLoading)
                            ? `0 0 14px ${JFROG_GREEN}40`
                            : "none",
                      }}
                    >
                      {isCompleted ? (
                        <CheckSvg size={Math.round(sz.circle * 0.44)} />
                      ) : (
                        <span
                          style={{
                            fontFamily: sans,
                            fontSize: sz.font,
                            fontWeight: 700,
                            color:
                              isActive || (i === count - 1 && isLastStepLoading)
                                ? JFROG_GREEN
                                : IDLE_TEXT,
                          }}
                        >
                          {i + 1}
                        </span>
                      )}
                    </div>
                  </div>

                  <span
                    style={{
                      fontFamily: sans,
                      fontSize: sz.labelFont,
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

/* ─── Circular loading arc (SVG) ─── */
const CircularArc: React.FC<{
  size: number;
  progress: number;
  strokeWidth: number;
}> = ({ size, progress, strokeWidth }) => {
  const svgSize = size + strokeWidth * 2 + 4;
  const radius = size / 2 + strokeWidth / 2 + 1;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progress);

  return (
    <svg
      width={svgSize}
      height={svgSize}
      style={{
        position: "absolute",
        top: -(strokeWidth + 2),
        left: -(strokeWidth + 2),
        transform: "rotate(-90deg)",
        pointerEvents: "none",
      }}
    >
      {/* Track */}
      <circle
        cx={svgSize / 2}
        cy={svgSize / 2}
        r={radius}
        fill="none"
        stroke="rgba(255,255,255,0.06)"
        strokeWidth={strokeWidth}
      />
      {/* Progress */}
      <circle
        cx={svgSize / 2}
        cy={svgSize / 2}
        r={radius}
        fill="none"
        stroke={JFROG_GREEN}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={dashOffset}
        style={{
          filter: `drop-shadow(0 0 4px ${JFROG_GREEN}80)`,
        }}
      />
    </svg>
  );
};

/* ─── Connector line ─── */
const ConnectorLine: React.FC<{
  filled: boolean;
  progress: number;
  width: number;
  thickness: number;
  labelOffset: number;
}> = ({ filled, progress, width, thickness, labelOffset }) => (
  <div
    style={{
      width,
      height: thickness,
      backgroundColor: "rgba(255,255,255,0.08)",
      borderRadius: thickness / 2,
      marginLeft: 6,
      marginRight: 6,
      marginBottom: labelOffset,
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
        borderRadius: thickness / 2,
        boxShadow: `0 0 6px ${JFROG_GREEN}40`,
      }}
    />
  </div>
);

/* ─── Checkmark SVG ─── */
const CheckSvg: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    <path
      d="M3.5 8.5L6.5 11.5L12.5 5"
      stroke="#fff"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
