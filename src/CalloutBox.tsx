import React from "react";
import { z } from "zod";
import {
  AbsoluteFill,
  Audio,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
  Sequence,
} from "remotion";
import { whoosh, whip } from "@remotion/sfx";
import { loadFont as loadSans } from "@remotion/google-fonts/Inter";

const { fontFamily: sans } = loadSans("normal", {
  weights: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

const JFROG_GREEN = "#40BE46";

const CL = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

const VARIANTS = {
  tip: {
    icon: "💡",
    label: "Pro Tip",
    accent: JFROG_GREEN,
    border: "rgba(64, 190, 70, 0.25)",
  },
  warning: {
    icon: "⚠️",
    label: "Warning",
    accent: "#f0a030",
    border: "rgba(240, 160, 48, 0.25)",
  },
  info: {
    icon: "ℹ️",
    label: "Info",
    accent: "#58a6ff",
    border: "rgba(88, 166, 255, 0.25)",
  },
  danger: {
    icon: "🚨",
    label: "Danger",
    accent: "#f85149",
    border: "rgba(248, 81, 73, 0.25)",
  },
} as const;

const POSITIONS = ["top-right", "top-left", "bottom-right", "bottom-left"] as const;

export const CalloutBoxSchema = z.object({
  type: z.enum(["tip", "warning", "info", "danger"]),
  position: z.enum(POSITIONS),
  text: z.string(),
});

export const CalloutBox: React.FC<z.infer<typeof CalloutBoxSchema>> = ({
  type,
  position,
  text,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const v = VARIANTS[type];
  const exitStart = durationInFrames - Math.round(fps * 0.5);

  const isRight = position.includes("right");
  const isBottom = position.includes("bottom");

  // Off-screen distance — enough to fully hide the box beyond the edge
  const OFF_SCREEN = 600;
  const slideSign = isRight ? 1 : -1;

  // ── Enter ──
  const enterSlide = spring({
    frame,
    fps,
    delay: Math.round(fps * 0.05),
    config: { damping: 13, stiffness: 160 },
  });

  const accentGrow = spring({
    frame,
    fps,
    delay: Math.round(fps * 0.15),
    config: { damping: 16, stiffness: 200 },
  });

  const iconPop = spring({
    frame,
    fps,
    delay: Math.round(fps * 0.35),
    config: { damping: 10, stiffness: 180 },
  });

  const labelFade = spring({
    frame,
    fps,
    delay: Math.round(fps * 0.45),
    config: { damping: 14, stiffness: 120 },
  });

  const textFade = spring({
    frame,
    fps,
    delay: Math.round(fps * 0.55),
    config: { damping: 14, stiffness: 120 },
  });

  // ── Exit ──
  const exitProgress = interpolate(
    frame,
    [exitStart, durationInFrames],
    [0, 1],
    CL,
  );
  const exitOpacity = interpolate(exitProgress, [0, 0.6, 1], [1, 1, 0], CL);

  // Entrance: slide from off-screen → resting position
  const enterX = interpolate(enterSlide, [0, 1], [OFF_SCREEN * slideSign, 0]);
  // Exit: slide back off-screen in the same direction
  const exitX = interpolate(exitProgress, [0, 1], [0, OFF_SCREEN * slideSign], CL);

  const translateX = enterX + exitX;

  // Accent bar placement depends on which side the box is on
  const accentOnLeft = isRight;
  const barRadius = accentOnLeft
    ? "3px 0 0 3px"
    : "0 3px 3px 0";
  const cardRadius = accentOnLeft
    ? "0 12px 12px 0"
    : "12px 0 0 12px";

  const positionStyle: React.CSSProperties = {
    position: "absolute",
    ...(isRight ? { right: 60 } : { left: 60 }),
    ...(isBottom ? { bottom: 60 } : { top: 60 }),
  };

  return (
    <AbsoluteFill style={{ backgroundColor: "transparent" }}>
      <Sequence from={0} layout="none">
        <Audio src={whoosh} volume={0.5} />
      </Sequence>

      <Sequence from={exitStart - Math.round(fps * 0.1)} layout="none">
        <Audio src={whip} volume={0.35} />
      </Sequence>

      <div
        style={{
          ...positionStyle,
          display: "flex",
          flexDirection: accentOnLeft ? "row" : "row-reverse",
          alignItems: "stretch",
          transform: `translateX(${translateX}px)`,
          opacity: exitOpacity,
          maxWidth: 520,
        }}
      >
        {/* Accent bar */}
        <div
          style={{
            width: 5,
            backgroundColor: v.accent,
            borderRadius: barRadius,
            transform: `scaleY(${accentGrow})`,
            transformOrigin: isBottom ? "bottom" : "top",
            boxShadow: `0 0 12px ${v.accent}50`,
          }}
        />

        {/* Main card */}
        <div
          style={{
            backgroundColor: "rgba(10, 12, 16, 0.94)",
            backdropFilter: "blur(20px)",
            borderRadius: cardRadius,
            border: `1px solid ${v.border}`,
            ...(accentOnLeft
              ? { borderLeft: "none" }
              : { borderRight: "none" }),
            padding: "16px 24px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span
              style={{
                fontSize: 22,
                opacity: iconPop,
                transform: `scale(${interpolate(iconPop, [0, 1], [0.3, 1])})`,
              }}
            >
              {v.icon}
            </span>
            <span
              style={{
                fontFamily: sans,
                fontSize: 14,
                fontWeight: 700,
                color: v.accent,
                textTransform: "uppercase",
                letterSpacing: 1,
                opacity: labelFade,
                transform: `translateX(${interpolate(labelFade, [0, 1], [12 * slideSign, 0])}px)`,
              }}
            >
              {v.label}
            </span>
          </div>

          <div
            style={{
              fontFamily: sans,
              fontSize: 18,
              fontWeight: 500,
              color: "#e6edf3",
              lineHeight: 1.5,
              opacity: textFade,
              transform: `translateX(${interpolate(textFade, [0, 1], [10 * slideSign, 0])}px)`,
            }}
          >
            {text}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
