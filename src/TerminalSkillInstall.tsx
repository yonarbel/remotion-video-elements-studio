import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from "remotion";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";
import { loadFont as loadSans } from "@remotion/google-fonts/Inter";

const { fontFamily: monoFont } = loadMono("normal", {
  weights: ["400", "700"],
  subsets: ["latin"],
});

const { fontFamily: sansFont } = loadSans("normal", {
  weights: ["400", "500"],
  subsets: ["latin"],
});

const BG_OUTER = "#0c0c18";
const BG_TERM = "#191724";
const TITLE_BAR_BG = "#2a273f";
const TEXT = "#e0def4";
const DIM = "#6e6a86";
const CYAN = "#9ccfd8";
const YELLOW = "#f6c177";
const GREEN = "#31c48d";
const GREEN_BRIGHT = "#3ede8a";
const BLUE = "#7aa2f7";
const TEAL_BG = "#1a5276";
const ASCII_TOP = "#b4befe";
const ASCII_BOT = "#585b70";

const RED_DOT = "#ff5f57";
const YELLOW_DOT = "#febc2e";
const GREEN_DOT = "#28c840";

const TERM_W = 1720;
const TERM_H = 940;
const TITLE_H = 44;
const FONT_SIZE = 17;
const LINE_H = 28;
const PAD = 24;

const SKILLS_ART = [
  " ███████ ██   ██ ██ ██      ██      ███████",
  " ██      ██  ██  ██ ██      ██      ██     ",
  " ███████ █████   ██ ██      ██      ███████",
  "      ██ ██  ██  ██ ██      ██           ██",
  " ███████ ██   ██ ██ ███████ ███████ ███████",
];

const COMMAND =
  "npx skills add https://github.com/remotion-dev/skills --skill remotion-best-practices";

const CHARS_PER_FRAME = 1.5;

export const TerminalSkillInstall: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const sec = (s: number) => Math.round(s * fps);

  const fadeIn = (startSec: number, dur = 0.25) =>
    interpolate(frame, [sec(startSec), sec(startSec + dur)], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

  const slideUp = (startSec: number, dur = 0.25) =>
    interpolate(frame, [sec(startSec), sec(startSec + dur)], [12, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

  const winSpring = spring({
    frame,
    fps,
    delay: sec(0.15),
    config: { damping: 15, stiffness: 120 },
  });

  const TYPING_START = 1.0;
  const typingFrames = Math.ceil(COMMAND.length / CHARS_PER_FRAME);
  const typedChars = Math.min(
    COMMAND.length,
    Math.max(0, Math.floor((frame - sec(TYPING_START)) * CHARS_PER_FRAME)),
  );
  const isTyping =
    frame >= sec(TYPING_START) && typedChars < COMMAND.length;

  const cursorOn = Math.floor(frame / (fps * 0.5)) % 2 === 0;

  const TYPING_END_SEC = TYPING_START + typingFrames / fps;
  const NPM1 = TYPING_END_SEC + 0.6;
  const NPM2 = NPM1 + 0.4;
  const NPM3 = NPM2 + 0.4;
  const ART_START = NPM3 + 0.9;
  const ART_DT = 0.16;
  const ART_END = ART_START + SKILLS_ART.length * ART_DT;
  const BADGE = ART_END + 0.7;
  const PIPE = BADGE + 0.2;
  const SOURCE = PIPE + 0.5;
  const CLONED = SOURCE + 0.7;
  const FOUND = CLONED + 0.6;
  const SELECTED = FOUND + 0.6;
  const AGENTS = SELECTED + 0.6;
  const FINAL_PROMPT = AGENTS + 0.7;

  const winScale = interpolate(winSpring, [0, 1], [0.93, 1]);
  const winOp = interpolate(winSpring, [0, 1], [0, 1]);

  const content: React.ReactNode[] = [];

  content.push(
    <div key="cmd" style={{ display: "flex", flexWrap: "wrap" }}>
      <span style={{ color: CYAN }}>~/workspaces/jfrog.com/jfrog-cli</span>
      <span>&nbsp;</span>
      <span style={{ color: YELLOW }}>(rt-skills-package*)</span>
      <span style={{ color: DIM }}>&nbsp;»&nbsp;</span>
      <span style={{ color: TEXT }}>{COMMAND.slice(0, typedChars)}</span>
      {(isTyping || (frame >= sec(TYPING_START) && frame < sec(NPM1))) &&
        cursorOn && (
          <span style={{ color: TEXT, opacity: 0.7 }}>▌</span>
        )}
    </div>,
  );

  if (frame >= sec(NPM1)) {
    content.push(
      <div
        key="npm1"
        style={{
          opacity: fadeIn(NPM1),
          transform: `translateY(${slideUp(NPM1)}px)`,
          color: TEXT,
        }}
      >
        Need to install the following packages:
      </div>,
    );
  }

  if (frame >= sec(NPM2)) {
    content.push(
      <div
        key="npm2"
        style={{
          opacity: fadeIn(NPM2),
          transform: `translateY(${slideUp(NPM2)}px)`,
          color: TEXT,
        }}
      >
        skills@1.4.3
      </div>,
    );
  }

  if (frame >= sec(NPM3)) {
    content.push(
      <div
        key="npm3"
        style={{
          opacity: fadeIn(NPM3),
          transform: `translateY(${slideUp(NPM3)}px)`,
          color: TEXT,
        }}
      >
        Ok to proceed? (y)
      </div>,
    );
  }

  if (frame >= sec(ART_START)) {
    content.push(<div key="blank1" style={{ height: LINE_H * 0.4 }} />);

    SKILLS_ART.forEach((line, i) => {
      const t = ART_START + i * ART_DT;
      if (frame >= sec(t)) {
        const blend = i / (SKILLS_ART.length - 1);
        const color = lerpColor(ASCII_TOP, ASCII_BOT, blend);
        content.push(
          <div
            key={`art-${i}`}
            style={{
              opacity: fadeIn(t, 0.15),
              transform: `translateY(${slideUp(t, 0.15)}px)`,
              color,
              fontWeight: 700,
              fontSize: FONT_SIZE * 1.5,
              lineHeight: `${LINE_H * 1.35}px`,
              letterSpacing: "2px",
            }}
          >
            {line}
          </div>,
        );
      }
    });

    content.push(<div key="blank2" style={{ height: LINE_H * 0.4 }} />);
  }

  if (frame >= sec(BADGE)) {
    content.push(
      <div
        key="badge"
        style={{
          opacity: fadeIn(BADGE),
          transform: `translateY(${slideUp(BADGE)}px)`,
        }}
      >
        <span style={{ color: DIM }}>┌{"  "}</span>
        <span
          style={{
            color: TEXT,
            backgroundColor: TEAL_BG,
            padding: "3px 12px",
            borderRadius: 4,
            fontWeight: 700,
            fontSize: FONT_SIZE * 0.9,
          }}
        >
          skills
        </span>
      </div>,
    );
  }

  if (frame >= sec(PIPE)) {
    content.push(
      <div key="pipe" style={{ opacity: fadeIn(PIPE), color: DIM }}>
        │
      </div>,
    );
  }

  if (frame >= sec(SOURCE)) {
    content.push(
      <div
        key="source"
        style={{
          opacity: fadeIn(SOURCE),
          transform: `translateY(${slideUp(SOURCE)}px)`,
        }}
      >
        <span style={{ color: GREEN }}>◇{"  "}</span>
        <span style={{ color: TEXT }}>Source: </span>
        <span style={{ color: DIM }}>
          https://github.com/remotion-dev/skills.git
        </span>
      </div>,
    );
  }

  if (frame >= sec(CLONED)) {
    content.push(
      <div
        key="cloned"
        style={{
          opacity: fadeIn(CLONED),
          transform: `translateY(${slideUp(CLONED)}px)`,
        }}
      >
        <span style={{ color: GREEN }}>◇{"  "}</span>
        <span style={{ color: TEXT, fontWeight: 700 }}>Repository cloned</span>
      </div>,
    );
  }

  if (frame >= sec(FOUND)) {
    content.push(
      <div
        key="found"
        style={{
          opacity: fadeIn(FOUND),
          transform: `translateY(${slideUp(FOUND)}px)`,
        }}
      >
        <span style={{ color: GREEN }}>◇{"  "}</span>
        <span style={{ color: TEXT }}>Found </span>
        <span style={{ color: TEXT, fontWeight: 700 }}>1</span>
        <span style={{ color: TEXT }}> skill</span>
      </div>,
    );
  }

  if (frame >= sec(SELECTED)) {
    content.push(
      <div
        key="selected"
        style={{
          opacity: fadeIn(SELECTED),
          transform: `translateY(${slideUp(SELECTED)}px)`,
        }}
      >
        <span style={{ color: BLUE }}>●{"  "}</span>
        <span style={{ color: TEXT }}>Selected </span>
        <span style={{ color: TEXT, fontWeight: 700 }}>1</span>
        <span style={{ color: TEXT }}> skill: </span>
        <span style={{ color: GREEN_BRIGHT, fontWeight: 700 }}>
          remotion-best-practices
        </span>
      </div>,
    );
  }

  if (frame >= sec(AGENTS)) {
    content.push(
      <div
        key="agents"
        style={{
          opacity: fadeIn(AGENTS),
          transform: `translateY(${slideUp(AGENTS)}px)`,
        }}
      >
        <span style={{ color: GREEN }}>◇{"  "}</span>
        <span style={{ color: TEXT }}>41 agents</span>
      </div>,
    );
  }

  if (frame >= sec(FINAL_PROMPT)) {
    content.push(
      <div
        key="final"
        style={{
          opacity: fadeIn(FINAL_PROMPT),
          marginTop: LINE_H * 0.5,
        }}
      >
        <span style={{ color: CYAN }}>~/workspaces/jfrog.com/jfrog-cli</span>
        <span>&nbsp;</span>
        <span style={{ color: YELLOW }}>(rt-skills-package*)</span>
        <span style={{ color: DIM }}>&nbsp;»&nbsp;</span>
        {cursorOn && (
          <span style={{ color: TEXT, opacity: 0.7 }}>▌</span>
        )}
      </div>,
    );
  }

  return (
    <AbsoluteFill style={{ backgroundColor: BG_OUTER }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at 50% 40%, rgba(40,48,72,0.35) 0%, transparent 70%)",
        }}
      />

      <div
        style={{
          position: "absolute",
          left: (1920 - TERM_W) / 2,
          top: (1080 - TERM_H) / 2,
          width: TERM_W,
          height: TERM_H,
          borderRadius: 12,
          overflow: "hidden",
          boxShadow:
            "0 30px 90px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06)",
          transform: `scale(${winScale})`,
          opacity: winOp,
          fontFamily: monoFont,
          fontSize: FONT_SIZE,
          lineHeight: `${LINE_H}px`,
        }}
      >
        <div
          style={{
            height: TITLE_H,
            backgroundColor: TITLE_BAR_BG,
            display: "flex",
            alignItems: "center",
            padding: "0 16px",
            borderBottom: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <div style={{ display: "flex", gap: 8 }}>
            {[RED_DOT, YELLOW_DOT, GREEN_DOT].map((c) => (
              <div
                key={c}
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: 7,
                  backgroundColor: c,
                }}
              />
            ))}
          </div>
          <div
            style={{
              flex: 1,
              textAlign: "center",
              color: DIM,
              fontSize: 13,
              fontFamily: sansFont,
              fontWeight: 500,
              letterSpacing: "0.3px",
            }}
          >
            npx skills add https://github.com/remotion-dev/skills --skill
          </div>
          <div
            style={{ color: DIM, fontSize: 12, fontFamily: sansFont }}
          >
            ⌥⌘1
          </div>
        </div>

        <div
          style={{
            backgroundColor: BG_TERM,
            height: TERM_H - TITLE_H,
            padding: PAD,
            display: "flex",
            flexDirection: "column",
            gap: 2,
            overflow: "hidden",
          }}
        >
          {content}
        </div>
      </div>
    </AbsoluteFill>
  );
};

function lerpColor(a: string, b: string, t: number): string {
  const pa = hexToRgb(a);
  const pb = hexToRgb(b);
  const r = Math.round(pa.r + (pb.r - pa.r) * t);
  const g = Math.round(pa.g + (pb.g - pa.g) * t);
  const bl = Math.round(pa.b + (pb.b - pa.b) * t);
  return `rgb(${r},${g},${bl})`;
}

function hexToRgb(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}
