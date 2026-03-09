import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";

const { fontFamily } = loadFont("normal", {
  weights: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
});

const W = 1920;
const H = 1080;

const USER_X = 340;
const AGENT_X = 960;
const ARTIF_X = 1580;

const TOP_Y = 140;
const BOX_W = 230;
const BOX_H = 54;
const LIFELINE_TOP = TOP_Y + BOX_H + 20;
const LIFELINE_BOTTOM = 920;

const STEP_Y = {
  installSkill: 280,
  getVersions: 370,
  versions: 445,
  getDownload: 535,
  zip: 610,
  sigstore: 700,
  installed: 820,
};

const BG_DARK = "#1E2433";
const BOX_BLUE = "#3B7DD8";
const FWD_COLOR = "#4CAF50";
const RET_COLOR = "#E53935";
const SELF_COLOR = "#FFC107";
const WHITE = "#FFFFFF";
const LIFELINE_CLR = "rgba(255,255,255,0.09)";
const DOT_BLUE = "#5C9CE6";

const STEP_DELAYS = [2.0, 3.8, 5.3, 7.0, 8.5, 10.2, 12.2];

const DOT_R = 8;
const ARROW_W = 3;
const HEAD_SIZE = 13;

const ActorBox: React.FC<{
  x: number;
  y: number;
  label: string;
  progress: number;
}> = ({ x, y, label, progress }) => {
  const sc = interpolate(progress, [0, 1], [0.8, 1]);
  const translateY = interpolate(progress, [0, 1], [-25, 0]);
  return (
    <g
      style={{
        opacity: progress,
        transform: `translate(0px, ${translateY}px) scale(${sc})`,
        transformOrigin: `${x}px ${y + BOX_H / 2}px`,
      }}
    >
      <rect
        x={x - BOX_W / 2}
        y={y}
        width={BOX_W}
        height={BOX_H}
        rx={6}
        fill={BOX_BLUE}
      />
      <text
        x={x}
        y={y + BOX_H / 2 + 7}
        textAnchor="middle"
        fontSize={20}
        fontWeight={700}
        fill={WHITE}
        fontFamily={fontFamily}
        letterSpacing="0.3px"
      >
        {label}
      </text>
    </g>
  );
};

const MessageArrow: React.FC<{
  fromX: number;
  toX: number;
  y: number;
  label: string;
  isResponse?: boolean;
  progress: number;
}> = ({ fromX, toX, y, label, isResponse = false, progress }) => {
  const color = isResponse ? RET_COLOR : FWD_COLOR;
  const glowId = `glow-${fromX}-${toX}-${y}`;
  const dir = toX > fromX ? 1 : -1;
  const gap = DOT_R + 4;
  const sx = fromX + dir * gap;
  const ex = toX - dir * (HEAD_SIZE + 2);

  const dotScale = interpolate(progress, [0, 0.15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const dotGlow = interpolate(progress, [0.05, 0.2, 0.6], [0, 0.5, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const lineEnd = interpolate(progress, [0.1, 0.85], [sx, ex], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const headOpacity = interpolate(progress, [0.8, 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const labelOpacity = interpolate(progress, [0, 0.25], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const labelY = interpolate(progress, [0, 0.25], [6, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const headX = toX - dir * 2;
  const midX = (fromX + toX) / 2;

  return (
    <g>
      <defs>
        <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="8" result="blur" />
        </filter>
      </defs>

      <text
        x={midX}
        y={y - 18}
        textAnchor="middle"
        fontSize={18}
        fontWeight={600}
        fill={WHITE}
        fontFamily={fontFamily}
        opacity={labelOpacity}
        style={{ transform: `translateY(${labelY}px)` }}
      >
        {label}
      </text>

      <circle
        cx={fromX}
        cy={y}
        r={16}
        fill={color}
        filter={`url(#${glowId})`}
        opacity={dotGlow}
      />
      <circle
        cx={fromX}
        cy={y}
        r={DOT_R}
        fill={color}
        style={{
          transform: `scale(${dotScale})`,
          transformOrigin: `${fromX}px ${y}px`,
        }}
      />

      <line
        x1={sx}
        y1={y}
        x2={lineEnd}
        y2={y}
        stroke={color}
        strokeWidth={ARROW_W}
      />

      <polygon
        points={`${headX},${y} ${headX - dir * HEAD_SIZE},${y - 6} ${headX - dir * HEAD_SIZE},${y + 6}`}
        fill={color}
        opacity={headOpacity}
      />
    </g>
  );
};

const SelfLoop: React.FC<{
  x: number;
  y: number;
  progress: number;
}> = ({ x, y, progress }) => {
  const loopW = 100;
  const loopH = 60;
  const totalLen = loopW * 2 + loopH;

  const dotScale = interpolate(progress, [0, 0.12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const dotGlow = interpolate(progress, [0.05, 0.18, 0.5], [0, 0.6, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const dashOff = interpolate(progress, [0.1, 0.85], [totalLen, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const headOpacity = interpolate(progress, [0.8, 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const labelOpacity = interpolate(progress, [0, 0.25], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const labelY = interpolate(progress, [0, 0.25], [6, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <g>
      <defs>
        <filter id="selfGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="10" result="blur" />
        </filter>
      </defs>

      <text
        x={x + loopW + 22}
        y={y + loopH / 2 + 6}
        fontSize={18}
        fontWeight={600}
        fill={WHITE}
        fontFamily={fontFamily}
        opacity={labelOpacity}
        style={{ transform: `translateY(${labelY}px)` }}
      >
        Evidence Verification
      </text>

      <circle
        cx={x}
        cy={y}
        r={18}
        fill={SELF_COLOR}
        filter="url(#selfGlow)"
        opacity={dotGlow}
      />
      <circle
        cx={x}
        cy={y}
        r={DOT_R}
        fill={SELF_COLOR}
        style={{
          transform: `scale(${dotScale})`,
          transformOrigin: `${x}px ${y}px`,
        }}
      />

      <path
        d={`M ${x + DOT_R + 4} ${y} H ${x + loopW} V ${y + loopH} H ${x + DOT_R + 4}`}
        fill="none"
        stroke={SELF_COLOR}
        strokeWidth={3}
        strokeDasharray={totalLen}
        strokeDashoffset={dashOff}
      />
      <polygon
        points={`${x + 2},${y + loopH} ${x + HEAD_SIZE + 4},${y + loopH - 7} ${x + HEAD_SIZE + 4},${y + loopH + 7}`}
        fill={SELF_COLOR}
        opacity={headOpacity}
      />
    </g>
  );
};

const BottomDot: React.FC<{
  cx: number;
  cy: number;
  progress: number;
}> = ({ cx, cy, progress }) => {
  const sc = interpolate(progress, [0, 1], [0, 1]);
  const glowOp = interpolate(progress, [0.3, 0.6, 1], [0, 0.5, 0.15], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <g>
      <circle
        cx={cx}
        cy={cy}
        r={20}
        fill={DOT_BLUE}
        opacity={glowOp}
        filter="url(#dotGlow)"
      />
      <circle
        cx={cx}
        cy={cy}
        r={9}
        fill={DOT_BLUE}
        style={{
          transform: `scale(${sc})`,
          transformOrigin: `${cx}px ${cy}px`,
          opacity: progress,
        }}
      />
    </g>
  );
};

export const InstallSkillFlow: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const smooth = { damping: 200 };
  const snappy = { damping: 14, stiffness: 180 };

  const sp = (sec: number, cfg = smooth) =>
    spring({ frame, fps, delay: Math.round(sec * fps), config: cfg });

  const titleP = sp(0.2);
  const subtitleP = sp(0.5);
  const box1P = sp(0.6, snappy);
  const box2P = sp(0.8, snappy);
  const box3P = sp(1.0, snappy);
  const lineP = sp(1.2);

  const steps = STEP_DELAYS.map((d) => sp(d));
  const bottomP = sp(1.4, snappy);

  const titleY = interpolate(titleP, [0, 1], [-20, 0]);
  const subtitleY = interpolate(subtitleP, [0, 1], [8, 0]);
  const lineBottom = interpolate(lineP, [0, 1], [LIFELINE_TOP, LIFELINE_BOTTOM]);

  return (
    <AbsoluteFill style={{ backgroundColor: BG_DARK }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "100%" }}>
        <defs>
          <radialGradient id="bgVignette" cx="50%" cy="45%" r="70%">
            <stop offset="0%" stopColor="#283048" stopOpacity={0.5} />
            <stop offset="100%" stopColor={BG_DARK} stopOpacity={1} />
          </radialGradient>
          <filter id="dotGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" />
          </filter>
        </defs>

        <rect x={0} y={0} width={W} height={H} fill="url(#bgVignette)" />

        {/* ─── Title ─── */}
        <text
          x={W / 2}
          y={52}
          textAnchor="middle"
          fontSize={44}
          fontWeight={800}
          fill={WHITE}
          fontFamily={fontFamily}
          opacity={titleP}
          letterSpacing="-0.5px"
          style={{ transform: `translateY(${titleY}px)` }}
        >
          Install Skill
        </text>
        <text
          x={W / 2}
          y={84}
          textAnchor="middle"
          fontSize={17}
          fontWeight={400}
          fill="rgba(255,255,255,0.4)"
          fontFamily={fontFamily}
          opacity={subtitleP}
          letterSpacing="0.5px"
          style={{ transform: `translateY(${subtitleY}px)` }}
        >
          Coding Agent ↔ JFrog Platform
        </text>

        {/* ─── Top Actor Boxes ─── */}
        <ActorBox x={USER_X} y={TOP_Y} label="User" progress={box1P} />
        <ActorBox
          x={AGENT_X}
          y={TOP_Y}
          label="Coding Agent"
          progress={box2P}
        />
        <ActorBox
          x={ARTIF_X}
          y={TOP_Y}
          label="JFrog Platform"
          progress={box3P}
        />

        {/* ─── Lifelines ─── */}
        {[USER_X, AGENT_X, ARTIF_X].map((cx) => (
          <line
            key={cx}
            x1={cx}
            y1={LIFELINE_TOP}
            x2={cx}
            y2={lineBottom}
            stroke={LIFELINE_CLR}
            strokeWidth={1.5}
            opacity={Math.min(lineP * 2, 1)}
          />
        ))}

        {/* ─── Step 1: /install-skill  User → Agent ─── */}
        <MessageArrow
          fromX={USER_X}
          toX={AGENT_X}
          y={STEP_Y.installSkill}
          label="/install-skill"
          progress={steps[0]}
        />

        {/* ─── Step 2: GET versions  Agent → Artifactory ─── */}
        <MessageArrow
          fromX={AGENT_X}
          toX={ARTIF_X}
          y={STEP_Y.getVersions}
          label="GET versions"
          progress={steps[1]}
        />

        {/* ─── Step 3: versions  Artifactory → Agent ─── */}
        <MessageArrow
          fromX={ARTIF_X}
          toX={AGENT_X}
          y={STEP_Y.versions}
          label="versions"
          isResponse
          progress={steps[2]}
        />

        {/* ─── Step 4: GET download  Agent → Artifactory ─── */}
        <MessageArrow
          fromX={AGENT_X}
          toX={ARTIF_X}
          y={STEP_Y.getDownload}
          label="GET download"
          progress={steps[3]}
        />

        {/* ─── Step 5: zip  Artifactory → Agent ─── */}
        <MessageArrow
          fromX={ARTIF_X}
          toX={AGENT_X}
          y={STEP_Y.zip}
          label="zip"
          isResponse
          progress={steps[4]}
        />

        {/* ─── Step 6: Sigstore bundle verification ─── */}
        <SelfLoop x={AGENT_X} y={STEP_Y.sigstore} progress={steps[5]} />

        {/* ─── Step 7: Installed  Agent → User ─── */}
        <MessageArrow
          fromX={AGENT_X}
          toX={USER_X}
          y={STEP_Y.installed}
          label="Installed"
          isResponse
          progress={steps[6]}
        />

        {/* ─── Bottom Dots ─── */}
        {[USER_X, AGENT_X, ARTIF_X].map((cx) => (
          <BottomDot
            key={cx}
            cx={cx}
            cy={LIFELINE_BOTTOM + 12}
            progress={bottomP}
          />
        ))}
      </svg>
    </AbsoluteFill>
  );
};
