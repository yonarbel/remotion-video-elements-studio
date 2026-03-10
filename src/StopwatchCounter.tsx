import React from "react";
import { z } from "zod";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Audio,
  CalculateMetadataFunction,
} from "remotion";
import { loadFont as loadSans } from "@remotion/google-fonts/Inter";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";
import { whoosh, ding } from "@remotion/sfx";

const { fontFamily: sans } = loadSans("normal", {
  weights: ["400", "600", "700", "800"],
  subsets: ["latin"],
});
const { fontFamily: mono } = loadMono("normal", {
  weights: ["400", "700"],
  subsets: ["latin"],
});

const JFROG_GREEN = "#40BE46";

const CL = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

const SIZE_CONFIG = {
  small: { scale: 0.6 },
  medium: { scale: 0.85 },
  large: { scale: 1.1 },
} as const;

export const StopwatchCounterSchema = z.object({
  targetMinutes: z.number().min(0).max(59),
  targetSeconds: z.number().min(0).max(59),
  style: z.enum(["digital", "airport", "analog"]),
  size: z.enum(["small", "medium", "large"]),
  showMilliseconds: z.boolean(),
});

const ENTER_SECS = 0.5;
const BLINK_SECS = 2;
const EXIT_SECS = 0.6;

export const calculateStopwatchDuration: CalculateMetadataFunction<
  z.infer<typeof StopwatchCounterSchema>
> = ({ props, defaultProps, abortSignal: _a }) => {
  const p = { ...defaultProps, ...props };
  const totalTarget = p.targetMinutes * 60 + p.targetSeconds;
  const totalSecs = ENTER_SECS + totalTarget + BLINK_SECS + EXIT_SECS;
  return { durationInFrames: Math.ceil(totalSecs * 30), fps: 30 };
};

export const StopwatchCounter: React.FC<
  z.infer<typeof StopwatchCounterSchema>
> = ({ targetMinutes, targetSeconds, style, size = "medium", showMilliseconds = false }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const sc = SIZE_CONFIG[size] ?? SIZE_CONFIG.medium;
  const totalTargetSecs = targetMinutes * 60 + targetSeconds;

  const enterDur = Math.round(fps * ENTER_SECS);
  const exitDur = Math.round(fps * EXIT_SECS);
  const countEnd = enterDur + totalTargetSecs * fps;
  const blinkStart = countEnd;
  const exitStart = durationInFrames - exitDur;

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
  const exitScale = interpolate(exitProgress, [0, 1], [1, 0.92], CL);

  const elapsedSecs = Math.max(0, (frame - enterDur) / fps);
  const clampedElapsed = Math.min(elapsedSecs, totalTargetSecs);
  const currentSecs = Math.min(Math.floor(elapsedSecs), totalTargetSecs);
  const isDone = frame >= blinkStart && frame < exitStart;

  const displaySecs = isDone ? totalTargetSecs : currentSecs;
  const mm = Math.floor(displaySecs / 60);
  const ss = displaySecs % 60;
  const mmStr = String(mm).padStart(2, "0");
  const ssStr = String(ss).padStart(2, "0");

  const centiseconds = isDone
    ? 0
    : Math.floor((clampedElapsed % 1) * 100);
  const csStr = String(centiseconds).padStart(2, "0");

  const blinkOpacity = isDone
    ? interpolate(
        ((frame - blinkStart) % Math.round(fps * 0.4)) /
          Math.round(fps * 0.4),
        [0, 0.5, 1],
        [1, 0.3, 1],
        CL,
      )
    : 1;

  const dingFrame = countEnd;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "transparent",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Audio src={whoosh} startFrom={0} volume={0.4} />
      {frame >= dingFrame && frame < dingFrame + 2 && (
        <Audio src={ding} startFrom={0} volume={0.6} />
      )}
      <div
        style={{
          transform: `scale(${enterScale * exitScale * sc.scale})`,
          opacity: exitOpacity,
        }}
      >
        {style === "digital" && (
          <DigitalDisplay
            mm={mmStr}
            ss={ssStr}
            cs={csStr}
            showMs={showMilliseconds}
            blinkOpacity={blinkOpacity}
            isDone={isDone}
          />
        )}
        {style === "airport" && (
          <AirportDisplay
            mm={mmStr}
            ss={ssStr}
            cs={csStr}
            showMs={showMilliseconds}
            blinkOpacity={blinkOpacity}
            isDone={isDone}
            elapsedSecs={elapsedSecs}
          />
        )}
        {style === "analog" && (
          <AnalogDisplay
            totalSecs={displaySecs}
            totalTargetSecs={totalTargetSecs}
            blinkOpacity={blinkOpacity}
            isDone={isDone}
          />
        )}
      </div>
    </AbsoluteFill>
  );
};

/* ════════════════════════════════════════════════════════════════
   DIGITAL – LED / LCD segment style
   ════════════════════════════════════════════════════════════════ */
const DigitalDisplay: React.FC<{
  mm: string;
  ss: string;
  cs: string;
  showMs: boolean;
  blinkOpacity: number;
  isDone: boolean;
}> = ({ mm, ss, cs, showMs, blinkOpacity, isDone }) => {
  const color = isDone ? "#ff4444" : JFROG_GREEN;
  const glow = isDone
    ? "0 0 30px rgba(255,68,68,0.6), 0 0 60px rgba(255,68,68,0.3)"
    : `0 0 30px ${JFROG_GREEN}60, 0 0 60px ${JFROG_GREEN}30`;

  const digitStyle: React.CSSProperties = {
    fontFamily: mono,
    fontSize: 140,
    fontWeight: 700,
    color,
    letterSpacing: 4,
    textShadow: glow,
  };

  const sepStyle: React.CSSProperties = {
    ...digitStyle,
    fontSize: 120,
    opacity: 0.8,
    margin: "0 4px",
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "baseline",
        background: "rgba(10, 12, 16, 0.95)",
        borderRadius: 24,
        padding: "40px 64px",
        border: `2px solid ${isDone ? "rgba(255,68,68,0.3)" : "rgba(64,190,70,0.2)"}`,
        boxShadow: isDone
          ? "0 0 40px rgba(255,68,68,0.15), inset 0 0 60px rgba(255,68,68,0.05)"
          : `0 0 40px rgba(64,190,70,0.1), inset 0 0 60px rgba(64,190,70,0.03)`,
        opacity: blinkOpacity,
        gap: 8,
      }}
    >
      <span style={digitStyle}>{mm}</span>
      <span style={sepStyle}>:</span>
      <span style={digitStyle}>{ss}</span>
      {showMs && (
        <>
          <span style={{ ...sepStyle, fontSize: 80, margin: "0 2px" }}>.</span>
          <span
            style={{
              ...digitStyle,
              fontSize: 80,
              opacity: 0.7,
              fontVariantNumeric: "tabular-nums",
              minWidth: 120,
              display: "inline-block",
            }}
          >
            {cs}
          </span>
        </>
      )}
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════
   AIRPORT – Split-flap / Solari board style
   ════════════════════════════════════════════════════════════════ */
const FLAP_BG_TOP = "#1a1d24";
const FLAP_BG_BOT = "#14161c";
const FLAP_BORDER = "rgba(255,255,255,0.06)";

const FlapDigit: React.FC<{
  char: string;
  isDone: boolean;
  flipProgress: number;
}> = ({ char, isDone, flipProgress }) => {
  const w = 100;
  const h = 150;
  const fontSize = 120;
  const color = isDone ? "#ff4444" : "#e8e8e8";
  const flipAngle = interpolate(
    flipProgress % 1,
    [0, 0.5, 1],
    [0, -90, 0],
    CL,
  );
  const showNew = flipProgress % 1 > 0.5;

  return (
    <div
      style={{
        width: w,
        height: h,
        position: "relative",
        perspective: 400,
        margin: "0 3px",
      }}
    >
      {/* Top half (static) */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: w,
          height: h / 2,
          background: FLAP_BG_TOP,
          borderRadius: "10px 10px 0 0",
          overflow: "hidden",
          borderBottom: `1px solid ${FLAP_BORDER}`,
          boxShadow: "inset 0 -2px 6px rgba(0,0,0,0.3)",
        }}
      >
        <div
          style={{
            fontFamily: sans,
            fontSize,
            fontWeight: 800,
            color,
            position: "absolute",
            top: 0,
            left: 0,
            width: w,
            height: h,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {char}
        </div>
      </div>

      {/* Bottom half (static) */}
      <div
        style={{
          position: "absolute",
          top: h / 2,
          left: 0,
          width: w,
          height: h / 2,
          background: FLAP_BG_BOT,
          borderRadius: "0 0 10px 10px",
          overflow: "hidden",
          boxShadow: "inset 0 2px 6px rgba(0,0,0,0.2)",
        }}
      >
        <div
          style={{
            fontFamily: sans,
            fontSize,
            fontWeight: 800,
            color,
            position: "absolute",
            top: -(h / 2),
            left: 0,
            width: w,
            height: h,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {char}
        </div>
      </div>

      {/* Flipping flap */}
      {flipProgress % 1 > 0.01 && flipProgress % 1 < 0.99 && (
        <div
          style={{
            position: "absolute",
            top: showNew ? h / 2 : 0,
            left: 0,
            width: w,
            height: h / 2,
            background: showNew ? FLAP_BG_BOT : FLAP_BG_TOP,
            borderRadius: showNew ? "0 0 10px 10px" : "10px 10px 0 0",
            overflow: "hidden",
            transformOrigin: showNew ? "top" : "bottom",
            transform: `rotateX(${flipAngle}deg)`,
            boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
            zIndex: 2,
          }}
        >
          <div
            style={{
              fontFamily: sans,
              fontSize,
              fontWeight: 800,
              color,
              position: "absolute",
              top: showNew ? -(h / 2) : 0,
              left: 0,
              width: w,
              height: h,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {char}
          </div>
        </div>
      )}

      {/* Center line */}
      <div
        style={{
          position: "absolute",
          top: h / 2 - 1,
          left: 0,
          width: w,
          height: 2,
          background: "rgba(0,0,0,0.6)",
          zIndex: 3,
        }}
      />
    </div>
  );
};

const ColonDots: React.FC<{ isDone: boolean }> = ({ isDone }) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      gap: 24,
      margin: "0 10px",
    }}
  >
    {[0, 1].map((i) => (
      <div
        key={i}
        style={{
          width: 14,
          height: 14,
          borderRadius: "50%",
          background: isDone ? "#ff4444" : JFROG_GREEN,
          boxShadow: isDone
            ? "0 0 12px rgba(255,68,68,0.5)"
            : `0 0 12px ${JFROG_GREEN}50`,
        }}
      />
    ))}
  </div>
);

const AirportDisplay: React.FC<{
  mm: string;
  ss: string;
  cs: string;
  showMs: boolean;
  blinkOpacity: number;
  isDone: boolean;
  elapsedSecs: number;
}> = ({
  mm,
  ss,
  cs,
  showMs,
  blinkOpacity,
  isDone,
  elapsedSecs,
}) => {
  const flipSpeed = elapsedSecs * 0.3;
  const csFlip = elapsedSecs * 3;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        background: "rgba(8, 10, 14, 0.97)",
        borderRadius: 20,
        padding: "36px 48px",
        gap: 6,
        boxShadow:
          "0 8px 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.06)",
        opacity: blinkOpacity,
      }}
    >
      <FlapDigit char={mm[0]} isDone={isDone} flipProgress={flipSpeed} />
      <FlapDigit char={mm[1]} isDone={isDone} flipProgress={flipSpeed} />
      <ColonDots isDone={isDone} />
      <FlapDigit char={ss[0]} isDone={isDone} flipProgress={flipSpeed} />
      <FlapDigit char={ss[1]} isDone={isDone} flipProgress={flipSpeed} />
      {showMs && (
        <>
          <div
            style={{
              fontFamily: sans,
              fontSize: 100,
              fontWeight: 800,
              color: isDone ? "#ff4444" : "rgba(255,255,255,0.3)",
              margin: "0 4px",
              alignSelf: "center",
            }}
          >
            .
          </div>
          <FlapDigit char={cs[0]} isDone={isDone} flipProgress={csFlip} />
          <FlapDigit char={cs[1]} isDone={isDone} flipProgress={csFlip} />
        </>
      )}
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════
   ANALOG – Classic clock face with hands
   ════════════════════════════════════════════════════════════════ */
const AnalogDisplay: React.FC<{
  totalSecs: number;
  totalTargetSecs: number;
  blinkOpacity: number;
  isDone: boolean;
}> = ({ totalSecs, totalTargetSecs, blinkOpacity, isDone }) => {
  const size = 360;
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 20;

  const secAngle = (totalSecs % 60) * 6;
  const minAngle = Math.floor(totalSecs / 60) * 6 + (totalSecs % 60) * 0.1;

  const ticks = Array.from({ length: 60 }, (_, i) => i);
  const accentColor = isDone ? "#ff4444" : JFROG_GREEN;
  const progressFrac = totalTargetSecs > 0 ? totalSecs / totalTargetSecs : 0;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 24,
        opacity: blinkOpacity,
      }}
    >
      <div
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          background: "rgba(10, 12, 16, 0.97)",
          border: `3px solid ${isDone ? "rgba(255,68,68,0.4)" : "rgba(64,190,70,0.2)"}`,
          boxShadow: isDone
            ? "0 0 40px rgba(255,68,68,0.15), inset 0 0 40px rgba(0,0,0,0.5)"
            : `0 0 40px rgba(64,190,70,0.1), inset 0 0 40px rgba(0,0,0,0.5)`,
          position: "relative",
        }}
      >
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          style={{ position: "absolute", top: 0, left: 0 }}
        >
          {/* Progress arc */}
          <circle
            cx={cx}
            cy={cy}
            r={r - 8}
            fill="none"
            stroke={accentColor}
            strokeWidth={4}
            strokeDasharray={`${2 * Math.PI * (r - 8) * progressFrac} ${2 * Math.PI * (r - 8)}`}
            strokeLinecap="round"
            transform={`rotate(-90 ${cx} ${cy})`}
            opacity={0.4}
          />

          {/* Tick marks */}
          {ticks.map((i) => {
            const angle = (i * 6 * Math.PI) / 180;
            const isMajor = i % 5 === 0;
            const len = isMajor ? 14 : 6;
            const x1 = cx + (r - 2) * Math.sin(angle);
            const y1 = cy - (r - 2) * Math.cos(angle);
            const x2 = cx + (r - 2 - len) * Math.sin(angle);
            const y2 = cy - (r - 2 - len) * Math.cos(angle);
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={isMajor ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.2)"}
                strokeWidth={isMajor ? 2.5 : 1}
                strokeLinecap="round"
              />
            );
          })}

          {/* Minute numbers */}
          {[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map((i) => {
            const angle = (i * 6 * Math.PI) / 180;
            const nx = cx + (r - 34) * Math.sin(angle);
            const ny = cy - (r - 34) * Math.cos(angle);
            const label = i === 0 ? "60" : String(i);
            return (
              <text
                key={i}
                x={nx}
                y={ny}
                textAnchor="middle"
                dominantBaseline="central"
                fill="rgba(255,255,255,0.5)"
                fontSize={14}
                fontFamily={sans}
                fontWeight={600}
              >
                {label}
              </text>
            );
          })}

          {/* Minute hand */}
          <line
            x1={cx}
            y1={cy}
            x2={cx + (r - 60) * Math.sin((minAngle * Math.PI) / 180)}
            y2={cy - (r - 60) * Math.cos((minAngle * Math.PI) / 180)}
            stroke="rgba(255,255,255,0.85)"
            strokeWidth={5}
            strokeLinecap="round"
          />

          {/* Second hand */}
          <line
            x1={cx}
            y1={cy + 20}
            x2={cx + (r - 30) * Math.sin((secAngle * Math.PI) / 180)}
            y2={cy - (r - 30) * Math.cos((secAngle * Math.PI) / 180)}
            stroke={accentColor}
            strokeWidth={2.5}
            strokeLinecap="round"
          />

          {/* Center dot */}
          <circle cx={cx} cy={cy} r={6} fill={accentColor} />
          <circle cx={cx} cy={cy} r={3} fill="#0a0c10" />
        </svg>
      </div>

      {/* Digital readout below analog face */}
      <div
        style={{
          fontFamily: mono,
          fontSize: 36,
          fontWeight: 700,
          color: accentColor,
          letterSpacing: 3,
          textShadow: isDone
            ? "0 0 16px rgba(255,68,68,0.4)"
            : `0 0 16px ${JFROG_GREEN}40`,
        }}
      >
        {String(Math.floor(totalSecs / 60)).padStart(2, "0")}:
        {String(totalSecs % 60).padStart(2, "0")}
      </div>
    </div>
  );
};
