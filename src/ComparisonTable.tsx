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
import { loadFont as loadSans } from "@remotion/google-fonts/Inter";
import { whoosh, whip } from "@remotion/sfx";

const { fontFamily: sans } = loadSans("normal", {
  weights: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
});

const JFROG_GREEN = "#40BE46";
const BG = "rgba(10, 12, 16, 0.96)";
const BORDER = "rgba(255,255,255,0.06)";

const CL = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

const SIZE_CONFIG = {
  small: {
    headerFont: 14,
    cellFont: 13,
    cellPadX: 20,
    cellPadY: 12,
    radius: 12,
    labelFont: 13,
    iconSize: 16,
  },
  medium: {
    headerFont: 18,
    cellFont: 16,
    cellPadX: 28,
    cellPadY: 16,
    radius: 16,
    labelFont: 16,
    iconSize: 20,
  },
  large: {
    headerFont: 24,
    cellFont: 22,
    cellPadX: 40,
    cellPadY: 22,
    radius: 20,
    labelFont: 22,
    iconSize: 26,
  },
} as const;

export const ComparisonTableSchema = z.object({
  headers: z.string(),
  rows: z.string(),
  accentColumn: z.number().min(0).max(10),
  size: z.enum(["small", "medium", "large"]),
  animateRows: z.boolean(),
});

const CheckIcon: React.FC<{ size: number; color: string }> = ({
  size,
  color,
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path
      d="M5 13l4 4L19 7"
      stroke={color}
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CrossIcon: React.FC<{ size: number; color: string }> = ({
  size,
  color,
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path
      d="M6 6l12 12M18 6L6 18"
      stroke={color}
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CellContent: React.FC<{
  text: string;
  iconSize: number;
  isAccent: boolean;
}> = ({ text, iconSize, isAccent }) => {
  const trimmed = text.trim();
  if (trimmed === "✓" || trimmed.toLowerCase() === "yes" || trimmed.toLowerCase() === "check") {
    return <CheckIcon size={iconSize} color={JFROG_GREEN} />;
  }
  if (trimmed === "✗" || trimmed === "✕" || trimmed.toLowerCase() === "no" || trimmed.toLowerCase() === "cross") {
    return <CrossIcon size={iconSize} color="rgba(255,100,100,0.7)" />;
  }
  return (
    <span style={{ color: isAccent ? "#fff" : "rgba(255,255,255,0.8)" }}>
      {trimmed}
    </span>
  );
};

export const ComparisonTable: React.FC<
  z.infer<typeof ComparisonTableSchema>
> = ({ headers: headersStr, rows: rowsStr, accentColumn, size = "medium", animateRows = true }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const sz = SIZE_CONFIG[size] ?? SIZE_CONFIG.medium;

  const headerCols = headersStr.split(",").map((s) => s.trim());
  const dataRows = rowsStr
    .split(";")
    .map((row) => row.split(",").map((c) => c.trim()));
  const colCount = headerCols.length;

  const exitStart = durationInFrames - Math.round(fps * 0.5);

  const enterScale = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 100 },
  });

  const exitProgress = interpolate(
    frame,
    [exitStart, durationInFrames],
    [0, 1],
    CL,
  );
  const exitOpacity = interpolate(exitProgress, [0, 1], [1, 0], CL);
  const exitScale = interpolate(exitProgress, [0, 1], [1, 0.95], CL);

  const headerDelay = Math.round(fps * 0.25);
  const headerVis = spring({
    frame,
    fps,
    delay: headerDelay,
    config: { damping: 14, stiffness: 120 },
  });

  const getRowVis = (rowIdx: number) => {
    if (!animateRows) return 1;
    const delay = headerDelay + Math.round(fps * 0.2) + rowIdx * Math.round(fps * 0.12);
    return spring({
      frame,
      fps,
      delay,
      config: { damping: 14, stiffness: 120 },
    });
  };

  const accentColBg = "rgba(64, 190, 70, 0.06)";
  const accentHeaderBg = "rgba(64, 190, 70, 0.12)";

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "transparent",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: sans,
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
          borderRadius: sz.radius,
          overflow: "hidden",
          boxShadow:
            "0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06)",
          background: BG,
          display: "grid",
          gridTemplateColumns: `auto ${Array(colCount - 1).fill("1fr").join(" ")}`,
        }}
      >
        {/* Header cells */}
        {headerCols.map((col, ci) => {
          const isAccent = ci === accentColumn;
          const isFirst = ci === 0;
          return (
            <div
              key={`h-${ci}`}
              style={{
                padding: `${sz.cellPadY + 4}px ${sz.cellPadX}px`,
                fontSize: sz.headerFont,
                fontWeight: 700,
                color: isAccent ? JFROG_GREEN : "rgba(255,255,255,0.9)",
                background: isAccent ? accentHeaderBg : "rgba(255,255,255,0.02)",
                borderBottom: `2px solid ${isAccent ? JFROG_GREEN + "40" : BORDER}`,
                borderRight: ci < colCount - 1 ? `1px solid ${BORDER}` : undefined,
                textAlign: isFirst ? "left" : "center",
                whiteSpace: "nowrap",
                opacity: headerVis,
                transform: `translateY(${interpolate(headerVis, [0, 1], [10, 0])}px)`,
              }}
            >
              {col}
              {isAccent && (
                <div
                  style={{
                    fontSize: sz.headerFont * 0.55,
                    fontWeight: 500,
                    color: JFROG_GREEN,
                    opacity: 0.7,
                    marginTop: 2,
                  }}
                >
                  ★ RECOMMENDED
                </div>
              )}
            </div>
          );
        })}

        {/* Data cells */}
        {dataRows.map((row, ri) => {
          const rowVis = getRowVis(ri);
          return headerCols.map((_, ci) => {
            const isAccent = ci === accentColumn;
            const isFirst = ci === 0;
            const cellText = row[ci] ?? "";
            const isLastRow = ri === dataRows.length - 1;
            return (
              <div
                key={`r${ri}-c${ci}`}
                style={{
                  padding: `${sz.cellPadY}px ${sz.cellPadX}px`,
                  fontSize: isFirst ? sz.labelFont : sz.cellFont,
                  fontWeight: isFirst ? 600 : 400,
                  background: isAccent ? accentColBg : undefined,
                  borderBottom: isLastRow ? undefined : `1px solid ${BORDER}`,
                  borderRight: ci < colCount - 1 ? `1px solid ${BORDER}` : undefined,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: isFirst ? "flex-start" : "center",
                  whiteSpace: "nowrap",
                  opacity: rowVis,
                  transform: `translateY(${interpolate(rowVis, [0, 1], [12, 0])}px)`,
                }}
              >
                <CellContent
                  text={cellText}
                  iconSize={sz.iconSize}
                  isAccent={isAccent}
                />
              </div>
            );
          });
        })}
      </div>
    </AbsoluteFill>
  );
};
