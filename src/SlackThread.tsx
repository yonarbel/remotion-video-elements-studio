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
import { ding } from "@remotion/sfx";
import { loadFont as loadLato } from "@remotion/google-fonts/Lato";

const { fontFamily: font } = loadLato("normal", {
  weights: ["400", "700", "900"],
  subsets: ["latin"],
});

const CL = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

const PURPLE = "#4A154B";
const ACTIVE_BG = "rgba(255,255,255,0.12)";
const SIDEBAR_TEXT = "rgba(255,255,255,0.7)";
const SIDEBAR_BOLD = "#FFFFFF";
const MAIN_BG = "#FFFFFF";
const TEXT_1 = "#1D1C1D";
const TEXT_2 = "#616061";
const TEXT_LINK = "#1264A3";
const MENTION_BG = "rgba(29,155,209,0.1)";
const BORDER = "#DDDDE1";
const BADGE_RED = "#E01E5A";
const REACTION_BG = "#F0F4FF";
const REACTION_BORDER = "#C6D8F0";
const CODE_BG = "#F8E7EE";
const CODE_TEXT = "#E01E5A";

interface Message {
  name: string;
  initials: string;
  avatar: string;
  time: string;
  segments: Segment[];
  reactions?: { emoji: string; count: number }[];
}

type Segment =
  | { type: "text"; value: string }
  | { type: "mention"; value: string }
  | { type: "code"; value: string }
  | { type: "emoji"; value: string };

const t = (value: string): Segment => ({ type: "text", value });
const m = (value: string): Segment => ({ type: "mention", value });
const c = (value: string): Segment => ({ type: "code", value });
const e = (value: string): Segment => ({ type: "emoji", value });

const MESSAGES: Message[] = [
  {
    name: "Alex Chen",
    initials: "AC",
    avatar: "#4A90D9",
    time: "2:34 PM",
    segments: [
      t("Hey, anyone else's "),
      c("npm install"),
      t(" suddenly failing? All my builds just went red "),
      e("😤"),
    ],
    reactions: [
      { emoji: "😤", count: 4 },
      { emoji: "👀", count: 2 },
    ],
  },
  {
    name: "Maria Santos",
    initials: "MS",
    avatar: "#2BAC76",
    time: "2:35 PM",
    segments: [
      t(
        "Same here. CI pipeline has been broken for the last 20 minutes across all our repos",
      ),
    ],
  },
  {
    name: "Jake Miller",
    initials: "JM",
    avatar: "#E8912D",
    time: "2:35 PM",
    segments: [
      t("Getting "),
      c("403 Forbidden"),
      t(" on half our dependencies. Is the registry down?"),
    ],
  },
  {
    name: "Priya Sharma",
    initials: "PS",
    avatar: "#9B59B6",
    time: "2:36 PM",
    segments: [
      m("@platform-team"),
      t(" can someone look into this ASAP? We have a release going out today"),
    ],
  },
  {
    name: "Tom Wilson",
    initials: "TW",
    avatar: "#E74C3C",
    time: "2:37 PM",
    segments: [
      t(
        "Just heard from ops — security team blocked a new batch of packages overnight ",
      ),
      e("🙃"),
    ],
    reactions: [{ emoji: "😩", count: 6 }],
  },
  {
    name: "Rachel Kim",
    initials: "RK",
    avatar: "#1ABC9C",
    time: "2:37 PM",
    segments: [
      t("We literally can't ship anything right now. 3 teams completely blocked "),
      e("🔥"),
    ],
  },
  {
    name: "David Liu",
    initials: "DL",
    avatar: "#F39C12",
    time: "2:38 PM",
    segments: [
      t("3rd time this quarter. There has to be a better way to do this…"),
    ],
    reactions: [
      { emoji: "💯", count: 8 },
      { emoji: "🙏", count: 3 },
    ],
  },
];

const MSG_FRAMES = [20, 42, 58, 72, 84, 94, 103];

const CHANNELS = [
  { name: "general", bold: false },
  { name: "random", bold: false },
  { name: "announcements", bold: false },
  { name: "engineering", bold: true, badge: true },
  { name: "engineering-help", bold: true, active: true },
  { name: "deployments", bold: false },
  { name: "incidents", bold: true, badge: true, badgeCount: 3 },
  { name: "devops-alerts", bold: true, badge: true, badgeCount: 7 },
  { name: "frontend", bold: false },
  { name: "backend", bold: false },
];

const RenderSegments: React.FC<{ segments: Segment[] }> = ({ segments }) => (
  <>
    {segments.map((seg, i) => {
      switch (seg.type) {
        case "mention":
          return (
            <span
              key={i}
              style={{
                color: TEXT_LINK,
                backgroundColor: MENTION_BG,
                borderRadius: 3,
                padding: "1px 3px",
                fontWeight: 400,
              }}
            >
              {seg.value}
            </span>
          );
        case "code":
          return (
            <span
              key={i}
              style={{
                backgroundColor: CODE_BG,
                color: CODE_TEXT,
                borderRadius: 4,
                padding: "2px 5px",
                fontSize: 14,
                fontFamily: "monospace",
              }}
            >
              {seg.value}
            </span>
          );
        case "emoji":
          return <span key={i}>{seg.value}</span>;
        default:
          return <React.Fragment key={i}>{seg.value}</React.Fragment>;
      }
    })}
  </>
);

const TypingDots: React.FC<{ frame: number }> = ({ frame }) => (
  <div style={{ display: "flex", gap: 3, alignItems: "center", height: 20 }}>
    {[0, 1, 2].map((i) => {
      const phase = ((frame * 0.1 + i * 0.8) % 1.5);
      const y = phase < 0.5 ? Math.sin(phase * Math.PI) * -4 : 0;
      return (
        <div
          key={i}
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            backgroundColor: TEXT_2,
            transform: `translateY(${y}px)`,
          }}
        />
      );
    })}
  </div>
);

export const SlackThread: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const windowIn = interpolate(frame, [0, 10], [0, 1], CL);
  const visibleCount = MSG_FRAMES.filter((f) => frame >= f).length;
  const engBadge = 5 + Math.min(visibleCount, 4);

  return (
    <AbsoluteFill
      style={{ backgroundColor: "#1A1D21", fontFamily: font, fontSize: 15 }}
    >
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          opacity: windowIn,
          overflow: "hidden",
        }}
      >
        {/* ── Sidebar ── */}
        <div
          style={{
            width: 280,
            backgroundColor: PURPLE,
            display: "flex",
            flexDirection: "column",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              padding: "18px 20px 14px",
              borderBottom: "1px solid rgba(255,255,255,0.08)",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <div
              style={{
                width: 26,
                height: 26,
                borderRadius: 6,
                backgroundColor: "#7C3085",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontSize: 14,
                fontWeight: 900,
              }}
            >
              T
            </div>
            <span
              style={{
                color: "#fff",
                fontSize: 17,
                fontWeight: 900,
                letterSpacing: -0.3,
              }}
            >
              TechCorp
            </span>
            <span style={{ color: SIDEBAR_TEXT, fontSize: 13, marginLeft: 2 }}>
              ▾
            </span>
          </div>

          <div
            style={{
              padding: "12px 0",
              display: "flex",
              flexDirection: "column",
              gap: 0,
            }}
          >
            <div
              style={{
                padding: "6px 20px 6px",
                color: SIDEBAR_TEXT,
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: 0.3,
              }}
            >
              Channels
            </div>
            {CHANNELS.map((ch) => (
              <div
                key={ch.name}
                style={{
                  padding: "5px 12px 5px 20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  backgroundColor: ch.active ? ACTIVE_BG : "transparent",
                  borderRadius: ch.active ? "0 6px 6px 0" : 0,
                  marginRight: ch.active ? 8 : 0,
                }}
              >
                <span
                  style={{
                    color:
                      ch.bold || ch.active ? SIDEBAR_BOLD : SIDEBAR_TEXT,
                    fontSize: 15,
                    fontWeight: ch.bold || ch.active ? 700 : 400,
                  }}
                >
                  # {ch.name}
                </span>
                {ch.badge && !ch.active && (
                  <span
                    style={{
                      backgroundColor: BADGE_RED,
                      color: "#fff",
                      fontSize: 12,
                      fontWeight: 700,
                      borderRadius: 10,
                      padding: "1px 7px",
                      minWidth: 18,
                      textAlign: "center" as const,
                      lineHeight: "18px",
                    }}
                  >
                    {ch.name === "engineering" ? engBadge : ch.badgeCount}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Main ── */}
        <div
          style={{
            flex: 1,
            backgroundColor: MAIN_BG,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "10px 24px",
              borderBottom: `1px solid ${BORDER}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span
                style={{
                  fontSize: 18,
                  fontWeight: 900,
                  color: TEXT_1,
                }}
              >
                # engineering-help
              </span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                color: TEXT_2,
                fontSize: 13,
              }}
            >
              <span>👤 847</span>
              <span>📌 4</span>
              <span style={{ fontSize: 18 }}>⋮</span>
            </div>
          </div>

          {/* Tabs */}
          <div
            style={{
              padding: "0 24px",
              borderBottom: `1px solid ${BORDER}`,
              display: "flex",
              gap: 20,
            }}
          >
            <span
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: TEXT_1,
                padding: "10px 0 8px",
                borderBottom: "2px solid #1264A3",
              }}
            >
              ● Messages
            </span>
            <span
              style={{
                fontSize: 13,
                color: TEXT_2,
                padding: "10px 0 8px",
              }}
            >
              Files
            </span>
          </div>

          {/* Messages area */}
          <div
            style={{
              flex: 1,
              padding: "12px 24px",
              display: "flex",
              flexDirection: "column",
              gap: 2,
              overflow: "hidden",
            }}
          >
            {/* Date separator */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                margin: "6px 0 12px",
                opacity: interpolate(frame, [8, 15], [0, 1], CL),
              }}
            >
              <div
                style={{ flex: 1, height: 1, backgroundColor: BORDER }}
              />
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: TEXT_2,
                  padding: "2px 14px",
                  border: `1px solid ${BORDER}`,
                  borderRadius: 20,
                  backgroundColor: "#fff",
                }}
              >
                Today
              </span>
              <div
                style={{ flex: 1, height: 1, backgroundColor: BORDER }}
              />
            </div>

            {/* Messages */}
            {MESSAGES.map((msg, i) => {
              const startFrame = MSG_FRAMES[i];
              if (frame < startFrame) return null;

              const msgSpring = spring({
                frame: frame - startFrame,
                fps,
                config: { damping: 14, stiffness: 160 },
              });
              const opacity = interpolate(
                msgSpring,
                [0, 1],
                [0, 1],
                CL,
              );
              const translateY = interpolate(
                msgSpring,
                [0, 1],
                [16, 0],
                CL,
              );

              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    gap: 12,
                    padding: "6px 8px",
                    opacity,
                    transform: `translateY(${translateY}px)`,
                    borderRadius: 8,
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 6,
                      backgroundColor: msg.avatar,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      fontSize: 13,
                      fontWeight: 700,
                      flexShrink: 0,
                      marginTop: 2,
                    }}
                  >
                    {msg.initials}
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 2,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "baseline",
                        gap: 8,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 15,
                          fontWeight: 900,
                          color: TEXT_1,
                        }}
                      >
                        {msg.name}
                      </span>
                      <span style={{ fontSize: 12, color: TEXT_2 }}>
                        {msg.time}
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: 15,
                        color: TEXT_1,
                        lineHeight: 1.5,
                      }}
                    >
                      <RenderSegments segments={msg.segments} />
                    </div>

                    {msg.reactions && msg.reactions.length > 0 && (
                      <div
                        style={{
                          display: "flex",
                          gap: 6,
                          marginTop: 4,
                        }}
                      >
                        {msg.reactions.map((r, ri) => (
                          <div
                            key={ri}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 4,
                              padding: "2px 8px",
                              borderRadius: 12,
                              backgroundColor: REACTION_BG,
                              border: `1px solid ${REACTION_BORDER}`,
                              fontSize: 12,
                            }}
                          >
                            <span>{r.emoji}</span>
                            <span
                              style={{
                                color: TEXT_LINK,
                                fontWeight: 700,
                                fontSize: 11,
                              }}
                            >
                              {r.count}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Typing indicator */}
            {frame >= 118 && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 8px",
                  opacity: interpolate(
                    spring({
                      frame: frame - 118,
                      fps,
                      config: { damping: 14, stiffness: 120 },
                    }),
                    [0, 1],
                    [0, 1],
                    CL,
                  ),
                }}
              >
                <TypingDots frame={frame - 118} />
                <span
                  style={{
                    fontSize: 13,
                    color: TEXT_2,
                    fontStyle: "italic",
                  }}
                >
                  Alex Chen, Priya Sharma, and 3 others are typing…
                </span>
              </div>
            )}
          </div>

          {/* Compose bar */}
          <div style={{ padding: "0 24px 20px" }}>
            <div
              style={{
                border: `1px solid #C4C4C4`,
                borderRadius: 10,
                overflow: "hidden",
              }}
            >
              <div style={{ padding: "12px 16px" }}>
                <span style={{ fontSize: 14, color: "#B0B0B0" }}>
                  Message #engineering-help
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "6px 12px",
                  borderTop: `1px solid ${BORDER}`,
                }}
              >
                <div style={{ display: "flex", gap: 4 }}>
                  {[
                    { label: "B", fw: 700 },
                    { label: "I", fs: "italic" },
                    { label: "U", td: "underline" },
                    { label: "S", td: "line-through" },
                    { label: "🔗" },
                    { label: "⟨⟩" },
                  ].map((btn, i) => (
                    <span
                      key={i}
                      style={{
                        fontSize: 13,
                        color: TEXT_2,
                        padding: "3px 7px",
                        borderRadius: 4,
                        fontWeight: (btn.fw as number) || 400,
                        fontStyle: (btn.fs as string) || "normal",
                        textDecoration: (btn.td as string) || "none",
                      }}
                    >
                      {btn.label}
                    </span>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span style={{ fontSize: 16, color: TEXT_2 }}>➕</span>
                  <span style={{ fontSize: 16, color: TEXT_2 }}>😊</span>
                  <span style={{ fontSize: 16, color: TEXT_2 }}>@</span>
                  <span style={{ fontSize: 16, color: TEXT_2 }}>🎥</span>
                  <span style={{ fontSize: 16, color: TEXT_2 }}>🎙️</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notification sounds — fade out as messages accelerate */}
      {MSG_FRAMES.map((f, i) => (
        <Sequence key={`sfx-${i}`} from={f} layout="none">
          <Audio src={ding} volume={Math.max(0.04, 0.16 - i * 0.02)} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
