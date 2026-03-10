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
import { whoosh, mouseClick, whip } from "@remotion/sfx";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";
import { loadFont as loadSans } from "@remotion/google-fonts/Inter";

const { fontFamily: mono } = loadMono("normal", {
  weights: ["400", "500", "700"],
  subsets: ["latin"],
});
const { fontFamily: sans } = loadSans("normal", {
  weights: ["400", "600"],
  subsets: ["latin"],
});

const JFROG_GREEN = "#40BE46";

const CL = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

export const CommandOverlaySchema = z.object({
  command: z.string(),
  label: z.string(),
  prompt: z.string(),
  style: z.enum(["minimal", "terminal"]),
  size: z.enum(["small", "medium", "large"]),
  showLastLogin: z.boolean(),
});

const SIZE_CONFIG = {
  small:  { cmdFont: 20, promptFont: 20, labelFont: 13, pad: "14px 28px", minW: 400, radius: 12, termW: 780, titleFont: 13, titleBarH: 38, bodyPad: "20px 22px", loginFont: 14, cmdTermFont: 15, promptTermFont: 15, dirFont: 15, dotSize: 12, dotGap: 8 },
  medium: { cmdFont: 28, promptFont: 28, labelFont: 16, pad: "18px 36px", minW: 500, radius: 16, termW: 920, titleFont: 16, titleBarH: 48, bodyPad: "28px 30px", loginFont: 17, cmdTermFont: 20, promptTermFont: 20, dirFont: 20, dotSize: 14, dotGap: 10 },
  large:  { cmdFont: 36, promptFont: 36, labelFont: 20, pad: "24px 48px", minW: 620, radius: 20, termW: 1100, titleFont: 20, titleBarH: 58, bodyPad: "36px 40px", loginFont: 22, cmdTermFont: 26, promptTermFont: 26, dirFont: 26, dotSize: 16, dotGap: 12 },
} as const;

/* ─── Traffic-light dots (macOS title bar) ─── */
const TrafficLight: React.FC<{ opacity: number; dotSize?: number; dotGap?: number }> = ({
  opacity,
  dotSize = 12,
  dotGap = 8,
}) => (
  <div style={{ display: "flex", gap: dotGap, opacity }}>
    {(["#ff5f57", "#febc2e", "#28c840"] as const).map((c) => (
      <div
        key={c}
        style={{
          width: dotSize,
          height: dotSize,
          borderRadius: "50%",
          backgroundColor: c,
        }}
      />
    ))}
  </div>
);

/* ─── Shared typing logic ─── */
function useTyping(command: string, fps: number, durationInFrames: number) {
  const frame = useCurrentFrame();

  const ENTER_DURATION = Math.round(fps * 0.4);
  const TYPE_START = ENTER_DURATION + Math.round(fps * 0.2);
  const CHARS_PER_SEC = 14;
  const framesPerChar = Math.round(fps / CHARS_PER_SEC);
  const typingDuration = command.length * framesPerChar;
  const TYPE_END = TYPE_START + typingDuration;
  const exitStart = durationInFrames - Math.round(fps * 0.5);

  const charsVisible =
    frame < TYPE_START
      ? 0
      : frame >= TYPE_END
        ? command.length
        : Math.floor((frame - TYPE_START) / framesPerChar);

  const isTyping = frame >= TYPE_START && frame < TYPE_END;
  const typingDone = frame >= TYPE_END;
  const cursorVisible = isTyping || Math.floor(frame / 16) % 2 === 0;

  const keystrokeSoundFrames: number[] = [];
  const SOUND_EVERY_N_CHARS = 3;
  for (let i = 0; i < command.length; i += SOUND_EVERY_N_CHARS) {
    keystrokeSoundFrames.push(TYPE_START + i * framesPerChar);
  }

  const enterKeyFlash = typingDone
    ? interpolate(frame, [TYPE_END, TYPE_END + 8], [1, 0], CL)
    : 0;

  return {
    frame,
    charsVisible,
    cursorVisible,
    isTyping,
    typingDone,
    TYPE_START,
    TYPE_END,
    exitStart,
    keystrokeSoundFrames,
    enterKeyFlash,
  };
}

/* ─── Cursor bar ─── */
const CursorBar: React.FC<{ visible: boolean }> = ({ visible }) => (
  <span
    style={{
      display: "inline-block",
      width: 2,
      height: 22,
      backgroundColor: visible ? JFROG_GREEN : "transparent",
      marginLeft: 1,
      borderRadius: 1,
      boxShadow: visible ? `0 0 6px ${JFROG_GREEN}80` : "none",
    }}
  />
);

/* ═══════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════ */
export const CommandOverlay: React.FC<
  z.infer<typeof CommandOverlaySchema>
> = ({ command, label, prompt, style, size, showLastLogin }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const sz = SIZE_CONFIG[size];

  const typing = useTyping(command, fps, durationInFrames);

  // ── Enter ──
  const enterSpring = spring({
    frame,
    fps,
    delay: 0,
    config: { damping: 14, stiffness: 140 },
  });

  const labelFade = spring({
    frame,
    fps,
    delay: Math.round(fps * 0.15),
    config: { damping: 14, stiffness: 120 },
  });

  // ── Exit ──
  const exitProgress = interpolate(
    frame,
    [typing.exitStart, durationInFrames],
    [0, 1],
    CL,
  );
  const exitOpacity = interpolate(exitProgress, [0, 0.7, 1], [1, 1, 0], CL);

  // ── Sound sequences (shared) ──
  const sounds = (
    <>
      <Sequence from={0} layout="none">
        <Audio src={whoosh} volume={0.4} />
      </Sequence>
      {typing.keystrokeSoundFrames.map((f) => (
        <Sequence key={f} from={f} layout="none">
          <Audio src={mouseClick} volume={0.12} />
        </Sequence>
      ))}
      <Sequence from={typing.exitStart - Math.round(fps * 0.1)} layout="none">
        <Audio src={whip} volume={0.3} />
      </Sequence>
    </>
  );

  if (style === "terminal") {
    return (
      <TerminalStyle
        command={command}
        label={label}
        prompt={prompt}
        typing={typing}
        enterSpring={enterSpring}
        labelFade={labelFade}
        exitProgress={exitProgress}
        exitOpacity={exitOpacity}
        fps={fps}
        showLastLogin={showLastLogin}
        sz={sz}
      >
        {sounds}
      </TerminalStyle>
    );
  }

  return (
    <MinimalStyle
      command={command}
      label={label}
      prompt={prompt}
      typing={typing}
      enterSpring={enterSpring}
      labelFade={labelFade}
      exitProgress={exitProgress}
      exitOpacity={exitOpacity}
      fps={fps}
      showLastLogin={showLastLogin}
      sz={sz}
    >
      {sounds}
    </MinimalStyle>
  );
};

/* ═══════════════════════════════════════════════
   MINIMAL STYLE (floating bar)
   ═══════════════════════════════════════════════ */
interface StyleProps {
  command: string;
  label: string;
  prompt: string;
  typing: ReturnType<typeof useTyping>;
  enterSpring: number;
  labelFade: number;
  exitProgress: number;
  exitOpacity: number;
  fps: number;
  showLastLogin: boolean;
  sz: typeof SIZE_CONFIG[keyof typeof SIZE_CONFIG];
  children: React.ReactNode;
}

const MinimalStyle: React.FC<StyleProps> = ({
  command,
  label,
  prompt,
  typing,
  enterSpring,
  labelFade,
  exitProgress,
  exitOpacity,
  sz,
  children,
}) => {
  const enterY = interpolate(enterSpring, [0, 1], [120, 0]);
  const enterOpacity = interpolate(enterSpring, [0, 1], [0, 1], CL);
  const exitY = interpolate(exitProgress, [0, 1], [0, 120], CL);

  return (
    <AbsoluteFill style={{ backgroundColor: "transparent" }}>
      {children}
      <div
        style={{
          position: "absolute",
          bottom: 80,
          left: "50%",
          transform: `translateX(-50%) translateY(${enterY + exitY}px)`,
          opacity: enterOpacity * exitOpacity,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 8,
        }}
      >
        {label && (
          <div
            style={{
              fontFamily: sans,
              fontSize: sz.labelFont,
              fontWeight: 600,
              color: "rgba(255,255,255,0.5)",
              textTransform: "uppercase",
              letterSpacing: 1.5,
              opacity: labelFade,
              transform: `translateY(${interpolate(labelFade, [0, 1], [6, 0])}px)`,
            }}
          >
            {label}
          </div>
        )}

        <div
          style={{
            backgroundColor: "rgba(13, 17, 23, 0.95)",
            backdropFilter: "blur(24px)",
            border: "1px solid rgba(64, 190, 70, 0.2)",
            borderRadius: sz.radius,
            padding: sz.pad,
            display: "flex",
            alignItems: "center",
            boxShadow: `0 8px 40px rgba(0,0,0,0.55), 0 0 0 ${typing.enterKeyFlash * 2}px ${JFROG_GREEN}${Math.round(typing.enterKeyFlash * 40).toString(16).padStart(2, "0")}`,
            minWidth: sz.minW,
          }}
        >
          <span
            style={{
              fontFamily: mono,
              fontSize: sz.promptFont,
              fontWeight: 700,
              color: JFROG_GREEN,
              marginRight: 12,
            }}
          >
            {prompt}
          </span>
          <span
            style={{
              fontFamily: mono,
              fontSize: sz.cmdFont,
              fontWeight: 500,
              color: "#e6edf3",
              whiteSpace: "pre",
              letterSpacing: 0.3,
            }}
          >
            {command.slice(0, typing.charsVisible)}
          </span>
          <CursorBar visible={typing.cursorVisible} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ═══════════════════════════════════════════════
   TERMINAL STYLE (macOS window)
   ═══════════════════════════════════════════════ */
const TerminalStyle: React.FC<StyleProps> = ({
  command,
  label,
  prompt,
  typing,
  enterSpring,
  exitProgress,
  exitOpacity,
  fps,
  showLastLogin,
  sz,
  children,
}) => {
  const frame = useCurrentFrame();

  const scaleIn = interpolate(enterSpring, [0, 1], [0.88, 1]);
  const enterOpacity = interpolate(enterSpring, [0, 1], [0, 1], CL);

  const exitScale = interpolate(exitProgress, [0, 1], [1, 0.92], CL);

  const titleFade = spring({
    frame,
    fps,
    delay: Math.round(fps * 0.2),
    config: { damping: 14, stiffness: 120 },
  });

  const bodyFade = spring({
    frame,
    fps,
    delay: Math.round(fps * 0.3),
    config: { damping: 14, stiffness: 120 },
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "transparent" }}>
      {children}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: sz.termW,
            transform: `scale(${scaleIn * exitScale})`,
            opacity: enterOpacity * exitOpacity,
            borderRadius: 10,
            overflow: "hidden",
            boxShadow:
              "0 24px 80px rgba(0,0,0,0.65), 0 0 1px rgba(255,255,255,0.1)",
          }}
        >
          {/* ── Title bar ── */}
          <div
            style={{
              height: sz.titleBarH,
              backgroundColor: "#2d2d2d",
              display: "flex",
              alignItems: "center",
              padding: "0 14px",
              position: "relative",
            }}
          >
            <TrafficLight opacity={enterOpacity} dotSize={sz.dotSize} dotGap={sz.dotGap} />

            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                textAlign: "center",
                fontFamily: sans,
                fontSize: sz.titleFont,
                fontWeight: 600,
                color: "rgba(255,255,255,0.55)",
                opacity: titleFade,
                pointerEvents: "none",
              }}
            >
              {label || "Terminal"}
            </div>
          </div>

          {/* ── Body ── */}
          <div
            style={{
              backgroundColor: "#1a1b26",
              padding: sz.bodyPad,
              minHeight: sz.titleBarH * 4,
              opacity: bodyFade,
            }}
          >
            {showLastLogin && (
              <div
                style={{
                  fontFamily: mono,
                  fontSize: sz.loginFont,
                  color: "rgba(255,255,255,0.35)",
                  marginBottom: 14,
                  whiteSpace: "pre",
                }}
              >
                Last login: {new Date().toDateString()} on ttys001
              </div>
            )}

            {/* Prompt line */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  fontFamily: mono,
                  fontSize: sz.dirFont,
                  color: "#6c8ebf",
                  marginRight: 4,
                }}
              >
                ~
              </span>
              <span
                style={{
                  fontFamily: mono,
                  fontSize: sz.promptTermFont,
                  fontWeight: 700,
                  color: JFROG_GREEN,
                  marginRight: 10,
                }}
              >
                {prompt}
              </span>

              <span
                style={{
                  fontFamily: mono,
                  fontSize: sz.cmdTermFont,
                  fontWeight: 500,
                  color: "#e6edf3",
                  whiteSpace: "pre",
                  letterSpacing: 0.3,
                }}
              >
                {command.slice(0, typing.charsVisible)}
              </span>
              <CursorBar visible={typing.cursorVisible} />
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
