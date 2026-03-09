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

const { fontFamily: mono } = loadMono("normal", {
  weights: ["400", "700"],
  subsets: ["latin"],
});
const { fontFamily: sans } = loadSans("normal", {
  weights: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
});

const BG = "#0d1117";
const SURFACE = "#161b22";
const BORDER = "#30363d";
const TEXT = "#e6edf3";
const MUTED = "#7d8590";
const BLUE = "#58a6ff";
const GREEN = "#3fb950";

const CL = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

const SKILLS = [
  { name: "deploy-optimizer", desc: "Optimize CI/CD pipelines", icon: "🚀" },
  { name: "security-scanner", desc: "Scan for vulnerabilities", icon: "🔒" },
  { name: "test-generator", desc: "Generate unit tests", icon: "🧪" },
  { name: "code-reviewer", desc: "Review code changes", icon: "📝" },
];

const EXEC_STEPS = [
  { text: "Read configuration files", file: "deploy.yaml" },
  { text: "Apply pipeline template", file: "pipeline.ts" },
  { text: "Validate deployment targets", file: null },
];

const P2 = 6;
const P3 = 12;

export const SkillLifecycle: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = (sec: number) => Math.round(sec * fps);

  const phase = frame < s(P2) ? 1 : frame < s(P3) ? 2 : 3;
  const glowPulse = 0.4 + 0.6 * Math.abs(Math.sin(frame * 0.07));

  const p2Fill = interpolate(frame, [s(P2 - 0.4), s(P2)], [0, 1], CL);
  const p3Fill = interpolate(frame, [s(P3 - 0.4), s(P3)], [0, 1], CL);

  // ── Phase 1: cards appear ──
  const cardSprings = SKILLS.map((_, i) =>
    spring({ frame, fps, delay: s(0.8 + i * 0.5), config: { damping: 14, stiffness: 120 } }),
  );
  const desc1 = interpolate(frame, [s(3.5), s(3.9), s(P2 - 0.5), s(P2)], [0, 1, 1, 0], CL);

  // ── Phase 2: task + match + expand ──
  const taskAppear = spring({ frame, fps, delay: s(P2 + 0.5), config: { damping: 14, stiffness: 120 } });
  const matchGlow = interpolate(frame, [s(P2 + 1.8), s(P2 + 2.3)], [0, 1], CL);
  const dimFactor = interpolate(frame, [s(P2 + 2.3), s(P2 + 2.8)], [1, 0.18], CL);
  const expandAmount = spring({ frame, fps, delay: s(P2 + 3), config: { damping: 12, stiffness: 100 } });
  const loadPct = Math.round(interpolate(frame, [s(P2 + 3.5), s(P2 + 4.5)], [0, 100], CL));
  const loadDone = frame >= s(P2 + 4.5);
  const desc2 = interpolate(frame, [s(P2 + 4.8), s(P2 + 5.2), s(P3 - 0.5), s(P3)], [0, 1, 1, 0], CL);

  // ── Phase 3: collapse + steps ──
  const hideDimmed = interpolate(frame, [s(P3), s(P3 + 0.5)], [1, 0], CL);
  const collapseExpand = interpolate(frame, [s(P3), s(P3 + 0.5)], [1, 0], CL);
  const hideTask = interpolate(frame, [s(P3), s(P3 + 0.3)], [1, 0], CL);
  const activeBadge = spring({ frame, fps, delay: s(P3 + 0.6), config: { damping: 14, stiffness: 140 } });
  const stepSprings = EXEC_STEPS.map((_, i) =>
    spring({ frame, fps, delay: s(P3 + 1.2 + i * 0.8), config: { damping: 14, stiffness: 120 } }),
  );
  const checkSprings = EXEC_STEPS.map((_, i) =>
    spring({ frame, fps, delay: s(P3 + 1.6 + i * 0.8), config: { damping: 14, stiffness: 140 } }),
  );
  const desc3 = interpolate(frame, [s(P3 + 4), s(P3 + 4.4)], [0, 1], CL);

  const phases = ["Discovery", "Activation", "Execution"];
  const fills = [1, p2Fill, p3Fill];

  return (
    <AbsoluteFill style={{ backgroundColor: BG, fontFamily: sans }}>
      {/* ── Phase indicator ── */}
      <div
        style={{
          position: "absolute",
          top: 18,
          left: 0,
          right: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {phases.map((label, i) => {
          const active = fills[i] > 0.5;
          const current = phase === i + 1;
          return (
            <React.Fragment key={label}>
              {i > 0 && (
                <div style={{ width: 70, height: 2, backgroundColor: BORDER, position: "relative" }}>
                  <div
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 0,
                      height: 2,
                      width: `${fills[i] * 100}%`,
                      backgroundColor: BLUE,
                    }}
                  />
                </div>
              )}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    border: `2px solid ${active ? BLUE : BORDER}`,
                    backgroundColor: active ? BLUE : "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: current ? `0 0 10px ${BLUE}50` : "none",
                  }}
                >
                  <span style={{ fontSize: 11, fontWeight: 700, color: active ? "#fff" : MUTED }}>
                    {i + 1}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: current ? 700 : 500,
                    color: current ? TEXT : MUTED,
                  }}
                >
                  {label}
                </span>
              </div>
            </React.Fragment>
          );
        })}
      </div>

      {/* ── Content area ── */}
      <div
        style={{
          position: "absolute",
          top: 72,
          left: 32,
          right: 32,
          bottom: 42,
          display: "flex",
          flexDirection: "column",
          gap: 5,
        }}
      >
        {/* Task bubble (Phase 2+) */}
        {frame >= s(P2) && (
          <div
            style={{
              opacity: taskAppear * (frame >= s(P3) ? hideTask : 1),
              transform: `translateY(${interpolate(taskAppear, [0, 1], [8, 0])}px)`,
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              backgroundColor: `${BLUE}12`,
              border: `1px solid ${BLUE}35`,
              borderRadius: 6,
              padding: "5px 12px",
              marginBottom: 2,
              alignSelf: "flex-start",
              boxShadow: `0 0 ${10 * glowPulse}px ${BLUE}20`,
            }}
          >
            <span style={{ fontSize: 11 }}>💬</span>
            <span style={{ fontFamily: mono, fontSize: 11, color: BLUE }}>
              Task: &quot;Configure CI/CD pipeline&quot;
            </span>
          </div>
        )}

        {/* Skill cards */}
        {SKILLS.map((skill, i) => {
          const isMatch = i === 0;
          const baseOp = cardSprings[i];
          const dimOp = !isMatch && frame >= s(P2 + 2.3) ? dimFactor : 1;
          const hideOp = !isMatch && frame >= s(P3) ? hideDimmed : 1;
          const finalOp = baseOp * dimOp * hideOp;

          if (finalOp < 0.01) return null;

          const highlighted = isMatch && matchGlow > 0.5;
          const effectiveExpand = isMatch
            ? frame >= s(P3) ? expandAmount * collapseExpand : expandAmount
            : 0;
          const expanded = effectiveExpand > 0.01;
          const showMatchBadge = isMatch && matchGlow > 0.5 && frame < s(P3);
          const showActiveBadge = isMatch && frame >= s(P3) && activeBadge > 0;

          return (
            <div
              key={skill.name}
              style={{
                opacity: finalOp,
                transform: `translateY(${interpolate(baseOp, [0, 1], [8, 0])}px)`,
                backgroundColor: SURFACE,
                border: `1px solid ${
                  showActiveBadge ? GREEN : highlighted ? BLUE : BORDER
                }`,
                borderRadius: 7,
                padding: expanded ? "8px 12px" : "6px 12px",
                boxShadow:
                  showActiveBadge ? `0 0 ${10 * glowPulse}px ${GREEN}20` :
                  highlighted ? `0 0 ${12 * glowPulse}px ${BLUE}25` : "none",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 14, flexShrink: 0 }}>{skill.icon}</span>
                <span
                  style={{
                    fontFamily: mono,
                    fontSize: 12,
                    fontWeight: 700,
                    color: showActiveBadge ? GREEN : highlighted ? BLUE : TEXT,
                    flex: 1,
                  }}
                >
                  {skill.name}
                </span>
                <span style={{ fontSize: 10, color: MUTED }}>{skill.desc}</span>
                {showMatchBadge && (
                  <span
                    style={{
                      fontSize: 9,
                      fontWeight: 700,
                      color: BLUE,
                      fontFamily: mono,
                      opacity: matchGlow,
                      marginLeft: 4,
                    }}
                  >
                    MATCH
                  </span>
                )}
                {showActiveBadge && (
                  <span
                    style={{
                      fontSize: 9,
                      fontWeight: 700,
                      color: GREEN,
                      fontFamily: mono,
                      backgroundColor: `${GREEN}15`,
                      padding: "2px 6px",
                      borderRadius: 4,
                      opacity: activeBadge,
                      marginLeft: 4,
                    }}
                  >
                    ACTIVE
                  </span>
                )}
              </div>

              {expanded && (
                <div
                  style={{
                    marginTop: 8,
                    paddingTop: 8,
                    borderTop: `1px solid ${BORDER}`,
                    opacity: effectiveExpand,
                    maxHeight: effectiveExpand * 80,
                    overflow: "hidden",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                    <span style={{ fontSize: 11 }}>📄</span>
                    <span style={{ fontFamily: mono, fontSize: 11, color: TEXT }}>SKILL.md</span>
                    {!loadDone && (
                      <span style={{ fontFamily: mono, fontSize: 10, color: MUTED, marginLeft: 4 }}>
                        Loading… {loadPct}%
                      </span>
                    )}
                  </div>
                  <div
                    style={{
                      height: 2,
                      backgroundColor: `${BORDER}80`,
                      borderRadius: 1,
                      overflow: "hidden",
                      marginBottom: loadDone ? 6 : 0,
                    }}
                  >
                    <div
                      style={{
                        height: 2,
                        width: `${loadPct}%`,
                        backgroundColor: loadDone ? GREEN : BLUE,
                        borderRadius: 1,
                      }}
                    />
                  </div>
                  {loadDone && (
                    <div style={{ fontFamily: mono, fontSize: 10, color: GREEN }}>
                      ✓ Full instructions loaded into context
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Execution steps */}
        {frame >= s(P3 + 0.8) &&
          EXEC_STEPS.map((step, i) => {
            const appear = stepSprings[i];
            const checked = checkSprings[i] > 0.5;
            if (appear < 0.01) return null;
            return (
              <div
                key={`step-${i}`}
                style={{
                  opacity: appear,
                  transform: `translateX(${interpolate(appear, [0, 1], [10, 0])}px)`,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "5px 12px",
                  backgroundColor: checked ? `${GREEN}08` : "transparent",
                  borderRadius: 6,
                  border: `1px solid ${checked ? `${GREEN}25` : "transparent"}`,
                }}
              >
                <div
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 9,
                    backgroundColor: checked ? GREEN : BORDER,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    transform: `scale(${interpolate(checkSprings[i], [0, 1], [0.6, 1])})`,
                  }}
                >
                  {checked && (
                    <span style={{ fontSize: 10, color: "#fff", fontWeight: 700 }}>✓</span>
                  )}
                </div>
                <span style={{ fontSize: 11, color: TEXT, flex: 1 }}>{step.text}</span>
                {step.file && (
                  <span
                    style={{
                      fontSize: 9,
                      fontFamily: mono,
                      color: MUTED,
                      backgroundColor: `${BORDER}60`,
                      padding: "2px 6px",
                      borderRadius: 3,
                      flexShrink: 0,
                    }}
                  >
                    {step.file}
                  </span>
                )}
              </div>
            );
          })}
      </div>

      {/* ── Description text ── */}
      <div
        style={{
          position: "absolute",
          bottom: 14,
          left: 0,
          right: 0,
          textAlign: "center",
          height: 24,
        }}
      >
        <div style={{ opacity: desc1, position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 12, color: MUTED }}>
            At startup, agents load only the{" "}
            <span style={{ color: TEXT, fontWeight: 600 }}>name and description</span> of each skill
          </span>
        </div>
        <div style={{ opacity: desc2, position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 12, color: MUTED }}>
            When a task matches, the agent reads the full{" "}
            <span style={{ color: BLUE, fontWeight: 600, fontFamily: mono }}>SKILL.md</span> into context
          </span>
        </div>
        <div style={{ opacity: desc3, position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 12, color: MUTED }}>
            The agent follows instructions, loading{" "}
            <span style={{ color: GREEN, fontWeight: 600 }}>referenced files</span> and executing code
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
