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

const SIZE_CONFIG = {
  small:  { iconFont: 22, labelFont: 14, textFont: 18, pad: "16px 24px", gap: 8, headerGap: 10, accentW: 5, maxW: 520, radius: 12, margin: 60 },
  medium: { iconFont: 30, labelFont: 18, textFont: 24, pad: "22px 32px", gap: 12, headerGap: 14, accentW: 6, maxW: 640, radius: 16, margin: 60 },
  large:  { iconFont: 40, labelFont: 24, textFont: 32, pad: "30px 44px", gap: 16, headerGap: 18, accentW: 8, maxW: 800, radius: 20, margin: 60 },
} as const;

export const CalloutBoxSchema = z.object({
  type: z.enum(["tip", "warning", "info", "danger"]),
  position: z.enum(POSITIONS),
  size: z.enum(["small", "medium", "large"]),
  text: z.string(),
});

export const CalloutBox: React.FC<z.infer<typeof CalloutBoxSchema>> = ({
  type,
  position,
  size,
  text,
}) => {
  const sz = SIZE_CONFIG[size];
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const v = VARIANTS[type];
  const exitStart = durationInFrames - Math.round(fps * 0.5);

  const isRight = position.includes("right");
  const isBottom = position.includes("bottom");

  // Off-screen distance — must exceed maxWidth + margin to fully hide
  const OFF_SCREEN = sz.maxW + sz.margin + 100;
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
  const r = sz.radius;
  const barRadius = accentOnLeft
    ? `${r / 4}px 0 0 ${r / 4}px`
    : `0 ${r / 4}px ${r / 4}px 0`;
  const cardRadius = accentOnLeft
    ? `0 ${r}px ${r}px 0`
    : `${r}px 0 0 ${r}px`;

  const positionStyle: React.CSSProperties = {
    position: "absolute",
    ...(isRight ? { right: sz.margin } : { left: sz.margin }),
    ...(isBottom ? { bottom: sz.margin } : { top: sz.margin }),
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
          maxWidth: sz.maxW,
        }}
      >
        {/* Accent bar */}
        <div
          style={{
            width: sz.accentW,
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
            padding: sz.pad,
            boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
            display: "flex",
            flexDirection: "column",
            gap: sz.gap,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: sz.headerGap }}>
            <span
              style={{
                fontSize: sz.iconFont,
                opacity: iconPop,
                transform: `scale(${interpolate(iconPop, [0, 1], [0.3, 1])})`,
              }}
            >
              {v.icon}
            </span>
            <span
              style={{
                fontFamily: sans,
                fontSize: sz.labelFont,
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
              fontSize: sz.textFont,
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
