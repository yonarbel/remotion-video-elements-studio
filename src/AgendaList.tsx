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
import { whoosh, whip, uiSwitch } from "@remotion/sfx";
import { loadFont as loadSans } from "@remotion/google-fonts/Inter";

const { fontFamily: sans } = loadSans("normal", {
  weights: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
});

const JFROG_GREEN = "#40BE46";

const CL = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

export const AgendaListSchema = z.object({
  heading: z.string(),
  items: z.string(),
  bulletStyle: z.enum(["number", "dot", "dash", "arrow"]),
  position: z.enum(["center", "left", "right"]),
  sizePct: z.number().min(10).max(100),
});

const BULLET: Record<string, (i: number) => string> = {
  number: (i) => `${i + 1}.`,
  dot: () => "•",
  dash: () => "—",
  arrow: () => "→",
};

export const AgendaList: React.FC<z.infer<typeof AgendaListSchema>> = ({
  heading,
  items: itemsRaw,
  bulletStyle,
  position,
  sizePct,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const itemLabels = itemsRaw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const count = itemLabels.length;

  if (count === 0) return null;

  const sizeScale = sizePct / 100;

  const EXIT_DUR = Math.round(fps * 0.5);
  const exitStart = durationInFrames - EXIT_DUR;

  const HEADING_DELAY = Math.round(fps * 0.3);
  const FIRST_ITEM_DELAY = Math.round(fps * 0.7);
  const ITEM_STAGGER = Math.round(fps * 0.35);

  const itemAppearFrames = itemLabels.map(
    (_, i) => FIRST_ITEM_DELAY + i * ITEM_STAGGER,
  );

  // ── Entrance ──
  const enterSpring = spring({
    frame,
    fps,
    delay: 0,
    config: { damping: 14, stiffness: 140 },
  });
  const enterOpacity = interpolate(enterSpring, [0, 1], [0, 1], CL);
  const enterScale = interpolate(enterSpring, [0, 1], [0.92, 1]);

  const headingSpring = spring({
    frame,
    fps,
    delay: HEADING_DELAY,
    config: { damping: 14, stiffness: 120 },
  });

  const lineWidth = spring({
    frame,
    fps,
    delay: HEADING_DELAY + Math.round(fps * 0.1),
    config: { damping: 18, stiffness: 100 },
  });

  // ── Exit ──
  const exitProgress = interpolate(
    frame,
    [exitStart, durationInFrames],
    [0, 1],
    CL,
  );
  const exitOpacity = interpolate(exitProgress, [0, 0.7, 1], [1, 1, 0], CL);
  const exitScale = interpolate(exitProgress, [0, 1], [1, 0.95], CL);

  const justifyContent =
    position === "left"
      ? "flex-start"
      : position === "right"
        ? "flex-end"
        : "center";
  const textAlign: React.CSSProperties["textAlign"] =
    position === "left" ? "left" : position === "right" ? "right" : "center";

  return (
    <AbsoluteFill style={{ backgroundColor: "transparent" }}>
      {/* Entrance */}
      <Sequence from={0} layout="none">
        <Audio src={whoosh} volume={0.35} />
      </Sequence>

      {/* Per-item sounds */}
      {itemAppearFrames.map((f, i) => (
        <Sequence key={i} from={f} layout="none">
          <Audio src={uiSwitch} volume={0.15} />
        </Sequence>
      ))}

      {/* Exit */}
      <Sequence from={exitStart - Math.round(fps * 0.1)} layout="none">
        <Audio src={whip} volume={0.3} />
      </Sequence>

      {/* Layout container */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          alignItems: "center",
          justifyContent,
          padding: position === "center" ? 0 : "0 60px",
          opacity: enterOpacity * exitOpacity,
          transform: `scale(${enterScale * exitScale * sizeScale})`,
        }}
      >
        {/* Card */}
        <div
          style={{
            backgroundColor: "rgba(10, 12, 16, 0.92)",
            backdropFilter: "blur(24px)",
            borderRadius: 20,
            border: "1px solid rgba(255,255,255,0.08)",
            padding: "48px 64px",
            boxShadow: "0 12px 48px rgba(0,0,0,0.5)",
            display: "flex",
            flexDirection: "column",
            maxWidth: 900,
            minWidth: 500,
          }}
        >
          {/* Heading */}
          {heading && (
            <div
              style={{
                opacity: headingSpring,
                transform: `translateY(${interpolate(headingSpring, [0, 1], [14, 0])}px)`,
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  fontFamily: sans,
                  fontSize: 48,
                  fontWeight: 800,
                  color: "#ffffff",
                  textAlign,
                  lineHeight: 1.2,
                }}
              >
                {heading}
              </div>

              <div
                style={{
                  width: interpolate(lineWidth, [0, 1], [0, 90]),
                  height: 4,
                  backgroundColor: JFROG_GREEN,
                  borderRadius: 2,
                  marginTop: 16,
                  marginBottom: 12,
                  boxShadow: `0 0 10px ${JFROG_GREEN}40`,
                  ...(position === "center" && {
                    marginLeft: "auto",
                    marginRight: "auto",
                  }),
                  ...(position === "right" && { marginLeft: "auto" }),
                }}
              />
            </div>
          )}

          {/* Items */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 22,
              marginTop: 8,
            }}
          >
            {itemLabels.map((label, i) => {
              const itemSpring = spring({
                frame,
                fps,
                delay: itemAppearFrames[i],
                config: { damping: 13, stiffness: 150 },
              });

              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: 18,
                    opacity: itemSpring,
                    transform: `translateX(${interpolate(itemSpring, [0, 1], [30, 0])}px)`,
                  }}
                >
                  <span
                    style={{
                      fontFamily: sans,
                      fontSize: 32,
                      fontWeight: 700,
                      color: JFROG_GREEN,
                      flexShrink: 0,
                      minWidth: bulletStyle === "number" ? 40 : 24,
                      textAlign: "right",
                    }}
                  >
                    {BULLET[bulletStyle](i)}
                  </span>
                  <span
                    style={{
                      fontFamily: sans,
                      fontSize: 32,
                      fontWeight: 500,
                      color: "#e6edf3",
                      lineHeight: 1.4,
                    }}
                  >
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
