import React from "react";
import { z } from "zod";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Audio,
} from "remotion";
import { Highlight, themes, type PrismTheme } from "prism-react-renderer";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";
import { loadFont as loadSans } from "@remotion/google-fonts/Inter";
import { whoosh, whip } from "@remotion/sfx";
import { zTextarea } from "@remotion/zod-types";

const { fontFamily: mono } = loadMono("normal", {
  weights: ["400", "700"],
  subsets: ["latin"],
});
const { fontFamily: sans } = loadSans("normal", {
  weights: ["400", "600"],
  subsets: ["latin"],
});

const CL = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

const LANGUAGES = [
  "javascript",
  "typescript",
  "jsx",
  "tsx",
  "python",
  "bash",
  "json",
  "yaml",
  "go",
  "rust",
  "java",
  "csharp",
  "css",
  "html",
  "sql",
  "markdown",
  "xml",
  "ruby",
  "php",
  "swift",
] as const;

const THEME_MAP: Record<string, PrismTheme> = {
  dracula: themes.dracula,
  "vs-dark": themes.vsDark,
  "night-owl": themes.nightOwl,
  "one-dark": themes.oneDark,
  "synthwave-84": themes.synthwave84,
  "oceanic-next": themes.oceanicNext,
  palenight: themes.palenight,
  okaidia: themes.okaidia,
};

const THEME_NAMES = Object.keys(THEME_MAP) as [string, ...string[]];

const SIZE_CONFIG = {
  small: {
    fontSize: 14,
    lineHeight: 22,
    padX: 24,
    padY: 18,
    numW: 36,
    titleFont: 13,
    titleBarH: 36,
    dotSize: 11,
    dotGap: 7,
    radius: 12,
  },
  medium: {
    fontSize: 18,
    lineHeight: 28,
    padX: 32,
    padY: 24,
    numW: 44,
    titleFont: 15,
    titleBarH: 44,
    dotSize: 13,
    dotGap: 8,
    radius: 16,
  },
  large: {
    fontSize: 24,
    lineHeight: 36,
    padX: 40,
    padY: 32,
    numW: 56,
    titleFont: 18,
    titleBarH: 52,
    dotSize: 15,
    dotGap: 10,
    radius: 20,
  },
} as const;

export const CodeSnippetSchema = z.object({
  code: zTextarea(),
  language: z.enum(LANGUAGES),
  theme: z.enum(THEME_NAMES),
  title: z.string(),
  showLineNumbers: z.boolean(),
  highlightLines: z.string(),
  animateHighlight: z.boolean(),
  singleHighlight: z.boolean(),
  animation: z.enum(["none", "typewriter", "line-by-line"]),
  size: z.enum(["small", "medium", "large"]),
});

const TrafficLights: React.FC<{
  opacity: number;
  dotSize: number;
  dotGap: number;
}> = ({ opacity, dotSize, dotGap }) => (
  <div style={{ display: "flex", gap: dotGap, opacity }}>
    {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
      <div
        key={c}
        style={{
          width: dotSize,
          height: dotSize,
          borderRadius: "50%",
          background: c,
        }}
      />
    ))}
  </div>
);

export const CodeSnippet: React.FC<z.infer<typeof CodeSnippetSchema>> = ({
  code,
  language,
  theme: themeName = "dracula",
  title,
  showLineNumbers,
  highlightLines: hlStr,
  animateHighlight = false,
  singleHighlight = false,
  animation = "line-by-line",
  size = "medium",
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const sz = SIZE_CONFIG[size] ?? SIZE_CONFIG.medium;
  const prismTheme = THEME_MAP[themeName] ?? themes.dracula;

  const hlLines = hlStr
    .split(",")
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => !isNaN(n));
  const hlSet = new Set(hlLines);

  const exitStart = durationInFrames - Math.round(fps * 0.5);

  const enterScale = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 120 },
  });

  const exitProgress = interpolate(
    frame,
    [exitStart, durationInFrames],
    [0, 1],
    CL,
  );
  const exitOpacity = interpolate(exitProgress, [0, 1], [1, 0], CL);
  const exitScale = interpolate(exitProgress, [0, 1], [1, 0.95], CL);

  const enterDelay = Math.round(fps * 0.3);
  const lineCount = code.split("\n").length;

  const getLineVisibility = (lineIdx: number) => {
    if (animation === "none") return 1;
    if (animation === "line-by-line") {
      const lineDelay = enterDelay + lineIdx * Math.round(fps * 0.15);
      return spring({
        frame,
        fps,
        delay: lineDelay,
        config: { damping: 16, stiffness: 140 },
      });
    }
    return 1;
  };

  const codeRenderDone =
    animation === "line-by-line"
      ? enterDelay + lineCount * Math.round(fps * 0.15) + Math.round(fps * 0.4)
      : animation === "typewriter"
        ? enterDelay + Math.ceil(code.length / 1.2) + Math.round(fps * 0.3)
        : enterDelay + Math.round(fps * 0.3);

  const hlStart = codeRenderDone + Math.round(fps * 0.3);
  const hlEnd = exitStart - Math.round(fps * 0.2);
  const hlCount = hlLines.length;
  const hlStepDuration = hlCount > 0 ? (hlEnd - hlStart) / hlCount : 0;

  const getActiveHlIndex = (): number => {
    if (!animateHighlight || hlCount === 0 || frame < hlStart) return -1;
    const idx = Math.floor((frame - hlStart) / hlStepDuration);
    return Math.min(idx, hlCount - 1);
  };

  const activeHlIdx = getActiveHlIndex();

  const isLineHighlighted = (lineNum: number): boolean => {
    if (!hlSet.has(lineNum)) return false;
    if (!animateHighlight) return true;
    if (activeHlIdx < 0) return false;
    const posInList = hlLines.indexOf(lineNum);
    if (posInList < 0) return false;
    if (singleHighlight) return posInList === activeHlIdx;
    return posInList <= activeHlIdx;
  };

  const getHighlightOpacity = (lineNum: number): number => {
    if (!isLineHighlighted(lineNum)) return 0;
    if (!animateHighlight) return 1;
    const posInList = hlLines.indexOf(lineNum);
    const stepStart = hlStart + posInList * hlStepDuration;
    const fadeIn = interpolate(
      frame,
      [stepStart, stepStart + Math.round(fps * 0.15)],
      [0, 1],
      CL,
    );
    if (singleHighlight && posInList < activeHlIdx) return 0;
    return fadeIn;
  };

  const getTypewriterChars = () => {
    if (animation !== "typewriter") return code.length;
    const charsPerFrame = 1.2;
    const typeStart = enterDelay;
    return Math.floor(
      Math.max(0, (frame - typeStart) * charsPerFrame),
    );
  };

  const visibleChars = getTypewriterChars();

  const getVisibleCode = () => {
    if (animation !== "typewriter") return code;
    return code.slice(0, visibleChars);
  };

  const displayCode = getVisibleCode();
  const cursorVisible =
    animation === "typewriter" &&
    visibleChars < code.length &&
    frame > enterDelay;
  const cursorBlink =
    cursorVisible && Math.floor(frame / 4) % 2 === 0;

  const bgColor = prismTheme.plain.backgroundColor ?? "#1e1e1e";

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "transparent",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Audio src={whoosh} startFrom={0} volume={0.3} />
      {frame >= exitStart && frame < exitStart + 2 && (
        <Audio src={whip} startFrom={0} volume={0.3} />
      )}

      <div
        style={{
          transform: `scale(${enterScale * exitScale})`,
          opacity: exitOpacity,
          display: "inline-block",
          borderRadius: sz.radius,
          overflow: "hidden",
          boxShadow:
            "0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06)",
        }}
      >
        <div
          style={{
            height: sz.titleBarH,
            background: darken(bgColor, 0.15),
            display: "flex",
            alignItems: "center",
            padding: `0 ${sz.padX}px`,
            gap: 14,
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            minWidth: 300,
          }}
        >
          <TrafficLights
            opacity={enterScale}
            dotSize={sz.dotSize}
            dotGap={sz.dotGap}
          />
          {title && (
            <div
              style={{
                fontFamily: sans,
                fontSize: sz.titleFont,
                color: "rgba(255,255,255,0.5)",
                flex: 1,
                textAlign: "center",
                marginRight: sz.dotSize * 3 + sz.dotGap * 2,
              }}
            >
              {title}
            </div>
          )}
        </div>

        {/* Code area */}
        <Highlight theme={prismTheme} code={displayCode} language={language}>
          {({ tokens, getLineProps, getTokenProps, style }) => (
            <pre
              style={{
                ...style,
                margin: 0,
                padding: `${sz.padY}px 0`,
                fontFamily: mono,
                fontSize: sz.fontSize,
                lineHeight: `${sz.lineHeight}px`,
                background: bgColor,
                whiteSpace: "pre",
              }}
            >
              {tokens.map((line, i) => {
                const lineVis =
                  animation === "typewriter" ? 1 : getLineVisibility(i);
                const lineNum = i + 1;
                const hlOpacity = getHighlightOpacity(lineNum);
                const isHl = hlOpacity > 0;
                const lineProps = getLineProps({ line });

                const dimNonHighlighted =
                  animateHighlight && activeHlIdx >= 0 && !isHl && hlSet.has(lineNum)
                    ? 0.35
                    : animateHighlight && activeHlIdx >= 0 && !hlSet.has(lineNum)
                      ? 0.6
                      : 1;

                return (
                  <div
                    key={i}
                    {...lineProps}
                    style={{
                      ...lineProps.style,
                      display: "flex",
                      opacity: lineVis * dimNonHighlighted,
                      transform:
                        animation === "line-by-line"
                          ? `translateX(${interpolate(lineVis, [0, 1], [16, 0])}px)`
                          : undefined,
                      background: isHl
                        ? `rgba(255,255,255,${0.07 * hlOpacity})`
                        : undefined,
                      borderLeft: isHl
                        ? `3px solid rgba(64,190,70,${hlOpacity})`
                        : hlSet.has(lineNum)
                          ? "3px solid rgba(64,190,70,0.15)"
                          : "3px solid transparent",
                      padding: `0 ${sz.padX}px`,
                      transition: "opacity 0.15s ease, background 0.15s ease, border-left-color 0.15s ease",
                    }}
                  >
                    {showLineNumbers && (
                      <span
                        style={{
                          width: sz.numW,
                          display: "inline-block",
                          color: isHl
                            ? `rgba(255,255,255,${0.3 + 0.3 * hlOpacity})`
                            : "rgba(255,255,255,0.2)",
                          textAlign: "right",
                          marginRight: sz.padX * 0.6,
                          userSelect: "none",
                          flexShrink: 0,
                          fontVariantNumeric: "tabular-nums",
                        }}
                      >
                        {lineNum}
                      </span>
                    )}
                    <span style={{ flex: 1 }}>
                      {line.map((token, key) => {
                        const tokenProps = getTokenProps({ token });
                        return <span key={key} {...tokenProps} />;
                      })}
                    </span>
                  </div>
                );
              })}
              {cursorBlink && (
                <span
                  style={{
                    position: "absolute",
                    background: "#fff",
                    width: sz.fontSize * 0.55,
                    height: sz.lineHeight,
                    opacity: 0.8,
                  }}
                />
              )}
            </pre>
          )}
        </Highlight>
      </div>
    </AbsoluteFill>
  );
};

function darken(hex: string, amount: number): string {
  const c = hex.replace("#", "");
  const num = parseInt(c.length === 3 ? c.split("").map(x => x + x).join("") : c, 16);
  const r = Math.max(0, Math.round(((num >> 16) & 255) * (1 - amount)));
  const g = Math.max(0, Math.round(((num >> 8) & 255) * (1 - amount)));
  const b = Math.max(0, Math.round((num & 255) * (1 - amount)));
  return `rgb(${r},${g},${b})`;
}
