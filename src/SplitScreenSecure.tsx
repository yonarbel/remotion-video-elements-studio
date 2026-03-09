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
  weights: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

const BG = "#0e1117";
const TERM_BG = "#191724";
const TERM_TITLE_BG = "#2a273f";
const T_TEXT = "#e0def4";
const T_DIM = "#6e6a86";
const T_CYAN = "#9ccfd8";
const T_GREEN = "#31c48d";
const T_GREEN_BRIGHT = "#3ede8a";

const JF_SIDEBAR = "#1e2d3d";
const JF_GREEN = "#40be46";
const JF_MAIN_BG = "#f5f6f8";
const JF_CARD = "#ffffff";
const JF_TEXT = "#2d3436";
const JF_TEXT_MED = "#636e72";
const JF_TEXT_LIGHT = "#9ea7ac";
const JF_BORDER = "#e4e7ea";
const JF_ACCENT_BAR = "#3b82c4";
const JF_BADGE_GREEN_BG = "#e6f4ea";

const LEFT_W = 960;
const SIDEBAR_W = 190;

const PUBLISH_STEPS = [
  { text: "Packaging skill frogs-best-practices...", dim: true },
  { text: "Bundled 62 rules, 1 SKILL.md", icon: "diamond" as const },
  { text: "Signing package via JFrog Evidence...", icon: "diamond" as const },
  { text: "Uploading to my-skills-repo...", icon: "diamond" as const },
  { text: "Running Xray security scan...", icon: "diamond" as const },
  { text: "Skill published successfully", icon: "check" as const, bold: true },
];

const NAV_ITEMS = [
  { label: "Artifactory", indent: 0, icon: "circle" as const },
  { label: "Packages", indent: 1, active: true },
  { label: "Builds", indent: 1 },
  { label: "Artifacts", indent: 1 },
  { label: "Release Lifecycle", indent: 1 },
  { label: "Xray", indent: 0, icon: "eye" as const },
  { label: "Distribution", indent: 0, icon: "arrow" as const },
  { label: "AI/ML", indent: 0, icon: "globe" as const },
  { label: "Connect", indent: 0, icon: "people" as const },
  { label: "Pipelines", indent: 0, icon: "gear" as const },
];

const INFO_ROWS = [
  { icon: "check", label: "Version", value: "1.0.0", isBadge: true },
  { icon: "cal", label: "Published Date", value: "03-03-26 21:32:23 +0200" },
  { icon: "dl", label: "Version Downloads", value: "142" },
  { icon: "shield", label: "Vulnerabilities", value: "vuln" },
  { icon: "tag", label: "Licenses", value: "MIT" },
];

export const SplitScreenSecure: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const sec = (s: number) => Math.round(s * fps);

  const fade = (t: number, dur = 0.3) =>
    interpolate(frame, [sec(t), sec(t + dur)], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

  const slideY = (t: number, dist = 14, dur = 0.3) =>
    interpolate(frame, [sec(t), sec(t + dur)], [dist, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

  const slideX = (t: number, dist: number, dur = 0.3) =>
    interpolate(frame, [sec(t), sec(t + dur)], [dist, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

  const leftSpring = spring({
    frame,
    fps,
    delay: sec(0.2),
    config: { damping: 200 },
  });
  const rightSpring = spring({
    frame,
    fps,
    delay: sec(0.35),
    config: { damping: 200 },
  });

  const LABEL_T = 0.5;
  const STEP_START = 1.5;
  const STEP_DT = 0.65;
  const STEP_END = STEP_START + (PUBLISH_STEPS.length - 1) * STEP_DT + 0.3;
  const DETAIL_T = STEP_END + 0.5;
  const DONE_T = DETAIL_T + 1.8;

  const SIDEBAR_T = 1.0;
  const NAV_DT = 0.06;
  const BREADCRUMB_T = 1.6;
  const VERSION_DD_T = 2.0;
  const CARD_T = 2.4;
  const ROW_START = 3.2;
  const ROW_DT = 0.4;
  const VULN_SCAN_T = 7.0;
  const VULN_CHECK_T = 8.2;

  const checkSpring = spring({
    frame,
    fps,
    delay: sec(VULN_CHECK_T),
    config: { damping: 12, stiffness: 150 },
  });

  const vulnGlow = interpolate(
    frame,
    [sec(VULN_CHECK_T), sec(VULN_CHECK_T + 0.4), sec(VULN_CHECK_T + 1.5)],
    [0, 0.6, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <AbsoluteFill style={{ backgroundColor: BG, fontFamily: sansFont }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at 50% 40%, rgba(30,45,61,0.2) 0%, transparent 70%)",
        }}
      />

      {/* ── Left Panel: Rapid Development ── */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: LEFT_W,
          height: 1080,
          opacity: leftSpring,
          transform: `translateX(${interpolate(leftSpring, [0, 1], [-25, 0])}px)`,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 28,
            left: 36,
            opacity: fade(LABEL_T),
            transform: `translateY(${slideY(LABEL_T)}px)`,
          }}
        >
          <div
            style={{
              fontSize: 26,
              fontWeight: 700,
              color: "#fff",
              letterSpacing: "-0.5px",
            }}
          >
            Publish Skill
          </div>
          <div
            style={{
              fontSize: 14,
              color: "rgba(255,255,255,0.35)",
              marginTop: 4,
            }}
          >
            Package, sign &amp; publish to JFrog
          </div>
        </div>

        {/* Terminal window */}
        <div
          style={{
            position: "absolute",
            left: 26,
            top: 92,
            right: 16,
            bottom: 32,
            borderRadius: 12,
            overflow: "hidden",
            boxShadow: "0 20px 60px rgba(0,0,0,0.45)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div
            style={{
              height: 36,
              backgroundColor: TERM_TITLE_BG,
              display: "flex",
              alignItems: "center",
              padding: "0 14px",
              borderBottom: "1px solid rgba(255,255,255,0.05)",
            }}
          >
            <div style={{ display: "flex", gap: 7 }}>
              {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
                <div
                  key={c}
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 6,
                    backgroundColor: c,
                  }}
                />
              ))}
            </div>
            <div
              style={{
                flex: 1,
                textAlign: "center",
                color: T_DIM,
                fontSize: 12,
                fontFamily: sansFont,
              }}
            >
              Terminal — jf skill publish
            </div>
          </div>

          <div
            style={{
              backgroundColor: TERM_BG,
              height: "calc(100% - 36px)",
              padding: "18px 20px",
              fontFamily: monoFont,
              fontSize: 14.5,
              lineHeight: "24px",
              overflow: "hidden",
            }}
          >
            {/* Command line */}
            <div style={{ opacity: fade(0.9), marginBottom: 10 }}>
              <span style={{ color: T_CYAN }}>~/project</span>
              <span style={{ color: T_DIM }}> » </span>
              <span style={{ color: T_TEXT }}>
                jf skill publish frogs-best-practices \
              </span>
            </div>
            <div style={{ opacity: fade(0.9), marginBottom: 10 }}>
              <span style={{ color: T_TEXT }}>
                {"  "}--repo my-skills-repo --version 1.0.0
              </span>
            </div>

            {/* Publish steps */}
            {PUBLISH_STEPS.map((step, i) => {
              const t = STEP_START + i * STEP_DT;
              if (frame < sec(t)) return null;

              const isCheck = step.icon === "check";
              const iconSpring = spring({
                frame,
                fps,
                delay: sec(t + 0.15),
                config: { damping: 15, stiffness: 200 },
              });

              return (
                <div
                  key={i}
                  style={{
                    opacity: fade(t, 0.2),
                    transform: `translateX(${slideX(t, -12, 0.2)}px)`,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 3,
                  }}
                >
                  {step.dim ? (
                    <span style={{ color: T_DIM }}>{step.text}</span>
                  ) : (
                    <>
                      <span
                        style={{
                          color: isCheck ? T_GREEN_BRIGHT : T_GREEN,
                          transform: `scale(${iconSpring})`,
                          display: "inline-block",
                          width: 16,
                          textAlign: "center",
                        }}
                      >
                        {isCheck ? "✓" : "◇"}
                      </span>
                      <span
                        style={{
                          color: T_TEXT,
                          fontWeight: step.bold ? 700 : 400,
                        }}
                      >
                        {step.text}
                      </span>
                    </>
                  )}
                </div>
              );
            })}

            {/* Publish detail block */}
            {frame >= sec(DETAIL_T) && (
              <>
                <div style={{ height: 10 }} />
                {[
                  {
                    label: "  frogs-best-practices",
                    val: "v1.0.0",
                    t: DETAIL_T,
                  },
                  {
                    label: "  Repository:",
                    val: "my-skills-repo",
                    t: DETAIL_T + 0.3,
                  },
                  {
                    label: "  Package:",
                    val: "62 rules, 1 SKILL.md",
                    t: DETAIL_T + 0.6,
                  },
                  {
                    label: "  Xray scan:",
                    val: "passed — 0 vulnerabilities",
                    t: DETAIL_T + 0.9,
                  },
                ].map((line) =>
                  frame >= sec(line.t) ? (
                    <div
                      key={line.label}
                      style={{
                        opacity: fade(line.t, 0.2),
                        transform: `translateY(${slideY(line.t, 6, 0.2)}px)`,
                        display: "flex",
                        gap: 6,
                        marginBottom: 1,
                      }}
                    >
                      <span style={{ color: T_DIM }}>{line.label}</span>
                      <span style={{ color: T_TEXT }}>{line.val}</span>
                    </div>
                  ) : null,
                )}
              </>
            )}

            {/* Available message */}
            {frame >= sec(DONE_T) && (
              <>
                <div style={{ height: 12 }} />
                <div
                  style={{
                    opacity: fade(DONE_T),
                    transform: `translateY(${slideY(DONE_T)}px)`,
                  }}
                >
                  <span style={{ color: T_GREEN }}>◇ </span>
                  <span style={{ color: T_TEXT }}>
                    Available for all agents
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Divider ── */}
      <div
        style={{
          position: "absolute",
          left: LEFT_W - 1,
          top: 0,
          width: 2,
          height: 1080,
          background:
            "linear-gradient(180deg, transparent 5%, rgba(255,255,255,0.07) 25%, rgba(255,255,255,0.07) 75%, transparent 95%)",
        }}
      />

      {/* ── Right Panel: JFrog Dashboard ── */}
      <div
        style={{
          position: "absolute",
          left: LEFT_W,
          top: 0,
          width: 1920 - LEFT_W,
          height: 1080,
          opacity: rightSpring,
          transform: `translateX(${interpolate(rightSpring, [0, 1], [25, 0])}px)`,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 28,
            left: 24,
            opacity: fade(LABEL_T + 0.1),
            transform: `translateY(${slideY(LABEL_T + 0.1)}px)`,
            zIndex: 10,
          }}
        >
          <div
            style={{
              fontSize: 26,
              fontWeight: 700,
              color: "#fff",
              letterSpacing: "-0.5px",
            }}
          >
            Secure Repository
          </div>
          <div
            style={{
              fontSize: 14,
              color: "rgba(255,255,255,0.35)",
              marginTop: 4,
            }}
          >
            JFrog Platform — verified &amp; vulnerability-free
          </div>
        </div>

        {/* Dashboard frame */}
        <div
          style={{
            position: "absolute",
            left: 16,
            top: 92,
            right: 26,
            bottom: 32,
            borderRadius: 12,
            overflow: "hidden",
            boxShadow: "0 20px 60px rgba(0,0,0,0.45)",
            border: "1px solid rgba(255,255,255,0.06)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Top bar with JFrog branding + tabs */}
          <div
            style={{
              backgroundColor: JF_SIDEBAR,
              display: "flex",
              alignItems: "center",
              padding: "0 18px",
              height: 44,
              flexShrink: 0,
              opacity: fade(SIDEBAR_T),
            }}
          >
            <span
              style={{
                color: JF_GREEN,
                fontWeight: 700,
                fontStyle: "italic",
                fontSize: 17,
              }}
            >
              JFrog
            </span>
            <span
              style={{
                color: "#fff",
                fontSize: 17,
                fontWeight: 500,
                marginLeft: 4,
              }}
            >
              {" "}
              Platform
            </span>
            <div
              style={{
                marginLeft: 40,
                display: "flex",
                gap: 22,
                fontSize: 13,
              }}
            >
              <span style={{ color: JF_GREEN, fontWeight: 600 }}>
                Platform
              </span>
              <span style={{ color: "rgba(255,255,255,0.45)" }}>
                Administration
              </span>
            </div>
          </div>

          {/* Blue accent bar */}
          <div
            style={{
              height: 3,
              background: `linear-gradient(90deg, ${JF_ACCENT_BAR}, #5ba3d9)`,
              flexShrink: 0,
            }}
          />

          {/* Body: sidebar + content */}
          <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
            {/* Sidebar nav */}
            <div
              style={{
                width: SIDEBAR_W,
                backgroundColor: JF_SIDEBAR,
                paddingTop: 8,
                flexShrink: 0,
                borderRight: "1px solid rgba(255,255,255,0.06)",
                opacity: fade(SIDEBAR_T),
              }}
            >
              {NAV_ITEMS.map((item, i) => {
                const t = SIDEBAR_T + 0.1 + i * NAV_DT;
                const isActive = item.active;
                return (
                  <div
                    key={item.label}
                    style={{
                      opacity: fade(t, 0.15),
                      padding: `${item.indent ? 6 : 9}px 16px`,
                      paddingLeft: item.indent ? 38 : 16,
                      color: isActive
                        ? JF_GREEN
                        : item.indent
                          ? "rgba(255,255,255,0.45)"
                          : "rgba(255,255,255,0.7)",
                      fontSize: item.indent ? 13 : 14,
                      fontWeight: isActive ? 600 : 400,
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      backgroundColor: isActive
                        ? "rgba(64,190,70,0.08)"
                        : "transparent",
                      borderLeft: isActive
                        ? `3px solid ${JF_GREEN}`
                        : "3px solid transparent",
                    }}
                  >
                    {!item.indent && (
                      <NavIcon type={item.icon || "circle"} />
                    )}
                    {item.label}
                  </div>
                );
              })}
            </div>

            {/* Main content */}
            <div
              style={{
                flex: 1,
                backgroundColor: JF_MAIN_BG,
                padding: "16px 20px",
                overflow: "hidden",
              }}
            >
              {/* Breadcrumb */}
              {frame >= sec(BREADCRUMB_T) && (
                <div
                  style={{
                    opacity: fade(BREADCRUMB_T),
                    fontSize: 12,
                    color: JF_TEXT_MED,
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    marginBottom: 14,
                  }}
                >
                  {[
                    "All Projects",
                    "Artifactory",
                    "Packages",
                    "frogs-best-pra...",
                  ].map((crumb, i, arr) => (
                    <React.Fragment key={crumb}>
                      <span
                        style={{
                          fontWeight: i === arr.length - 1 ? 600 : 400,
                          color:
                            i === arr.length - 1 ? JF_TEXT : JF_TEXT_MED,
                        }}
                      >
                        {crumb}
                      </span>
                      {i < arr.length - 1 && (
                        <span style={{ color: JF_TEXT_LIGHT }}>›</span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              )}

              {/* Version dropdown row */}
              {frame >= sec(VERSION_DD_T) && (
                <div
                  style={{
                    opacity: fade(VERSION_DD_T),
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 14,
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: 11,
                        color: JF_TEXT_MED,
                        marginBottom: 4,
                      }}
                    >
                      Version
                    </div>
                    <div
                      style={{
                        border: `1px solid ${JF_BORDER}`,
                        borderRadius: 4,
                        padding: "6px 12px",
                        fontSize: 13,
                        color: JF_TEXT,
                        backgroundColor: JF_CARD,
                        display: "flex",
                        alignItems: "center",
                        gap: 40,
                      }}
                    >
                      1.0.0
                      <span style={{ color: JF_TEXT_LIGHT, fontSize: 10 }}>
                        ▾
                      </span>
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: 12,
                      color: JF_ACCENT_BAR,
                      fontWeight: 500,
                    }}
                  >
                    All Versions (2)
                  </span>
                </div>
              )}

              {/* Package card */}
              {frame >= sec(CARD_T) && (
                <div
                  style={{
                    backgroundColor: JF_CARD,
                    borderRadius: 8,
                    border: `1px solid ${JF_BORDER}`,
                    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                    overflow: "hidden",
                    opacity: fade(CARD_T),
                    transform: `translateY(${slideY(CARD_T)}px)`,
                  }}
                >
                  {/* Package header */}
                  <div
                    style={{
                      padding: "18px 20px",
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 14,
                    }}
                  >
                    <div
                      style={{
                        width: 52,
                        height: 52,
                        borderRadius: 10,
                        backgroundColor: "#fdecea",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <FrogIcon />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontSize: 17,
                          fontWeight: 700,
                          color: JF_TEXT,
                          marginBottom: 6,
                        }}
                      >
                        frogs-best-practices
                      </div>
                      <div
                        style={{
                          fontSize: 12.5,
                          color: JF_TEXT_MED,
                          lineHeight: "18px",
                        }}
                      >
                        Best practices for JFrog development workflows.
                        Use when you need CI/CD patterns, artifact
                        management, and security configuration.
                      </div>
                    </div>
                  </div>

                  {/* About this version */}
                  <div
                    style={{
                      borderTop: `1px solid ${JF_BORDER}`,
                      padding: "14px 20px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: JF_TEXT,
                        marginBottom: 10,
                      }}
                    >
                      About this version
                    </div>

                    {INFO_ROWS.map((row, i) => {
                      const rowT = ROW_START + i * ROW_DT;
                      if (frame < sec(rowT)) return null;

                      const isVuln = row.value === "vuln";
                      const showScan = isVuln && frame >= sec(VULN_SCAN_T);
                      const showCheck = isVuln && frame >= sec(VULN_CHECK_T);

                      let valueEl: React.ReactNode;
                      if (row.isBadge) {
                        valueEl = (
                          <span
                            style={{
                              backgroundColor: JF_BADGE_GREEN_BG,
                              color: JF_GREEN,
                              padding: "2px 10px",
                              borderRadius: 4,
                              fontWeight: 600,
                              fontSize: 12,
                            }}
                          >
                            {row.value}
                          </span>
                        );
                      } else if (isVuln) {
                        valueEl = showCheck ? (
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 7,
                              transform: `scale(${checkSpring})`,
                              transformOrigin: "right center",
                            }}
                          >
                            <svg width="20" height="20" viewBox="0 0 20 20">
                              <circle
                                cx="10"
                                cy="10"
                                r="10"
                                fill={JF_GREEN}
                              />
                              <path
                                d="M6 10.5l2.8 2.8 5.2-5.6"
                                fill="none"
                                stroke="#fff"
                                strokeWidth="2.2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                            <span
                              style={{
                                color: JF_GREEN,
                                fontWeight: 700,
                                fontSize: 13,
                              }}
                            >
                              Clean — No vulnerabilities
                            </span>
                          </div>
                        ) : (
                          <span
                            style={{
                              color: showScan ? JF_TEXT_MED : JF_TEXT_LIGHT,
                              fontSize: 13,
                            }}
                          >
                            {showScan ? "Scanning..." : "Not Scanned"}
                          </span>
                        );
                      } else {
                        valueEl = (
                          <span style={{ color: JF_TEXT, fontSize: 13 }}>
                            {row.value}
                          </span>
                        );
                      }

                      return (
                        <div
                          key={row.label}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "9px 0",
                            borderBottom: `1px solid ${JF_BORDER}`,
                            opacity: fade(rowT, 0.25),
                            transform: `translateY(${slideY(rowT, 8, 0.25)}px)`,
                            position: "relative",
                          }}
                        >
                          {/* Green glow behind vuln row */}
                          {isVuln && vulnGlow > 0 && (
                            <div
                              style={{
                                position: "absolute",
                                inset: -4,
                                borderRadius: 6,
                                backgroundColor: JF_GREEN,
                                opacity: vulnGlow * 0.12,
                              }}
                            />
                          )}
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                              color: JF_TEXT_MED,
                              fontSize: 13,
                            }}
                          >
                            <RowIcon type={row.icon} />
                            {row.label}
                          </div>
                          {valueEl}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const NavIcon: React.FC<{
  type: "circle" | "eye" | "arrow" | "globe" | "people" | "gear";
}> = ({ type }) => {
  const s = 16;
  const c = "rgba(255,255,255,0.5)";
  switch (type) {
    case "circle":
      return (
        <svg width={s} height={s} viewBox="0 0 16 16">
          <circle
            cx="8"
            cy="8"
            r="6"
            fill="none"
            stroke={c}
            strokeWidth="1.5"
          />
        </svg>
      );
    case "eye":
      return (
        <svg width={s} height={s} viewBox="0 0 16 16">
          <ellipse
            cx="8"
            cy="8"
            rx="6"
            ry="4"
            fill="none"
            stroke={c}
            strokeWidth="1.5"
          />
          <circle cx="8" cy="8" r="2" fill={c} />
        </svg>
      );
    case "arrow":
      return (
        <svg width={s} height={s} viewBox="0 0 16 16">
          <path
            d="M8 3v8M5 8l3 3 3-3"
            fill="none"
            stroke={c}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      );
    case "globe":
      return (
        <svg width={s} height={s} viewBox="0 0 16 16">
          <circle
            cx="8"
            cy="8"
            r="6"
            fill="none"
            stroke={c}
            strokeWidth="1.5"
          />
          <path
            d="M2 8h12M8 2c2 2 2 10 0 12M8 2c-2 2-2 10 0 12"
            fill="none"
            stroke={c}
            strokeWidth="1"
          />
        </svg>
      );
    case "people":
      return (
        <svg width={s} height={s} viewBox="0 0 16 16">
          <circle cx="6" cy="5" r="2" fill={c} />
          <circle cx="10" cy="5" r="2" fill={c} />
          <path
            d="M2 13c0-3 3-4 4-4s4 1 4 4"
            fill="none"
            stroke={c}
            strokeWidth="1.3"
          />
        </svg>
      );
    case "gear":
      return (
        <svg width={s} height={s} viewBox="0 0 16 16">
          <circle
            cx="8"
            cy="8"
            r="3"
            fill="none"
            stroke={c}
            strokeWidth="1.5"
          />
          <circle
            cx="8"
            cy="8"
            r="6"
            fill="none"
            stroke={c}
            strokeWidth="1.5"
            strokeDasharray="3 3"
          />
        </svg>
      );
  }
};

const RowIcon: React.FC<{ type: string }> = ({ type }) => {
  const s = 17;
  const stroke = JF_TEXT_LIGHT;
  switch (type) {
    case "check":
      return (
        <svg width={s} height={s} viewBox="0 0 17 17">
          <circle
            cx="8.5"
            cy="8.5"
            r="7"
            fill="none"
            stroke={stroke}
            strokeWidth="1.3"
          />
          <path
            d="M5.5 8.5l2 2 4-4"
            fill="none"
            stroke={stroke}
            strokeWidth="1.3"
            strokeLinecap="round"
          />
        </svg>
      );
    case "cal":
      return (
        <svg width={s} height={s} viewBox="0 0 17 17">
          <rect
            x="2.5"
            y="3.5"
            width="12"
            height="10"
            rx="1.5"
            fill="none"
            stroke={stroke}
            strokeWidth="1.3"
          />
          <line
            x1="2.5"
            y1="7"
            x2="14.5"
            y2="7"
            stroke={stroke}
            strokeWidth="1.3"
          />
          <line
            x1="5.5"
            y1="2"
            x2="5.5"
            y2="5"
            stroke={stroke}
            strokeWidth="1.3"
            strokeLinecap="round"
          />
          <line
            x1="11.5"
            y1="2"
            x2="11.5"
            y2="5"
            stroke={stroke}
            strokeWidth="1.3"
            strokeLinecap="round"
          />
        </svg>
      );
    case "dl":
      return (
        <svg width={s} height={s} viewBox="0 0 17 17">
          <rect
            x="3"
            y="3"
            width="11"
            height="11"
            rx="2"
            fill="none"
            stroke={stroke}
            strokeWidth="1.3"
          />
          <path
            d="M8.5 6v4M6.5 8.5l2 2 2-2"
            fill="none"
            stroke={stroke}
            strokeWidth="1.3"
            strokeLinecap="round"
          />
        </svg>
      );
    case "shield":
      return (
        <svg width={s} height={s} viewBox="0 0 17 17">
          <path
            d="M8.5 2L3 4.5v4c0 3.5 5.5 6.5 5.5 6.5s5.5-3 5.5-6.5v-4L8.5 2z"
            fill="none"
            stroke={stroke}
            strokeWidth="1.3"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "tag":
      return (
        <svg width={s} height={s} viewBox="0 0 17 17">
          <path
            d="M3 8.5L8.5 3H14v5.5L8.5 14 3 8.5z"
            fill="none"
            stroke={stroke}
            strokeWidth="1.3"
            strokeLinejoin="round"
          />
          <circle cx="11" cy="6" r="1.2" fill={stroke} />
        </svg>
      );
    default:
      return null;
  }
};

const FrogIcon: React.FC = () => (
  <svg width="32" height="32" viewBox="0 0 32 32">
    <circle cx="16" cy="18" r="11" fill="#e74c3c" />
    <circle cx="11" cy="10" r="5" fill="#e74c3c" />
    <circle cx="21" cy="10" r="5" fill="#e74c3c" />
    <circle cx="11" cy="9.5" r="2.8" fill="#fff" />
    <circle cx="21" cy="9.5" r="2.8" fill="#fff" />
    <circle cx="11.5" cy="9.5" r="1.5" fill="#333" />
    <circle cx="21.5" cy="9.5" r="1.5" fill="#333" />
    <ellipse cx="16" cy="21" rx="5" ry="3" fill="#c0392b" />
  </svg>
);
