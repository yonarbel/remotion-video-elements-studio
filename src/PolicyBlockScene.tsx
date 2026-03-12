import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
  Sequence,
  Audio,
} from "remotion";
import { whoosh, mouseClick, whip, ding } from "@remotion/sfx";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";
import { loadFont as loadSans } from "@remotion/google-fonts/Inter";

const { fontFamily: mono } = loadMono("normal", {
  weights: ["400", "700"],
  subsets: ["latin"],
});
const { fontFamily: sans } = loadSans("normal", {
  weights: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
});

const BG = "#0c0c18";
const TERM_BG = "#191724";
const TITLE_BAR_BG = "#2a273f";
const TEXT = "#e0def4";
const DIM = "#6e6a86";
const GREEN = "#40BE46";
const GREEN_BRT = "#3ede8a";
const RED = "#E53935";
const CYAN = "#9ccfd8";
const YELLOW = "#f6c177";
const PURPLE = "#c4a7e7";
const WHITE = "#ffffff";

const CL = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

const TERM_W = 1300;
const TERM_H = 580;
const TITLE_H = 44;
const FONT_SIZE = 16;
const LINE_H = 26;
const PAD = 22;

const PROMPT = 'create-policy "Block any release with critical CVEs"';
const CHARS_PER_FRAME = 0.9;

const SPINNER = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];

type Token = { text: string; color: string };
const REGO: Token[][] = [
  [
    { text: "package ", color: PURPLE },
    { text: "jfrog.releases", color: TEXT },
  ],
  [{ text: "", color: TEXT }],
  [
    { text: "deny", color: RED },
    { text: "[msg] {", color: TEXT },
  ],
  [
    { text: "  some ", color: PURPLE },
    { text: "vuln ", color: TEXT },
    { text: "in ", color: PURPLE },
    { text: "input.vulnerabilities", color: CYAN },
  ],
  [
    { text: '  vuln.severity == ', color: TEXT },
    { text: '"CRITICAL"', color: GREEN_BRT },
  ],
  [
    { text: "  msg := ", color: TEXT },
    { text: "sprintf(", color: YELLOW },
    { text: '"Blocked: %s"', color: GREEN_BRT },
    { text: ", [vuln.id])", color: YELLOW },
  ],
  [{ text: "}", color: TEXT }],
];

export const PolicyBlockScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const sec = (s: number) => Math.round(s * fps);

  const fadeIn = (startSec: number, dur = 0.3) =>
    interpolate(frame, [sec(startSec), sec(startSec + dur)], [0, 1], CL);

  const slideUp = (startSec: number, dur = 0.3) =>
    interpolate(frame, [sec(startSec), sec(startSec + dur)], [14, 0], CL);

  /* ── Phase 1: Terminal ─────────────────────────── */

  const winSpring = spring({
    frame,
    fps,
    delay: sec(0.15),
    config: { damping: 15, stiffness: 120 },
  });

  const TYPING_START = 0.8;
  const typingFrames = Math.ceil(PROMPT.length / CHARS_PER_FRAME);
  const typedChars = Math.min(
    PROMPT.length,
    Math.max(0, Math.floor((frame - sec(TYPING_START)) * CHARS_PER_FRAME)),
  );
  const typingDone = typedChars >= PROMPT.length;
  const cursorOn = Math.floor(frame / (fps * 0.5)) % 2 === 0;

  const TYPING_END = TYPING_START + typingFrames / fps;

  const ANALYZING = TYPING_END + 0.5;
  const REGO_START = ANALYZING + 0.9;
  const REGO_LINE_DT = 0.12;
  const REGO_END = REGO_START + REGO.length * REGO_LINE_DT;

  const STEP1 = REGO_END + 0.5;
  const STEP2 = STEP1 + 0.5;
  const STEP3 = STEP2 + 0.5;
  const GATE_ACTIVE = STEP3 + 0.5;

  /* ── Keystroke sound frames ──────────────────────── */

  const CLICK_EVERY = 4;
  const clickFrames: number[] = [];
  for (let i = 0; i < PROMPT.length; i += CLICK_EVERY) {
    clickFrames.push(sec(TYPING_START) + Math.round(i / CHARS_PER_FRAME));
  }

  /* ── Phase 2: Transition ───────────────────────── */

  const TRANSITION_START = GATE_ACTIVE + 1.0;
  const termFadeOut = interpolate(
    frame,
    [sec(TRANSITION_START), sec(TRANSITION_START + 0.5)],
    [1, 0],
    CL,
  );
  const termScaleDown = interpolate(
    frame,
    [sec(TRANSITION_START), sec(TRANSITION_START + 0.5)],
    [1, 0.94],
    CL,
  );

  const THIRTY_SEC = TRANSITION_START + 0.3;
  const THIRTY_SEC_END = THIRTY_SEC + 1.6;
  const thirtyIn = fadeIn(THIRTY_SEC, 0.4);
  const thirtyOut = interpolate(
    frame,
    [sec(THIRTY_SEC_END), sec(THIRTY_SEC_END + 0.3)],
    [1, 0],
    CL,
  );

  /* ── Phase 3: Block ────────────────────────────── */

  const CARD_START = THIRTY_SEC_END + 0.2;
  const STAMP_START = CARD_START + 0.9;

  const cardSpring = spring({
    frame,
    fps,
    delay: sec(CARD_START),
    config: { damping: 14, stiffness: 120 },
  });

  const stampSpring = spring({
    frame,
    fps,
    delay: sec(STAMP_START),
    config: { damping: 8, stiffness: 180, overshootClamping: false },
  });

  const glowPulse =
    frame >= sec(STAMP_START)
      ? 0.25 + 0.15 * Math.sin((frame - sec(STAMP_START)) * 0.15)
      : 0;

  /* ── Phase 4: Punchline ────────────────────────── */

  const PUNCH_START = STAMP_START + 2.2;
  const blockFadeOut = interpolate(
    frame,
    [sec(PUNCH_START), sec(PUNCH_START + 0.5)],
    [1, 0],
    CL,
  );
  const punchIn = fadeIn(PUNCH_START + 0.3, 0.6);

  /* ── Terminal content lines ────────────────────── */

  const winScale = interpolate(winSpring, [0, 1], [0.93, 1]);
  const winOp = interpolate(winSpring, [0, 1], [0, 1]);

  const lines: React.ReactNode[] = [];

  // Prompt line
  lines.push(
    <div key="cmd" style={{ display: "flex", flexWrap: "wrap" }}>
      <span style={{ color: CYAN }}>~</span>
      <span style={{ color: DIM }}>&nbsp;»&nbsp;</span>
      <span style={{ color: TEXT }}>{PROMPT.slice(0, typedChars)}</span>
      {frame >= sec(TYPING_START) &&
        !typingDone &&
        cursorOn && <span style={{ color: TEXT, opacity: 0.7 }}>▌</span>}
      {typingDone && frame < sec(ANALYZING) && cursorOn && (
        <span style={{ color: TEXT, opacity: 0.7 }}>▌</span>
      )}
    </div>,
  );

  // Analyzing spinner → done
  if (frame >= sec(ANALYZING)) {
    if (frame < sec(REGO_START)) {
      const idx =
        Math.floor((frame - sec(ANALYZING)) / 3) % SPINNER.length;
      lines.push(
        <div
          key="spin"
          style={{
            opacity: fadeIn(ANALYZING, 0.15),
            transform: `translateY(${slideUp(ANALYZING, 0.15)}px)`,
            marginTop: 6,
          }}
        >
          <span style={{ color: YELLOW }}>{SPINNER[idx]}</span>
          <span style={{ color: TEXT }}>&nbsp;&nbsp;Analyzing prompt...</span>
        </div>,
      );
    } else {
      lines.push(
        <div
          key="spin-done"
          style={{ opacity: fadeIn(REGO_START, 0.15), marginTop: 6 }}
        >
          <span style={{ color: GREEN_BRT }}>✓</span>
          <span style={{ color: TEXT }}>&nbsp;&nbsp;Generated Rego policy</span>
        </div>,
      );
    }
  }

  // Rego code block
  if (frame >= sec(REGO_START)) {
    lines.push(
      <div
        key="rego"
        style={{
          marginTop: 6,
          marginBottom: 6,
          padding: "10px 14px",
          backgroundColor: "rgba(255,255,255,0.025)",
          borderLeft: `2px solid ${PURPLE}60`,
          borderRadius: 4,
        }}
      >
        {REGO.map((tokens, i) => {
          const t = REGO_START + i * REGO_LINE_DT;
          if (frame < sec(t)) return null;
          const isEmpty = tokens.length === 1 && tokens[0].text === "";
          return (
            <div
              key={i}
              style={{
                opacity: fadeIn(t, 0.1),
                transform: `translateY(${slideUp(t, 0.1)}px)`,
                height: isEmpty ? LINE_H * 0.35 : LINE_H,
                display: "flex",
              }}
            >
              {tokens.map((tok, j) => (
                <span key={j} style={{ color: tok.color }}>
                  {tok.text}
                </span>
              ))}
            </div>
          );
        })}
      </div>,
    );
  }

  // Step completion lines
  const steps: { time: number; icon: string; text: string; color: string }[] =
    [
      {
        time: STEP1,
        icon: "✓",
        text: "Policy written  block_critical_cves.rego",
        color: GREEN_BRT,
      },
      { time: STEP2, icon: "✓", text: "Policy signed", color: GREEN_BRT },
      {
        time: STEP3,
        icon: "✓",
        text: "Installed on release gate",
        color: GREEN_BRT,
      },
      {
        time: GATE_ACTIVE,
        icon: "●",
        text: "Gate active — monitoring releases",
        color: GREEN,
      },
    ];

  for (const s of steps) {
    if (frame >= sec(s.time)) {
      lines.push(
        <div
          key={s.text}
          style={{
            opacity: fadeIn(s.time, 0.2),
            transform: `translateY(${slideUp(s.time, 0.2)}px)`,
          }}
        >
          <span style={{ color: s.color }}>{s.icon}</span>
          <span style={{ color: TEXT }}>&nbsp;&nbsp;{s.text}</span>
        </div>,
      );
    }
  }

  const showBlock = frame >= sec(CARD_START - 0.1);
  const showPunch = frame >= sec(PUNCH_START);

  return (
    <AbsoluteFill style={{ backgroundColor: BG }}>
      {/* ═══ SOUND EFFECTS ═══ */}
      <Sequence from={sec(0.15)} layout="none">
        <Audio src={whoosh} volume={0.35} />
      </Sequence>
      {clickFrames.map((f) => (
        <Sequence key={`k${f}`} from={f} layout="none">
          <Audio src={mouseClick} volume={0.1} />
        </Sequence>
      ))}
      <Sequence from={sec(STEP1)} layout="none">
        <Audio src={ding} volume={0.18} />
      </Sequence>
      <Sequence from={sec(STEP2)} layout="none">
        <Audio src={ding} volume={0.18} />
      </Sequence>
      <Sequence from={sec(STEP3)} layout="none">
        <Audio src={ding} volume={0.18} />
      </Sequence>
      <Sequence from={sec(GATE_ACTIVE)} layout="none">
        <Audio src={ding} volume={0.3} />
      </Sequence>
      <Sequence from={sec(TRANSITION_START)} layout="none">
        <Audio src={whip} volume={0.3} />
      </Sequence>
      <Sequence from={sec(CARD_START)} layout="none">
        <Audio src={whoosh} volume={0.35} />
      </Sequence>
      <Sequence from={sec(STAMP_START)} layout="none">
        <Audio src={whip} volume={0.5} />
      </Sequence>
      <Sequence from={sec(PUNCH_START + 0.3)} layout="none">
        <Audio src={whoosh} volume={0.25} />
      </Sequence>

      {/* Ambient glow */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at 50% 40%, rgba(40,48,72,0.3) 0%, transparent 70%)",
        }}
      />

      {/* Red glow during block phase */}
      {showBlock && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `radial-gradient(ellipse at 50% 50%, rgba(229,57,53,${glowPulse * blockFadeOut}) 0%, transparent 55%)`,
          }}
        />
      )}

      {/* ═══ TERMINAL WINDOW ═══ */}
      <div
        style={{
          position: "absolute",
          left: (1920 - TERM_W) / 2,
          top: (1080 - TERM_H) / 2 - 20,
          width: TERM_W,
          height: TERM_H,
          borderRadius: 12,
          overflow: "hidden",
          boxShadow:
            "0 30px 90px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06)",
          transform: `scale(${winScale * termScaleDown})`,
          opacity: winOp * termFadeOut,
          fontFamily: mono,
          fontSize: FONT_SIZE,
          lineHeight: `${LINE_H}px`,
        }}
      >
        {/* Title bar */}
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
            {(["#ff5f57", "#febc2e", "#28c840"] as const).map((c) => (
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
              fontFamily: sans,
              fontWeight: 500,
              letterSpacing: 0.3,
            }}
          >
            Coding Agent
          </div>
        </div>

        {/* Body */}
        <div
          style={{
            backgroundColor: TERM_BG,
            height: TERM_H - TITLE_H,
            padding: PAD,
            display: "flex",
            flexDirection: "column",
            gap: 2,
            overflow: "hidden",
          }}
        >
          {lines}
        </div>
      </div>

      {/* ═══ "30 SECONDS LATER..." ═══ */}
      {frame >= sec(THIRTY_SEC) && frame < sec(THIRTY_SEC_END + 0.5) && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: thirtyIn * thirtyOut,
          }}
        >
          <div
            style={{
              fontFamily: sans,
              fontSize: 64,
              fontWeight: 700,
              color: WHITE,
              letterSpacing: -1,
              textShadow: "0 0 60px rgba(255,255,255,0.12)",
            }}
          >
            30 seconds later...
          </div>
        </div>
      )}

      {/* ═══ RELEASE CARD + BLOCKED STAMP ═══ */}
      {showBlock && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: blockFadeOut,
          }}
        >
          {/* Release card */}
          <div
            style={{
              width: 700,
              padding: "44px 52px",
              backgroundColor: "rgba(25,23,36,0.95)",
              border: `1px solid ${RED}40`,
              borderRadius: 16,
              boxShadow: `0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(229,57,53,${glowPulse * 0.4})`,
              transform: `scale(${interpolate(cardSpring, [0, 1], [0.85, 1])})`,
              opacity: interpolate(cardSpring, [0, 1], [0, 1], CL),
              fontFamily: sans,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                marginBottom: 24,
              }}
            >
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 14,
                  backgroundColor: "rgba(229,57,53,0.12)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 26,
                }}
              >
                📦
              </div>
              <div>
                <div
                  style={{ fontSize: 30, fontWeight: 700, color: WHITE }}
                >
                  Release v2.4.1
                </div>
                <div
                  style={{ fontSize: 16, color: DIM, marginTop: 3 }}
                >
                  myapp:latest → production
                </div>
              </div>
            </div>

            {/* CVE badge */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "14px 18px",
                backgroundColor: "rgba(229,57,53,0.08)",
                border: `1px solid ${RED}30`,
                borderRadius: 10,
              }}
            >
              <div
                style={{
                  padding: "4px 12px",
                  backgroundColor: RED,
                  borderRadius: 6,
                  fontSize: 13,
                  fontWeight: 700,
                  color: WHITE,
                  letterSpacing: 0.5,
                }}
              >
                CRITICAL
              </div>
              <div
                style={{
                  fontSize: 17,
                  color: TEXT,
                  fontFamily: mono,
                  fontWeight: 700,
                }}
              >
                CVE-2024-3094
              </div>
              <div style={{ fontSize: 14, color: DIM }}>
                XZ Utils backdoor
              </div>
            </div>
          </div>

          {/* BLOCKED stamp */}
          <div
            style={{
              position: "absolute",
              transform: `scale(${interpolate(stampSpring, [0, 1], [3, 1])}) rotate(-8deg)`,
              opacity: interpolate(stampSpring, [0, 1], [0, 1], CL),
            }}
          >
            <div
              style={{
                padding: "18px 56px",
                border: `6px solid ${RED}`,
                borderRadius: 14,
                fontFamily: sans,
                fontSize: 80,
                fontWeight: 800,
                color: RED,
                letterSpacing: 10,
                textShadow: `0 0 40px ${RED}50, 0 0 80px ${RED}25`,
                backgroundColor: "rgba(229,57,53,0.06)",
              }}
            >
              BLOCKED
            </div>
          </div>
        </div>
      )}

      {/* ═══ PUNCHLINE ═══ */}
      {showPunch && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 20,
            opacity: punchIn,
            transform: `translateY(${interpolate(punchIn, [0, 1], [24, 0])}px)`,
          }}
        >
          <div
            style={{
              fontFamily: sans,
              fontSize: 56,
              fontWeight: 700,
              color: WHITE,
              letterSpacing: -0.5,
            }}
          >
            No Rego expertise.
          </div>
          <div
            style={{
              fontFamily: sans,
              fontSize: 56,
              fontWeight: 700,
              color: WHITE,
              letterSpacing: -0.5,
            }}
          >
            No manual config.
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};
