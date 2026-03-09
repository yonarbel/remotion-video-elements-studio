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

const BG_DARK = "#1E2433";
const WHITE = "#FFFFFF";
const NODE_GREEN = "#388E3C";
const NODE_GREEN_RING = "#66BB6A";
const NODE_BLUE = "#3B7DD8";
const NODE_TEAL = "#00897B";
const NODE_TEAL_RING = "#4DB6AC";
const NODE_AMBER = "#F9A825";
const NODE_INDIGO = "#5C6BC0";
const ARROW_CLR = "#90CAF9";
const ARC_CLR = "rgba(255,255,255,0.45)";

type Shape = "circle" | "rect" | "diamond";
interface NodeDef {
  x: number;
  y: number;
  shape: Shape;
  lines: string[];
  fill: string;
  ring?: string;
  r?: number;
  w?: number;
  h?: number;
}

const UPLOAD_Y = 265;
const USE_Y = 770;

const uploadNodes: NodeDef[] = [
  { x: 190, y: UPLOAD_Y, shape: "circle", lines: ["Customer"], fill: NODE_GREEN, ring: NODE_GREEN_RING, r: 44 },
  { x: 460, y: UPLOAD_Y, shape: "rect", lines: ["Skill local", "repository"], fill: NODE_BLUE, w: 172, h: 68 },
  { x: 740, y: UPLOAD_Y, shape: "circle", lines: ["security", "scan"], fill: NODE_TEAL, ring: NODE_TEAL_RING, r: 42 },
  { x: 1030, y: UPLOAD_Y, shape: "rect", lines: ["Evidence"], fill: NODE_AMBER, w: 140, h: 56 },
  { x: 1370, y: UPLOAD_Y, shape: "rect", lines: ["Skill data in", "AI Catalog"], fill: NODE_AMBER, w: 180, h: 68 },
];

const useNodes: NodeDef[] = [
  { x: 190, y: USE_Y, shape: "circle", lines: ["Customer"], fill: NODE_GREEN, ring: NODE_GREEN_RING, r: 44 },
  { x: 500, y: USE_Y, shape: "rect", lines: ["Skill local", "repository"], fill: NODE_BLUE, w: 172, h: 68 },
  { x: 820, y: USE_Y, shape: "diamond", lines: ["Is signed"], fill: NODE_INDIGO, w: 115, h: 115 },
  { x: 1190, y: USE_Y, shape: "rect", lines: ["Evidence"], fill: NODE_AMBER, w: 140, h: 56 },
];

function rightEdge(n: NodeDef): number {
  if (n.shape === "circle") return n.x + (n.r ?? 40);
  if (n.shape === "diamond") return n.x + (n.w ?? 100) / 2;
  return n.x + (n.w ?? 140) / 2;
}
function leftEdge(n: NodeDef): number {
  if (n.shape === "circle") return n.x - (n.r ?? 40);
  if (n.shape === "diamond") return n.x - (n.w ?? 100) / 2;
  return n.x - (n.w ?? 140) / 2;
}
function topEdge(n: NodeDef): number {
  if (n.shape === "circle") return n.y - (n.r ?? 40);
  if (n.shape === "diamond") return n.y - (n.h ?? 100) / 2;
  return n.y - (n.h ?? 56) / 2;
}
function bottomEdge(n: NodeDef): number {
  if (n.shape === "circle") return n.y + (n.r ?? 40);
  if (n.shape === "diamond") return n.y + (n.h ?? 100) / 2;
  return n.y + (n.h ?? 56) / 2;
}

const FlowNode: React.FC<{ n: NodeDef; progress: number }> = ({
  n,
  progress,
}) => {
  const sc = interpolate(progress, [0, 1], [0.6, 1]);
  const op = progress;
  const style: React.CSSProperties = {
    opacity: op,
    transform: `scale(${sc})`,
    transformOrigin: `${n.x}px ${n.y}px`,
  };

  const textEl = (
    <>
      {n.lines.map((line, i) => (
        <text
          key={i}
          x={n.x}
          y={n.y + (i - (n.lines.length - 1) / 2) * 18 + 5}
          textAnchor="middle"
          fontSize={15}
          fontWeight={700}
          fill={WHITE}
          fontFamily={fontFamily}
        >
          {line}
        </text>
      ))}
    </>
  );

  if (n.shape === "circle") {
    const r = n.r ?? 40;
    return (
      <g style={style}>
        {n.ring && (
          <circle
            cx={n.x}
            cy={n.y}
            r={r + 4}
            fill="none"
            stroke={n.ring}
            strokeWidth={3}
          />
        )}
        <circle cx={n.x} cy={n.y} r={r} fill={n.fill} />
        {textEl}
      </g>
    );
  }

  if (n.shape === "diamond") {
    const hw = (n.w ?? 100) / 2;
    const hh = (n.h ?? 100) / 2;
    return (
      <g style={style}>
        <polygon
          points={`${n.x},${n.y - hh} ${n.x + hw},${n.y} ${n.x},${n.y + hh} ${n.x - hw},${n.y}`}
          fill={n.fill}
        />
        {textEl}
      </g>
    );
  }

  const w = n.w ?? 140;
  const h = n.h ?? 56;
  return (
    <g style={style}>
      <rect
        x={n.x - w / 2}
        y={n.y - h / 2}
        width={w}
        height={h}
        rx={8}
        fill={n.fill}
      />
      {textEl}
    </g>
  );
};

const StraightArrow: React.FC<{
  from: NodeDef;
  to: NodeDef;
  label: string;
  progress: number;
}> = ({ from, to, label, progress }) => {
  const sx = rightEdge(from) + 8;
  const ex = leftEdge(to) - 8;
  const y = (from.y + to.y) / 2;

  const curEnd = interpolate(progress, [0.05, 0.85], [sx, ex], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const headOp = interpolate(progress, [0.8, 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const labelOp = interpolate(progress, [0, 0.3], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const midX = (sx + ex) / 2;
  return (
    <g>
      <text
        x={midX}
        y={y - 14}
        textAnchor="middle"
        fontSize={14}
        fontWeight={600}
        fill={WHITE}
        fontFamily={fontFamily}
        opacity={labelOp}
      >
        {label}
      </text>
      <line
        x1={sx}
        y1={y}
        x2={curEnd}
        y2={y}
        stroke={ARROW_CLR}
        strokeWidth={2.5}
      />
      <polygon
        points={`${ex},${y} ${ex - 10},${y - 5} ${ex - 10},${y + 5}`}
        fill={ARROW_CLR}
        opacity={headOp}
      />
    </g>
  );
};

const ArcArrow: React.FC<{
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  label: string;
  above: boolean;
  progress: number;
  arcHeight?: number;
  dimmed?: boolean;
}> = ({
  fromX,
  fromY,
  toX,
  toY,
  label,
  above,
  progress,
  arcHeight,
  dimmed = false,
}) => {
  const midX = (fromX + toX) / 2;
  const defaultArc = Math.min(Math.abs(toX - fromX) * 0.18, 90);
  const ah = arcHeight ?? defaultArc;
  const cpY = above ? Math.min(fromY, toY) - ah : Math.max(fromY, toY) + ah;

  const d = `M ${fromX} ${fromY} Q ${midX} ${cpY} ${toX} ${toY}`;
  const pathLen = Math.sqrt((toX - fromX) ** 2 + (toY - fromY) ** 2) * 1.5;

  const dashOff = interpolate(progress, [0.05, 0.9], [pathLen, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const headOp = interpolate(progress, [0.85, 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const labelOp = interpolate(progress, [0, 0.3], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const tx = toX - midX;
  const ty = toY - cpY;
  const angle = Math.atan2(ty, tx) * (180 / Math.PI);

  const labelY = above ? cpY - 12 : cpY + 20;
  const color = dimmed ? ARC_CLR : ARROW_CLR;

  return (
    <g>
      <text
        x={midX}
        y={labelY}
        textAnchor="middle"
        fontSize={13}
        fontWeight={dimmed ? 500 : 600}
        fontStyle={dimmed ? "italic" : "normal"}
        fill={dimmed ? "rgba(255,255,255,0.55)" : WHITE}
        fontFamily={fontFamily}
        opacity={labelOp}
      >
        {label}
      </text>
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeDasharray={pathLen}
        strokeDashoffset={dashOff}
      />
      <g
        transform={`translate(${toX},${toY}) rotate(${angle})`}
        opacity={headOp}
      >
        <polygon points="0,0 -10,-4.5 -10,4.5" fill={color} />
      </g>
    </g>
  );
};

export const FlowDiagrams: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const smooth = { damping: 200 };
  const snappy = { damping: 14, stiffness: 180 };

  const sp = (sec: number, cfg = smooth) =>
    spring({ frame, fps, delay: Math.round(sec * fps), config: cfg });

  // ── Titles ──
  const mainTitleP = sp(0.2);
  const uploadTitleP = sp(0.7);
  const useTitleP = sp(8.0);

  // ── Upload Skill nodes ──
  const uNodes = [sp(1.1, snappy), sp(1.4, snappy), sp(1.7, snappy), sp(2.0, snappy), sp(2.3, snappy)];

  // ── Upload Skill arrows (straight) ──
  const uArr = [sp(3.0), sp(3.6), sp(4.2), sp(4.8)];

  // ── Upload Skill arcs ──
  const uArcTop = sp(5.6);
  const uArcBot = sp(6.4);

  // ── Use Skill nodes ──
  const dNodes = [sp(8.5, snappy), sp(8.8, snappy), sp(9.1, snappy), sp(9.4, snappy)];

  // ── Use Skill arrows (straight) ──
  const dArr = [sp(10.0), sp(10.6), sp(11.2)];

  // ── Use Skill arcs ──
  const dArcAllow = sp(11.8);
  const dArcBlock = sp(12.5);
  const dArcOpt = sp(13.3);

  const mainTitleY = interpolate(mainTitleP, [0, 1], [-15, 0]);

  const un = uploadNodes;
  const dn = useNodes;

  return (
    <AbsoluteFill style={{ backgroundColor: BG_DARK }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "100%" }}>
        <defs>
          <radialGradient id="bgV3" cx="50%" cy="45%" r="70%">
            <stop offset="0%" stopColor="#283048" stopOpacity={0.5} />
            <stop offset="100%" stopColor={BG_DARK} stopOpacity={1} />
          </radialGradient>
        </defs>
        <rect x={0} y={0} width={W} height={H} fill="url(#bgV3)" />

        {/* ─── Main Title ─── */}
        <text
          x={W / 2}
          y={42}
          textAnchor="middle"
          fontSize={40}
          fontWeight={800}
          fill={WHITE}
          fontFamily={fontFamily}
          opacity={mainTitleP}
          letterSpacing="-0.5px"
          style={{ transform: `translateY(${mainTitleY}px)` }}
        >
          Flow Diagrams
        </text>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            SECTION 1 — Upload Skill
           ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}

        {/* Section border */}
        <rect
          x={60}
          y={70}
          width={W - 120}
          height={420}
          rx={16}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={1.5}
          opacity={uploadTitleP}
        />

        <text
          x={100}
          y={102}
          fontSize={22}
          fontWeight={700}
          fill={WHITE}
          fontFamily={fontFamily}
          opacity={uploadTitleP}
        >
          Upload Skill
        </text>

        {/* Nodes */}
        {uploadNodes.map((n, i) => (
          <FlowNode key={`un${i}`} n={n} progress={uNodes[i]} />
        ))}

        {/* Straight arrows */}
        <StraightArrow from={un[0]} to={un[1]} label="Upload Skill" progress={uArr[0]} />
        <StraightArrow from={un[1]} to={un[2]} label="Scan" progress={uArr[1]} />
        <StraightArrow from={un[2]} to={un[3]} label="Skill is OK" progress={uArr[2]} />
        <StraightArrow from={un[3]} to={un[4]} label="" progress={uArr[3]} />

        {/* Top arc: Customer → Evidence  "[Optional] Customer evidence" */}
        <ArcArrow
          fromX={un[0].x}
          fromY={topEdge(un[0])}
          toX={un[3].x}
          toY={topEdge(un[3])}
          label="[Optional] Customer evidence"
          above
          progress={uArcTop}
          arcHeight={105}
          dimmed
        />

        {/* Bottom arc: Scan → Customer  "Scan status" */}
        <ArcArrow
          fromX={un[2].x}
          fromY={bottomEdge(un[2])}
          toX={un[0].x}
          toY={bottomEdge(un[0])}
          label="Scan status"
          above={false}
          progress={uArcBot}
          arcHeight={85}
        />

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            SECTION 2 — Use Skill
           ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}

        {/* Section border */}
        <rect
          x={60}
          y={540}
          width={W - 120}
          height={460}
          rx={16}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={1.5}
          opacity={useTitleP}
        />

        <text
          x={100}
          y={575}
          fontSize={22}
          fontWeight={700}
          fill={WHITE}
          fontFamily={fontFamily}
          opacity={useTitleP}
        >
          Use Skill
        </text>

        {/* Nodes */}
        {useNodes.map((n, i) => (
          <FlowNode key={`dn${i}`} n={n} progress={dNodes[i]} />
        ))}

        {/* Straight arrows */}
        <StraightArrow from={dn[0]} to={dn[1]} label="Install Skill" progress={dArr[0]} />
        <StraightArrow from={dn[1]} to={dn[2]} label="Policy" progress={dArr[1]} />
        <StraightArrow from={dn[2]} to={dn[3]} label="" progress={dArr[2]} />

        {/* Arc: Evidence → Repo  "Allow Download" (above, right-to-left) */}
        <ArcArrow
          fromX={dn[3].x}
          fromY={topEdge(dn[3])}
          toX={dn[1].x}
          toY={topEdge(dn[1])}
          label="Allow Download"
          above
          progress={dArcAllow}
          arcHeight={80}
        />

        {/* Arc: Is signed → Repo  "Block" (below, right-to-left) */}
        <ArcArrow
          fromX={dn[2].x}
          fromY={bottomEdge(dn[2])}
          toX={dn[1].x}
          toY={bottomEdge(dn[1])}
          label="Block"
          above={false}
          progress={dArcBlock}
          arcHeight={70}
        />

        {/* Arc: Customer → Evidence  "[Optional] verification with customer evidence" (above) */}
        <ArcArrow
          fromX={dn[0].x}
          fromY={topEdge(dn[0])}
          toX={dn[3].x}
          toY={topEdge(dn[3])}
          label="[Optional] verification with customer evidence"
          above
          progress={dArcOpt}
          arcHeight={140}
          dimmed
        />
      </svg>
    </AbsoluteFill>
  );
};
