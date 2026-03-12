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
import { whoosh } from "@remotion/sfx";
import { loadFont as loadSans } from "@remotion/google-fonts/Inter";

const { fontFamily: sans } = loadSans("normal", {
  weights: ["700", "800", "900"],
  subsets: ["latin"],
});

const CL = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

const JFROG_GREEN = "#40BE46";

const SIZE_CONFIG = {
  small: { fontSize: 48, gap: 32, sepW: 3, sepH: 28, sepDot: 8 },
  medium: { fontSize: 72, gap: 44, sepW: 4, sepH: 40, sepDot: 10 },
  large: { fontSize: 100, gap: 56, sepW: 5, sepH: 54, sepDot: 14 },
} as const;

const SEPARATORS: Record<
  string,
  (sz: (typeof SIZE_CONFIG)["medium"], color: string) => React.ReactNode
> = {
  none: () => null,
  dot: (sz, color) => (
    <div
      style={{
        width: sz.sepDot,
        height: sz.sepDot,
        borderRadius: "50%",
        backgroundColor: color,
        boxShadow: `0 0 10px ${color}60`,
      }}
    />
  ),
  pipe: (sz, color) => (
    <div
      style={{
        width: sz.sepW,
        height: sz.sepH,
        borderRadius: 2,
        backgroundColor: color,
        boxShadow: `0 0 8px ${color}60`,
      }}
    />
  ),
  arrow: (sz, color) => (
    <span
      style={{
        fontSize: sz.fontSize * 0.5,
        color,
        fontWeight: 700,
        textShadow: `0 0 10px ${color}60`,
      }}
    >
      →
    </span>
  ),
  dash: (sz, color) => (
    <div
      style={{
        width: sz.sepH * 0.6,
        height: sz.sepW,
        borderRadius: 2,
        backgroundColor: color,
        boxShadow: `0 0 8px ${color}60`,
      }}
    />
  ),
};

export const FlyingWordsSchema = z.object({
  words: z.string(),
  mode: z.enum(["accumulate", "replace"]),
  direction: z.enum(["left", "right", "top", "bottom"]),
  separator: z.enum(["none", "dot", "pipe", "arrow", "dash"]),
  size: z.enum(["small", "medium", "large"]),
  colors: z.string(),
  separatorColor: z.string(),
});

const parseColors = (colorsStr: string, count: number): string[] => {
  const parsed = colorsStr
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);
  if (parsed.length === 0) return Array(count).fill("#ffffff");
  if (parsed.length === 1) return Array(count).fill(parsed[0]);
  return Array.from({ length: count }, (_, i) => parsed[i % parsed.length]);
};

const hexToGlow = (hex: string): string => {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16) || 255;
  const g = parseInt(h.substring(2, 4), 16) || 255;
  const b = parseInt(h.substring(4, 6), 16) || 255;
  return `rgba(${r}, ${g}, ${b}, 0.25)`;
};

const getEnterOffset = (
  direction: string,
  progress: number,
): { x: number; y: number } => {
  const dist = 800;
  switch (direction) {
    case "left":
      return { x: interpolate(progress, [0, 1], [-dist, 0], CL), y: 0 };
    case "right":
      return { x: interpolate(progress, [0, 1], [dist, 0], CL), y: 0 };
    case "top":
      return { x: 0, y: interpolate(progress, [0, 1], [-dist, 0], CL) };
    case "bottom":
      return { x: 0, y: interpolate(progress, [0, 1], [dist, 0], CL) };
    default:
      return { x: 0, y: 0 };
  }
};

const getExitOffset = (
  direction: string,
  progress: number,
): { x: number; y: number } => {
  const dist = 800;
  switch (direction) {
    case "left":
      return { x: interpolate(progress, [0, 1], [0, dist], CL), y: 0 };
    case "right":
      return { x: interpolate(progress, [0, 1], [0, -dist], CL), y: 0 };
    case "top":
      return { x: 0, y: interpolate(progress, [0, 1], [0, dist], CL) };
    case "bottom":
      return { x: 0, y: interpolate(progress, [0, 1], [0, -dist], CL) };
    default:
      return { x: 0, y: 0 };
  }
};

export const FlyingWords: React.FC<z.infer<typeof FlyingWordsSchema>> = ({
  words: wordsStr,
  mode = "accumulate",
  direction = "bottom",
  separator = "dot",
  size = "medium",
  colors: colorsStr = "#ffffff",
  separatorColor = JFROG_GREEN,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const sz = SIZE_CONFIG[size] ?? SIZE_CONFIG.medium;

  const items = wordsStr
    .split(",")
    .map((w) => w.trim())
    .filter(Boolean);
  const count = items.length;

  if (count === 0)
    return <AbsoluteFill style={{ backgroundColor: "transparent" }} />;

  const wordColors = parseColors(colorsStr, count);
  const renderSep = SEPARATORS[separator] ?? SEPARATORS.none;

  /* ── accumulate: words stack up, all exit together ── */
  if (mode === "accumulate") {
    const stagger = Math.round(fps * 0.7);
    const exitDur = Math.round(fps * 0.4);
    const exitStart = durationInFrames - exitDur;

    const exitProgress = interpolate(
      frame,
      [exitStart, durationInFrames],
      [0, 1],
      CL,
    );
    const exitOff = getExitOffset(direction, exitProgress);
    const exitOpacity = interpolate(
      exitProgress,
      [0, 0.5, 1],
      [1, 0.7, 0],
      CL,
    );

    return (
      <AbsoluteFill style={{ backgroundColor: "transparent" }}>
        {items.map((_, i) => (
          <Sequence key={`sfx-${i}`} from={i * stagger} layout="none">
            <Audio src={whoosh} volume={0.35} />
          </Sequence>
        ))}

        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: `translate(-50%, -50%) translate(${exitOff.x}px, ${exitOff.y}px)`,
            display: "flex",
            alignItems: "center",
            gap: sz.gap,
            opacity: exitOpacity,
          }}
        >
          {items.map((word, i) => {
            const enterSpring = spring({
              frame,
              fps,
              delay: i * stagger,
              config: { damping: 12, stiffness: 160 },
            });
            const off = getEnterOffset(direction, enterSpring);
            const scale = interpolate(enterSpring, [0, 1], [0.4, 1], CL);
            const opacity = interpolate(enterSpring, [0, 1], [0, 1], CL);

            const sepSpring =
              i > 0
                ? spring({
                    frame,
                    fps,
                    delay: i * stagger - Math.round(stagger * 0.2),
                    config: { damping: 14, stiffness: 120 },
                  })
                : 0;

            return (
              <React.Fragment key={i}>
                {i > 0 && (
                  <div
                    style={{
                      opacity: sepSpring,
                      transform: `scale(${sepSpring})`,
                    }}
                  >
                    {renderSep(sz, separatorColor)}
                  </div>
                )}
                <span
                  style={{
                    fontFamily: sans,
                    fontSize: sz.fontSize,
                    fontWeight: 800,
                    color: wordColors[i],
                    textTransform: "uppercase",
                    letterSpacing: 4,
                    transform: `translate(${off.x}px, ${off.y}px) scale(${scale})`,
                    opacity,
                    textShadow: `0 0 30px ${hexToGlow(wordColors[i])}`,
                    whiteSpace: "nowrap",
                  }}
                >
                  {word}
                </span>
              </React.Fragment>
            );
          })}
        </div>
      </AbsoluteFill>
    );
  }

  /* ── replace: one at a time, each exits as the next enters ── */
  const perWord = Math.floor(durationInFrames / count);
  const exitFrames = Math.round(fps * 0.35);

  return (
    <AbsoluteFill style={{ backgroundColor: "transparent" }}>
      {items.map((_, i) => (
        <Sequence key={`sfx-${i}`} from={i * perWord} layout="none">
          <Audio src={whoosh} volume={0.35} />
        </Sequence>
      ))}

      {items.map((word, i) => {
        const wordStart = i * perWord;
        const wordEnd =
          i === count - 1 ? durationInFrames : (i + 1) * perWord;
        const localFrame = frame - wordStart;

        if (localFrame < 0 || frame >= wordEnd) return null;

        const wordDur = wordEnd - wordStart;
        const exitStart = wordDur - exitFrames;

        const enterSpring = spring({
          frame: Math.max(0, localFrame),
          fps,
          config: { damping: 12, stiffness: 160 },
        });

        const exitProgress = interpolate(
          localFrame,
          [exitStart, wordDur],
          [0, 1],
          CL,
        );

        const enterOff = getEnterOffset(direction, enterSpring);
        const exitOff = getExitOffset(direction, exitProgress);
        const enterScale = interpolate(enterSpring, [0, 1], [0.4, 1], CL);
        const exitScale = interpolate(exitProgress, [0, 1], [1, 0.4], CL);
        const enterOpacity = interpolate(enterSpring, [0, 1], [0, 1], CL);
        const exitOpacity = interpolate(
          exitProgress,
          [0, 0.5, 1],
          [1, 0.7, 0],
          CL,
        );

        const isExiting = localFrame >= exitStart;
        const tx = isExiting ? exitOff.x : enterOff.x;
        const ty = isExiting ? exitOff.y : enterOff.y;
        const s = isExiting ? exitScale : enterScale;
        const o = isExiting ? exitOpacity : enterOpacity;

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: `translate(-50%, -50%) translate(${tx}px, ${ty}px) scale(${s})`,
              opacity: o,
              fontFamily: sans,
              fontSize: sz.fontSize,
              fontWeight: 800,
              color: wordColors[i],
              textTransform: "uppercase",
              letterSpacing: 4,
              textShadow: `0 0 30px ${hexToGlow(wordColors[i])}`,
              whiteSpace: "nowrap",
            }}
          >
            {word}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
